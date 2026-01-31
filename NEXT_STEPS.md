# Next Steps - Database Setup & Migration

## ✅ Completed Steps

1. ✅ **Schema Created** - All Prisma models merged successfully
2. ✅ **Seed File Created** - Comprehensive seed file with:
   - All permissions
   - Role-permission mappings for all 12 roles
   - Default tenant
   - Sample users for all roles
   - Sample store
   - Sample BOGO offers

## 🔧 Required Steps

### Step 1: Ensure Prisma 6 is Installed Locally

The project uses Prisma 6.18.0, but `npm exec` may use Prisma 7. Ensure you're using the correct version:

```bash
cd d:\supplyvalid_projects\@POS\Sandeep\nestjs-pos-backend
npm install prisma@6.18.0 --save-dev
```

### Step 2: Run Database Migration

**Option A: Using Prisma CLI directly (Recommended)**
```bash
# Merge schema first
npm run prisma:merge

# Generate Prisma client
npx prisma@6.18.0 generate

# Create and apply migration
npx prisma@6.18.0 migrate dev --name init_enterprise_pos
```

**Option B: Using local Prisma binary**
```bash
# On Windows PowerShell
npm run prisma:merge
.\node_modules\.bin\prisma.cmd generate
.\node_modules\.bin\prisma.cmd migrate dev --name init_enterprise_pos
```

**Option C: Manual Migration (if above don't work)**
```bash
# 1. Merge schema
npm run prisma:merge

# 2. Generate Prisma client
npm run prisma:generate

# 3. Create migration (if database exists)
npx prisma@6.18.0 migrate dev

# OR if starting fresh:
npx prisma@6.18.0 migrate dev --name init_enterprise_pos
```

### Step 3: Run Seed Script

After migration is complete:

```bash
npm run prisma:seed
```

This will create:
- ✅ All permissions (100+ permissions)
- ✅ Role-permission mappings for all 12 roles
- ✅ Super Admin user (superadmin@pos.com)
- ✅ Sample users for all roles (password: Admin@123)
- ✅ Default tenant
- ✅ Sample store
- ✅ Sample BOGO offers

### Step 4: Verify Setup

1. **Check Database Tables**
   ```bash
   npx prisma@6.18.0 studio
   ```
   This opens Prisma Studio where you can verify all tables are created.

2. **Verify Users Created**
   - Login with: `superadmin@pos.com` / `Admin@123`
   - Check other users in Prisma Studio

3. **Test API Endpoints**
   ```bash
   npm run start:dev
   ```
   Then visit: `http://localhost:3000/api/docs` for Swagger documentation

---

## 📋 Database Tables Created

The migration will create the following tables:

### Core Tables
- ✅ `users` - User accounts
- ✅ `tenants` - Tenant/Brand management
- ✅ `subscriptions` - Subscription tracking
- ✅ `stores` - Store management
- ✅ `products` - Product catalog
- ✅ `categories` - Product categories
- ✅ `orders` - Sales orders
- ✅ `order_items` - Order line items
- ✅ `payments` - Payment records

### Inventory Tables
- ✅ `inventory` - Inventory records
- ✅ `inventory_movements` - Inventory transactions

### Purchase Tables
- ✅ `suppliers` - Supplier/vendor management
- ✅ `purchase_orders` - Purchase orders
- ✅ `purchase_order_items` - PO line items
- ✅ `grns` - Goods Receipt Notes
- ✅ `grn_items` - GRN line items

### BOGO Tables
- ✅ `bogo_offers` - BOGO offers (25 types)
- ✅ `bogo_applications` - BOGO application tracking
- ✅ `bogo_vouchers` - Next-visit vouchers

### POS Tables
- ✅ `kots` - Kitchen Order Tickets
- ✅ `tastings` - Customer tasting tracking

### Permission Tables
- ✅ `permissions` - Permission definitions
- ✅ `role_permissions` - Role-permission mappings
- ✅ `group_permissions` - Group-permission mappings
- ✅ `user_permissions` - User-specific permissions
- ✅ `groups` - User groups
- ✅ `user_groups` - User-group mappings
- ✅ `access_permissions` - Store/region-specific permissions

### Other Tables
- ✅ `customers` - Customer management
- ✅ `loyalty_programs` - Loyalty program config
- ✅ `loyalty_transactions` - Loyalty points
- ✅ `audit_logs` - Audit trail
- ✅ `sync_logs` - Sync tracking

---

## 🔑 Default Credentials

### Super Admin
- **Email**: `superadmin@pos.com`
- **Password**: `Admin@123`
- **Role**: SUPER_ADMIN

### Other Users (All use password: `Admin@123`)
- Tenant Admin: `tenantadmin@pos.com`
- Store Admin: `storeadmin@pos.com`
- Store Manager: `storemanager@pos.com`
- Cashier: `cashier@pos.com`
- Kitchen Staff: `kitchen@pos.com`
- Inventory Manager: `inventory@pos.com`
- Purchase Manager: `purchase@pos.com`
- Accountant: `accountant@pos.com`
- Support Staff: `support@pos.com`
- System Auditor: `auditor@pos.com`
- HR Manager: `hr@pos.com`

---

## 🚨 Troubleshooting

### Issue: Prisma CLI Version Mismatch

**Problem**: `npm exec prisma` uses Prisma 7, but project uses Prisma 6.

**Solution**: Use version-specific command:
```bash
npx prisma@6.18.0 migrate dev
```

### Issue: Database Connection Error

**Problem**: Cannot connect to PostgreSQL.

**Solution**: 
1. Ensure PostgreSQL is running
2. Check connection string in `prisma/schema.prisma`
3. Update DATABASE_URL in `.env` file if needed

### Issue: Migration Fails

**Problem**: Migration fails with errors.

**Solution**:
1. Check if database exists: `CREATE DATABASE "pos-backend";`
2. Ensure user has proper permissions
3. Try resetting: `npx prisma@6.18.0 migrate reset` (⚠️ This deletes all data)

### Issue: Seed Script Fails

**Problem**: Seed script throws errors.

**Solution**:
1. Ensure migration completed successfully
2. Check database connection
3. Verify all tables exist
4. Check console for specific error messages

---

## 📝 Environment Variables

Ensure your `.env` file has:

```env
DATABASE_URL="postgresql://postgres:12345@localhost:5432/pos-backend?schema=public"
JWT_SECRET="your-secret-key-here"
PORT=3000
```

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Database migration completed successfully
- [ ] Prisma client generated (`node_modules/.prisma/client`)
- [ ] Seed script ran without errors
- [ ] All tables exist in database
- [ ] Super Admin user can login
- [ ] API server starts without errors
- [ ] Swagger docs accessible at `/api/docs`
- [ ] All 12 roles have users created
- [ ] Permissions and role mappings created

---

## 🎯 Next Actions After Setup

1. **Test APIs** - Use Swagger at `/api/docs` to test endpoints
2. **Frontend Integration** - Update sv-capital-admin-ui with new APIs
3. **Create Products** - Add products and categories
4. **Create Stores** - Add more stores if needed
5. **Configure BOGO Offers** - Create BOGO offers for your products
6. **Set Up Permissions** - Fine-tune role permissions as needed

---

**Status**: Ready for Migration
**Last Updated**: January 31, 2026
