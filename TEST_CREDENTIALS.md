# Car360 Admin Application - Test Credentials

## Overview
The database has been seeded with test data for all user types. Use these credentials to test the application.

## Test Accounts

### Super Admin
- **Email:** superadmin@car360.com
- **Password:** SuperAdmin123
- **Access:** Full system access, can create admins and manage all dealers

### Regular Admins
1. **Admin 1:**
   - Email: admin1@car360.com
   - Password: Admin123

2. **Admin 2:**
   - Email: admin2@car360.com
   - Password: Admin123

### Car Dealers
1. **Elite Auto Sales (Mumbai)**
   - Email: dealer1@car360.com
   - Password: Dealer123
   - Contact: +91-9876543210, Mumbai, India
   - Vehicles: 3 (Mercedes-Benz C-Class, BMW 3 Series, Audi A4)

2. **Premium Motors (Delhi)**
   - Email: dealer2@car360.com
   - Password: Dealer123
   - Contact: +91-9876543211, Delhi, India
   - Vehicles: 2 (Honda City, Toyota Fortuner)

3. **Luxury Car Hub (Bangalore)**
   - Email: dealer3@car360.com
   - Password: Dealer123
   - Contact: +91-9876543212, Bangalore, India
   - Vehicles: 4 (Jaguar XE, Range Rover Evoque, Volvo XC90, Porsche Macan)

### Customers
1. **Rajesh Kumar**
   - Email: customer1@gmail.com
   - Password: Customer123
   - Plan: Prepaid
   - Balance: ₹5,000

2. **Priya Sharma**
   - Email: customer2@gmail.com
   - Password: Customer123
   - Plan: Prepaid
   - Balance: ₹3,500

3. **Amit Patel**
   - Email: customer3@gmail.com
   - Password:    
   - Plan: Postpaid
   - Balance: ₹8,000

4. **Neha Singh**
   - Email: customer4@gmail.com
   - Password: Customer123
   - Plan: Prepaid
   - Balance: ₹1,200

5. **Vikram Reddy**
   - Email: customer5@gmail.com
   - Password: Customer123
   - Plan: Postpaid
   - Balance: ₹12,000

## Admin Panel Routes
- `/admin_panel` - Admin Dashboard
- `/admin_panel/analytics` - Analytics Dashboard
- `/admin_panel/create_admin` - Create New Admin
- `/admin_panel/create_dealers_account` - Create Dealer Account
- `/admin_panel/manage_dealers` - Manage All Dealers
- `/admin_panel/seed-database` - Database Seeding Tool

## Dealer Panel Routes
- `/dealersPanel` - Dealer Dashboard
- `/dealersPanel/Authenticate` - Login Page
- `/dealersPanel/Manage_Vehicles` - View All Vehicles
- `/dealersPanel/add_vehicle` - Add New Vehicle
- `/dealersPanel/Settings` - Theme Settings

## Test Data Summary
- **Total Admins:** 3 (1 Super Admin + 2 Regular Admins)
- **Total Dealers:** 3
- **Total Vehicles:** 9
- **Total Customers:** 5
- **Sample Transactions:** Multiple credit/debit transactions for each customer
- **Sample Payments:** PhonePe and manual payment records

## Features Implemented
1. ✅ User Authentication (Admin, Dealer, Customer roles)
2. ✅ Admin Dashboard with statistics
3. ✅ Dealer Management (View, Create)
4. ✅ Vehicle Management (Add, View, Edit, Delete)
5. ✅ Credit System (Prepaid/Postpaid plans)
6. ✅ Payment Integration (PhonePe webhook handling)
7. ✅ Analytics Dashboard (Revenue, Users, Transactions)
8. ✅ Zoho Invoicing Integration
9. ✅ Loading States on all pages
10. ✅ Error Handling on all pages
11. ✅ Empty State Messages

## Testing Instructions
1. Start with Super Admin login to see full system
2. Test creating a new admin or dealer account
3. Login as a dealer to view/manage vehicles
4. Check Analytics page to see transaction data
5. Verify all tables show loading states initially
6. Check error handling by testing with network offline
