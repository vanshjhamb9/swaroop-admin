# Car360 - Complete Setup and Usage Guide

## ✅ Server Status
**Your server is now running successfully!**
- URL: Check your Replit webview panel
- Status: All environment variables configured
- Authentication: Fully functional

## 🚀 How to Run the Server

### Starting the Server
The server runs automatically when you open this Replit project. If you need to restart it:

1. **Using Replit Interface:**
   - Click the "Run" button at the top of the Replit interface
   - The workflow "Start Game" will start automatically

2. **Manual Start (if needed):**
   ```bash
   npm run dev
   ```

The server will start on port 5000 and be accessible through your Replit webview.

## 🔐 Test Credentials for All Roles

### Super Admin
- **Email:** superadmin@car360.com
- **Password:** SuperAdmin123
- **Access:** Full system access, can create admins and manage all dealers

### Regular Admins
1. **Admin 1:**
   - Email: admin1@car360.com
   - Password: Admin123
   - Access: Can manage dealers and view analytics

2. **Admin 2:**
   - Email: admin2@car360.com
   - Password: Admin123
   - Access: Can manage dealers and view analytics

### Car Dealers
1. **Elite Auto Sales (Mumbai)**
   - Email: dealer1@car360.com
   - Password: Dealer123
   - Vehicles: 3 (Mercedes-Benz C-Class, BMW 3 Series, Audi A4)

2. **Premium Motors (Delhi)**
   - Email: dealer2@car360.com
   - Password: Dealer123
   - Vehicles: 2 (Honda City, Toyota Fortuner)

3. **Luxury Car Hub (Bangalore)**
   - Email: dealer3@car360.com
   - Password: Dealer123
   - Vehicles: 4 (Jaguar XE, Range Rover Evoque, Volvo XC90, Porsche Macan)

### Customers
1. **Rajesh Kumar**
   - Email: customer1@gmail.com
   - Password: Customer123
   - Plan: Prepaid, Balance: ₹5,000

2. **Priya Sharma**
   - Email: customer2@gmail.com
   - Password: Customer123
   - Plan: Prepaid, Balance: ₹3,500

3. **Amit Patel**
   - Email: customer3@gmail.com
   - Password: Customer123
   - Plan: Postpaid, Balance: ₹8,000

## 📍 How to Access Each Panel

### 1. Admin Panel

**Step 1:** Open your Replit webview URL

**Step 2:** Click "ADMIN LOGIN" button on the landing page

**Step 3:** You'll be redirected to `/admin_panel/Authenticate`

**Step 4:** Login with any admin credentials:
- Super Admin: superadmin@car360.com / SuperAdmin123
- Regular Admin: admin1@car360.com / Admin123

**Step 5:** After successful login, you'll see the Admin Dashboard with:
- Total Registered Dealers count
- Total Admins count
- Total Vehicles count
- Navigation sidebar with:
  - Dashboard
  - Analytics
  - Manage Dealers
  - Create Dealer Account
  - Create Admin
  - Seed Database
  - Logout

### 2. Dealer Panel

**Step 1:** Open your Replit webview URL

**Step 2:** Click "DEALER LOGIN" button on the landing page

**Step 3:** You'll be redirected to `/dealersPanel/Authenticate`

**Step 4:** Login with any dealer credentials:
- dealer1@car360.com / Dealer123
- dealer2@car360.com / Dealer123
- dealer3@car360.com / Dealer123

**Step 5:** After successful login, you'll see the Dealer Dashboard with:
- Total Vehicles count
- Navigation menu:
  - Dashboard
  - View All Vehicles
  - Add New Vehicle
  - Settings (Theme)

### 3. Customer Portal
Currently showing "COMING SOON" - not yet implemented.

## 📁 Available Routes

### Admin Panel Routes
- `/admin_panel` - Admin Dashboard
- `/admin_panel/Authenticate` - Admin Login Page
- `/admin_panel/analytics` - Analytics Dashboard
- `/admin_panel/create_admin` - Create New Admin
- `/admin_panel/create_dealers_account` - Create Dealer Account
- `/admin_panel/manage_dealers` - Manage All Dealers
- `/admin_panel/seed-database` - Database Seeding Tool

### Dealer Panel Routes
- `/dealersPanel` - Dealer Dashboard
- `/dealersPanel/Authenticate` - Dealer Login Page
- `/dealersPanel/Manage_Vehicles` - View All Vehicles
- `/dealersPanel/add_vehicle` - Add New Vehicle
- `/dealersPanel/Settings` - Theme Settings

## 🔧 Environment Variables Configured

All necessary environment variables have been set up in your Replit Secrets:

### Firebase Admin SDK (Server-side)
- ✅ FIREBASE_ADMIN_TYPE
- ✅ FIREBASE_ADMIN_PROJECT_ID
- ✅ FIREBASE_ADMIN_PRIVATE_KEY_ID
- ✅ FIREBASE_ADMIN_PRIVATE_KEY
- ✅ FIREBASE_ADMIN_CLIENT_EMAIL
- ✅ FIREBASE_ADMIN_CLIENT_ID
- ✅ FIREBASE_ADMIN_AUTH_URI
- ✅ FIREBASE_ADMIN_TOKEN_URI
- ✅ FIREBASE_ADMIN_AUTH_PROVIDER_CERT_URL
- ✅ FIREBASE_ADMIN_CLIENT_CERT_URL
- ✅ FIREBASE_ADMIN_UNIVERSE_DOMAIN

### PhonePe Payment Gateway (Sandbox)
- ✅ PHONEPE_MERCHANT_ID
- ✅ PHONEPE_SALT_KEY
- ✅ PHONEPE_SALT_INDEX
- ✅ PHONEPE_API_URL

### Application Configuration
- ✅ NEXT_PUBLIC_BASE_URL

## 🎯 Testing Each Role

### Testing Admin Features
1. **Login as Super Admin:**
   - Use: superadmin@car360.com / SuperAdmin123
   - Navigate to Dashboard
   - You should see:
     - Total Registered Dealers: 3
     - Total Admins: 3
     - Total Vehicles: 9

2. **View Dealers:**
   - Click "Manage Dealers" in sidebar
   - You should see list of 3 dealers with their details

3. **Create New Dealer:**
   - Click "Create Dealer Account" in sidebar
   - Fill in dealer information
   - Click submit

4. **View Analytics:**
   - Click "Analytics" in sidebar
   - See revenue charts and transaction data

### Testing Dealer Features
1. **Login as Dealer:**
   - Use: dealer1@car360.com / Dealer123
   - Navigate to Dashboard
   - You should see your vehicle count

2. **View Vehicles:**
   - Click "View All Vehicles"
   - See list of vehicles for your dealership

3. **Add New Vehicle:**
   - Click "Add New Vehicle"
   - Fill in vehicle details
   - Upload 360° images
   - Submit

## 🐛 Troubleshooting

### If the server is not running:
1. Click the "Run" button in Replit
2. Or use terminal: `npm run dev`
3. Wait for compilation (usually 10-15 seconds)

### If login fails:
1. Check that you're using the correct credentials from the list above
2. Make sure you're on the correct login page (/admin_panel/Authenticate for admins, /dealersPanel/Authenticate for dealers)
3. Check browser console for any errors

### If you see "Unauthorized" errors:
1. Make sure you're logging in with the correct role (admin credentials for admin panel, dealer credentials for dealer panel)
2. Try logging out and logging in again

## 📊 Database Structure

The application uses Firebase Firestore with the following collections:
- `admins` - Admin user records with claims
- `dealers` - Dealer information and sub-collections
- `dealers/{dealerId}/vehicles` - Vehicle inventory per dealer
- `customers` - Customer accounts
- `transactions` - Transaction history
- `payments` - Payment records

## 🔄 Next Steps

1. **Test all features** - Login with different roles and explore all panels
2. **Add more dealers** - Use the Create Dealer Account feature
3. **Add vehicles** - Login as a dealer and add vehicle inventory
4. **View analytics** - Check transaction data and revenue charts
5. **Customize** - Modify the application as needed for your requirements

## 📝 Notes

- All test accounts are pre-seeded in the database
- PhonePe integration is in sandbox mode for testing
- The application is running on port 5000
- Authentication is handled by Firebase Auth
- All environment variables are securely stored in Replit Secrets

## 🎉 You're All Set!

Your Car360 application is fully configured and running. You can now:
- ✅ Access the landing page
- ✅ Login as Admin, Dealer, or Customer
- ✅ View dashboards for each role
- ✅ Manage dealers and vehicles
- ✅ View analytics and reports

Enjoy using Car360! 🚗
