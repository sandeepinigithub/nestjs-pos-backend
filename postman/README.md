# Postman Collection for Enterprise POS API

## 📦 Files Included

1. **Enterprise_POS_API.postman_collection.json** - Complete API collection
2. **Enterprise_POS_Environment.postman_environment.json** - Environment variables

## 🚀 Quick Start

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select `Enterprise_POS_API.postman_collection.json`
4. Click **Import**

### 2. Import Environment
1. Click **Environments** in left sidebar
2. Click **Import**
3. Select `Enterprise_POS_Environment.postman_environment.json`
4. Click **Import**
5. Select the environment from dropdown (top right)

### 3. Login First
1. Go to **Authentication** folder
2. Run **Login - Super Admin** request
3. Token will be automatically saved to environment

## 🔑 Default Credentials

All users use password: `Admin@123`

### Super Admin
- **Email**: `superadmin@pos.com`
- **Password**: `Admin@123`
- **Access**: Full system access

### Tenant Admin
- **Email**: `tenantadmin@pos.com`
- **Password**: `Admin@123`
- **Access**: Tenant management

### Store Admin
- **Email**: `storeadmin@pos.com`
- **Password**: `Admin@123`
- **Access**: Store management

### Cashier
- **Email**: `cashier@pos.com`
- **Password**: `Admin@123`
- **Access**: POS operations

### Other Users
- **Inventory Manager**: `inventory@pos.com`
- **Purchase Manager**: `purchase@pos.com`
- **Accountant**: `accountant@pos.com`
- **Kitchen Staff**: `kitchen@pos.com`
- **Store Manager**: `storemanager@pos.com`
- **Support Staff**: `support@pos.com`
- **System Auditor**: `auditor@pos.com`
- **HR Manager**: `hr@pos.com`

## 📋 API Endpoints Included

### Authentication
- ✅ Login (Super Admin, Tenant Admin, Store Admin, Cashier)
- ✅ Auto-saves JWT token to environment

### Tenants
- ✅ Create Tenant
- ✅ Get All Tenants
- ✅ Get Tenant by ID
- ✅ Update Tenant

### Inventory
- ✅ Get Inventory Dashboard
- ✅ Get Inventory Value
- ✅ Get Stock on Hand
- ✅ Get Stock Alerts
- ✅ Get Movement Analysis

### Purchases
- ✅ Get Purchase Dashboard
- ✅ Get Purchase Summary
- ✅ Get Open Purchase Orders

### Sales
- ✅ Get Sales Dashboard
- ✅ Get Sales Metrics
- ✅ Hold Order
- ✅ Resume Order
- ✅ Process Payment
- ✅ Create KOT

### BOGO Offers
- ✅ Create BOGO Offer (Buy X Get X Same)
- ✅ Create BOGO Offer (Buy X Get Y Different)
- ✅ Create BOGO Offer (Time Based)
- ✅ Get All BOGO Offers
- ✅ Get Eligible BOGO Offers
- ✅ Apply BOGO Offer
- ✅ Redeem BOGO Voucher

### Users
- ✅ Get All Users
- ✅ Get User by ID

### Stores
- ✅ Get All Stores

## 🔧 Environment Variables

The collection uses these environment variables:

- `base_url` - API base URL (default: http://localhost:3000)
- `access_token` - JWT token (auto-populated after login)
- `user_id` - Current user ID (auto-populated after login)
- `user_role` - Current user role (auto-populated after login)
- `tenant_id` - Tenant ID (set manually)
- `store_id` - Store ID (set manually)
- `order_id` - Order ID (set manually)
- `product_id` - Product ID (set manually)
- `bogo_offer_id` - BOGO Offer ID (set manually)
- `customer_id` - Customer ID (set manually)
- `voucher_code` - Voucher code (set manually)

## 📝 Usage Tips

1. **Always login first** - Run a login request to get the JWT token
2. **Set IDs manually** - After creating resources, copy IDs to environment variables
3. **Check responses** - Some requests auto-populate environment variables
4. **Use filters** - Many endpoints support query parameters for filtering

## 🎯 Example Workflow

1. **Login** → Get token
2. **Get Stores** → Copy store_id to environment
3. **Get Products** → Copy product_id to environment
4. **Create Order** → Copy order_id to environment
5. **Get Eligible BOGO** → See available offers
6. **Apply BOGO** → Apply offer to order
7. **Process Payment** → Complete order

## 🔒 Security Notes

- Tokens are stored in environment variables (not in collection)
- Never commit environment files with real tokens
- Use different environments for dev/staging/production
- Change default passwords in production

## 📚 Additional Resources

- Swagger Documentation: `http://localhost:3000/api/docs`
- API Base URL: `http://localhost:3000/api`

---

**Created**: January 31, 2026
**Version**: 1.0.0
