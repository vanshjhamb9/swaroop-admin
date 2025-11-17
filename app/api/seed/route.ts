import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '../firebaseadmin';
import * as admin from 'firebase-admin';

const seedData = {
  superAdmin: {
    uid: 'bpzPUAg2wLZz4eljAwGFyZ0f6yF2',
    email: 'superadmin@car360.com',
    name: 'Super Admin',
    password: 'SuperAdmin123',
  },
  admins: [
    {
      email: 'admin1@car360.com',
      name: 'John Administrator',
      password: 'Admin123',
    },
    {
      email: 'admin2@car360.com',
      name: 'Sarah Admin',
      password: 'Admin123',
    },
  ],
  dealers: [
    {
      email: 'dealer1@car360.com',
      name: 'Elite Auto Sales',
      password: 'Dealer123',
      contactDetails: '+91-9876543210, Mumbai, India',
      vehicles: [
        {
          name: 'Mercedes-Benz C-Class',
          model: 'C 220d',
          registration: 'MH-02-AB-1234',
        },
        {
          name: 'BMW 3 Series',
          model: '320d Sport',
          registration: 'MH-02-CD-5678',
        },
        {
          name: 'Audi A4',
          model: 'Premium Plus',
          registration: 'MH-02-EF-9012',
        },
      ],
    },
    {
      email: 'dealer2@car360.com',
      name: 'Premium Motors',
      password: 'Dealer123',
      contactDetails: '+91-9876543211, Delhi, India',
      vehicles: [
        {
          name: 'Honda City',
          model: 'VX CVT',
          registration: 'DL-01-AB-1111',
        },
        {
          name: 'Toyota Fortuner',
          model: 'Legender 4x4',
          registration: 'DL-01-CD-2222',
        },
      ],
    },
    {
      email: 'dealer3@car360.com',
      name: 'Luxury Car Hub',
      password: 'Dealer123',
      contactDetails: '+91-9876543212, Bangalore, India',
      vehicles: [
        {
          name: 'Jaguar XE',
          model: 'S Diesel',
          registration: 'KA-03-AB-3333',
        },
        {
          name: 'Range Rover Evoque',
          model: 'SE Diesel',
          registration: 'KA-03-CD-4444',
        },
        {
          name: 'Volvo XC90',
          model: 'D5 Inscription',
          registration: 'KA-03-EF-5555',
        },
        {
          name: 'Porsche Macan',
          model: 'S Diesel',
          registration: 'KA-03-GH-6666',
        },
      ],
    },
  ],
  customers: [
    {
      email: 'customer1@gmail.com',
      name: 'Rajesh Kumar',
      password: 'Customer123',
      planType: 'prepaid' as const,
      creditBalance: 5000,
    },
    {
      email: 'customer2@gmail.com',
      name: 'Priya Sharma',
      password: 'Customer123',
      planType: 'prepaid' as const,
      creditBalance: 3500,
    },
    {
      email: 'customer3@gmail.com',
      name: 'Amit Patel',
      password: 'Customer123',
      planType: 'postpaid' as const,
      creditBalance: 8000,
    },
    {
      email: 'customer4@gmail.com',
      name: 'Neha Singh',
      password: 'Customer123',
      planType: 'prepaid' as const,
      creditBalance: 1200,
    },
    {
      email: 'customer5@gmail.com',
      name: 'Vikram Reddy',
      password: 'Customer123',
      planType: 'postpaid' as const,
      creditBalance: 12000,
    },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const results: any = {
      superAdmin: null,
      admins: [],
      dealers: [],
      customers: [],
      payments: [],
      errors: [],
    };

    console.log('Starting database seeding...');

    console.log('Creating Super Admin...');
    try {
      const superAdminUser = await adminAuth.createUser({
        uid: seedData.superAdmin.uid,
        email: seedData.superAdmin.email,
        password: seedData.superAdmin.password,
        displayName: seedData.superAdmin.name,
      });
      await adminAuth.setCustomUserClaims(superAdminUser.uid, { admin: true });
      await adminFirestore.collection('admins').doc(superAdminUser.uid).set({
        name: seedData.superAdmin.name,
        email: seedData.superAdmin.email,
        createdAt: admin.firestore.Timestamp.now(),
      });
      results.superAdmin = { email: seedData.superAdmin.email, status: 'created' };
    } catch (error: any) {
      if (error.code === 'auth/uid-already-exists' || error.code === 'auth/email-already-exists') {
        results.superAdmin = { email: seedData.superAdmin.email, status: 'already exists' };
      } else {
        results.errors.push(`Super Admin: ${error.message}`);
      }
    }

    console.log('Creating Admins...');
    for (const adminData of seedData.admins) {
      try {
        const adminUser = await adminAuth.createUser({
          email: adminData.email,
          password: adminData.password,
          displayName: adminData.name,
        });
        await adminAuth.setCustomUserClaims(adminUser.uid, { admin: true });
        await adminFirestore.collection('admins').doc(adminUser.uid).set({
          name: adminData.name,
          email: adminData.email,
          createdAt: admin.firestore.Timestamp.now(),
        });
        results.admins.push({ email: adminData.email, status: 'created' });
      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
          results.admins.push({ email: adminData.email, status: 'already exists' });
        } else {
          results.errors.push(`Admin ${adminData.email}: ${error.message}`);
        }
      }
    }

    console.log('Creating Dealers and Vehicles...');
    for (const dealerData of seedData.dealers) {
      try {
        const dealerUser = await adminAuth.createUser({
          email: dealerData.email,
          password: dealerData.password,
          displayName: dealerData.name,
        });
        await adminAuth.setCustomUserClaims(dealerUser.uid, { dealeradmin: true });

        await adminFirestore.collection('dealers').doc(dealerUser.uid).set({
          name: dealerData.name,
          email: dealerData.email,
          contactDetails: dealerData.contactDetails,
          createdAt: admin.firestore.Timestamp.now(),
        });

        for (const vehicle of dealerData.vehicles) {
          const vehicleRef = adminFirestore
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
        }

        results.dealers.push({
          email: dealerData.email,
          status: 'created',
          vehicles: dealerData.vehicles.length,
        });
      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
          results.dealers.push({ email: dealerData.email, status: 'already exists' });
        } else {
          results.errors.push(`Dealer ${dealerData.email}: ${error.message}`);
        }
      }
    }

    console.log('Creating Customers with Credit System...');
    for (const customerData of seedData.customers) {
      try {
        const customerUser = await adminAuth.createUser({
          email: customerData.email,
          password: customerData.password,
          displayName: customerData.name,
        });

        await adminFirestore.collection('users').doc(customerUser.uid).set({
          userId: customerUser.uid,
          name: customerData.name,
          email: customerData.email,
          role: 'customer',
          planType: customerData.planType,
          creditBalance: customerData.creditBalance,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });

        const numTransactions = Math.floor(Math.random() * 3) + 3;
        let currentBalance = 0;
        let paymentsCreated = 0;

        for (let i = 0; i < numTransactions; i++) {
          const isCredit = Math.random() > 0.3;
          const amount = Math.floor(Math.random() * 3000) + 500;

          if (isCredit) {
            currentBalance += amount;

            const paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            paymentsCreated++;

            const paymentDoc = {
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

            await adminFirestore.collection('payments').doc(paymentId).set(paymentDoc);

            const transactionRef = adminFirestore
              .collection('users')
              .doc(customerUser.uid)
              .collection('transactions')
              .doc();

            await transactionRef.set({
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
            });
          } else {
            if (currentBalance >= amount) {
              currentBalance -= amount;

              const transactionRef = adminFirestore
                .collection('users')
                .doc(customerUser.uid)
                .collection('transactions')
                .doc();

              await transactionRef.set({
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
              });
            }
          }
        }

        await adminFirestore.collection('users').doc(customerUser.uid).update({
          creditBalance: customerData.creditBalance,
          updatedAt: admin.firestore.Timestamp.now(),
        });

        results.customers.push({
          email: customerData.email,
          status: 'created',
          transactions: numTransactions,
          payments: paymentsCreated,
        });
      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
          results.customers.push({ email: customerData.email, status: 'already exists' });
        } else {
          results.errors.push(`Customer ${customerData.email}: ${error.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      results,
      credentials: {
        superAdmin: `${seedData.superAdmin.email} / ${seedData.superAdmin.password}`,
        admin: `${seedData.admins[0].email} / ${seedData.admins[0].password}`,
        dealer: `${seedData.dealers[0].email} / ${seedData.dealers[0].password}`,
        customer: `${seedData.customers[0].email} / ${seedData.customers[0].password}`,
      },
    });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed database',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
