import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

const serviceAccount = {
  type: process.env.FIREBASE_ADMIN_TYPE,
  project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
  private_key_id: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
  auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
  token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
  universe_domain: process.env.FIREBASE_ADMIN_UNIVERSE_DOMAIN,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
  });
}

const db = admin.firestore();
const auth = admin.auth();

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: admin.firestore.Timestamp;
  balanceAfter: number;
  metadata?: {
    paymentId?: string;
    invoiceId?: string;
    source?: string;
  };
}

interface Payment {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  paymentMethod: 'phonepe' | 'manual';
  phonePeTransactionId?: string;
  phonePeMerchantTransactionId?: string;
  zohoInvoiceId?: string;
  timestamp: admin.firestore.Timestamp;
  webhookData?: any;
}

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...\n');

    const seedDataPath = path.join(__dirname, 'seed-data.json');
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

    console.log('1️⃣  Creating Super Admin...');
    try {
      const superAdminUser = await auth.createUser({
        uid: seedData.superAdmin.uid,
        email: seedData.superAdmin.email,
        password: seedData.superAdmin.password,
        displayName: seedData.superAdmin.name,
      });
      await auth.setCustomUserClaims(superAdminUser.uid, { admin: true });
      await db.collection('admins').doc(superAdminUser.uid).set({
        name: seedData.superAdmin.name,
        email: seedData.superAdmin.email,
        createdAt: admin.firestore.Timestamp.now(),
      });
      console.log(`   ✅ Super Admin created: ${seedData.superAdmin.email}`);
    } catch (error: any) {
      if (error.code === 'auth/uid-already-exists') {
        console.log(`   ⚠️  Super Admin already exists: ${seedData.superAdmin.email}`);
      } else {
        throw error;
      }
    }

    console.log('\n2️⃣  Creating Admins...');
    for (const adminData of seedData.admins) {
      try {
        const adminUser = await auth.createUser({
          email: adminData.email,
          password: adminData.password,
          displayName: adminData.name,
        });
        await auth.setCustomUserClaims(adminUser.uid, { admin: true });
        await db.collection('admins').doc(adminUser.uid).set({
          name: adminData.name,
          email: adminData.email,
          createdAt: admin.firestore.Timestamp.now(),
        });
        console.log(`   ✅ Admin created: ${adminData.email}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`   ⚠️  Admin already exists: ${adminData.email}`);
        } else {
          console.error(`   ❌ Error creating admin ${adminData.email}:`, error.message);
        }
      }
    }

    console.log('\n3️⃣  Creating Dealers and Vehicles...');
    for (const dealerData of seedData.dealers) {
      try {
        const dealerUser = await auth.createUser({
          email: dealerData.email,
          password: dealerData.password,
          displayName: dealerData.name,
        });
        await auth.setCustomUserClaims(dealerUser.uid, { dealeradmin: true });

        await db.collection('dealers').doc(dealerUser.uid).set({
          name: dealerData.name,
          email: dealerData.email,
          contactDetails: dealerData.contactDetails,
          createdAt: admin.firestore.Timestamp.now(),
        });

        console.log(`   ✅ Dealer created: ${dealerData.email}`);

        for (const vehicle of dealerData.vehicles) {
          const vehicleRef = db
            .collection('dealers')
            .doc(dealerUser.uid)
            .collection('vehicles')
            .doc();
          
          await vehicleRef.set({
            name: vehicle.name,
            model: vehicle.model,
            registration: vehicle.registration,
            images: [],
            createdAt: admin.firestore.Timestamp.now(),
          });
          console.log(`      🚗 Vehicle added: ${vehicle.name} (${vehicle.registration})`);
        }
      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`   ⚠️  Dealer already exists: ${dealerData.email}`);
        } else {
          console.error(`   ❌ Error creating dealer ${dealerData.email}:`, error.message);
        }
      }
    }

    console.log('\n4️⃣  Creating Customers with Credit System...');
    const paymentIds: string[] = [];
    
    for (const customerData of seedData.customers) {
      try {
        const customerUser = await auth.createUser({
          email: customerData.email,
          password: customerData.password,
          displayName: customerData.name,
        });

        await db.collection('users').doc(customerUser.uid).set({
          userId: customerUser.uid,
          name: customerData.name,
          email: customerData.email,
          role: 'customer',
          planType: customerData.planType,
          creditBalance: customerData.creditBalance,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });

        console.log(`   ✅ Customer created: ${customerData.email} (${customerData.planType}, ₹${customerData.creditBalance})`);

        const numTransactions = Math.floor(Math.random() * 3) + 3;
        let currentBalance = 0;

        for (let i = 0; i < numTransactions; i++) {
          const isCredit = Math.random() > 0.3;
          const amount = Math.floor(Math.random() * 3000) + 500;
          
          if (isCredit) {
            currentBalance += amount;
            
            const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            paymentIds.push(paymentId);
            
            const paymentDoc: Payment = {
              id: paymentId,
              userId: customerUser.uid,
              amount: amount,
              status: 'success',
              paymentMethod: Math.random() > 0.5 ? 'phonepe' : 'manual',
              phonePeTransactionId: `PHONEPE_${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
              phonePeMerchantTransactionId: `MERCHANT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              zohoInvoiceId: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              timestamp: admin.firestore.Timestamp.fromDate(
                new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
              ),
            };
            
            await db.collection('payments').doc(paymentId).set(paymentDoc);

            const transactionRef = db
              .collection('users')
              .doc(customerUser.uid)
              .collection('transactions')
              .doc();

            const transaction: Transaction = {
              id: transactionRef.id,
              type: 'credit',
              amount: amount,
              description: 'Credit added via PhonePe',
              timestamp: paymentDoc.timestamp,
              balanceAfter: currentBalance,
              metadata: {
                paymentId: paymentId,
                invoiceId: paymentDoc.zohoInvoiceId,
                source: paymentDoc.paymentMethod,
              },
            };

            await transactionRef.set(transaction);
          } else {
            if (currentBalance >= amount) {
              currentBalance -= amount;
              
              const transactionRef = db
                .collection('users')
                .doc(customerUser.uid)
                .collection('transactions')
                .doc();

              const transaction: Transaction = {
                id: transactionRef.id,
                type: 'debit',
                amount: amount,
                description: 'Vehicle inspection service',
                timestamp: admin.firestore.Timestamp.fromDate(
                  new Date(Date.now() - Math.floor(Math.random() * 20 * 24 * 60 * 60 * 1000))
                ),
                balanceAfter: currentBalance,
                metadata: {
                  source: 'service',
                },
              };

              await transactionRef.set(transaction);
            }
          }
        }

        await db.collection('users').doc(customerUser.uid).update({
          creditBalance: customerData.creditBalance,
          updatedAt: admin.firestore.Timestamp.now(),
        });

        console.log(`      💳 ${numTransactions} transactions created`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`   ⚠️  Customer already exists: ${customerData.email}`);
        } else {
          console.error(`   ❌ Error creating customer ${customerData.email}:`, error.message);
        }
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - 1 Super Admin`);
    console.log(`   - ${seedData.admins.length} Admins`);
    console.log(`   - ${seedData.dealers.length} Dealers`);
    console.log(`   - ${seedData.dealers.reduce((sum: number, d: any) => sum + d.vehicles.length, 0)} Vehicles`);
    console.log(`   - ${seedData.customers.length} Customers`);
    console.log(`   - ${paymentIds.length} Payments`);
    console.log('\n🔑 Login Credentials:');
    console.log(`   Super Admin: ${seedData.superAdmin.email} / ${seedData.superAdmin.password}`);
    console.log(`   Admin: ${seedData.admins[0].email} / ${seedData.admins[0].password}`);
    console.log(`   Dealer: ${seedData.dealers[0].email} / ${seedData.dealers[0].password}`);
    console.log(`   Customer: ${seedData.customers[0].email} / ${seedData.customers[0].password}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedData();
