# Enterprise POS Implementation Phases

## Overview
This document outlines the phased implementation plan for the Enterprise POS system with comprehensive role-based access control (RBAC).

---

## Phase 1: User Management ✅ (COMPLETED)

### Database Schema Updates
- ✅ Updated `UserRole` enum with all roles:
  - SUPER_ADMIN (Platform Admin)
  - TENANT_ADMIN (Tenant Admin/Brand)
  - STORE_ADMIN (Store Admin)
  - STORE_MANAGER
  - CASHIER
  - KITCHEN_STAFF (KDS)
  - INVENTORY_MANAGER
  - PURCHASE_MANAGER
  - ACCOUNTANT
  - SUPPORT_STAFF
  - SYSTEM_AUDITOR
  - HR_MANAGER

- ✅ Created `Tenant` model for multi-tenant support
- ✅ Created `Subscription` model for subscription management
- ✅ Updated `User` model with `tenantId` field
- ✅ Updated `Store` model with `tenantId` field
- ✅ Created `RolePermission` model for direct role-to-permission mapping
- ✅ Extended `PermissionResource` enum with all module permissions
- ✅ Created `PermissionModule` enum for module categorization

### APIs Created
- ✅ Tenant CRUD APIs (`/api/tenants`)
  - POST `/api/tenants` - Create tenant (SuperAdmin only)
  - GET `/api/tenants` - List all tenants with pagination
  - GET `/api/tenants/:id` - Get tenant by ID
  - PUT `/api/tenants/:id` - Update tenant
  - DELETE `/api/tenants/:id` - Delete tenant
  - GET `/api/tenants/:id/stats` - Get tenant statistics

### Next Steps for Phase 1
- [ ] Create seed data for default roles and permissions
- [ ] Create permission assignment service
- [ ] Update user service to handle tenant assignment
- [ ] Create role-based permission checking middleware

---

## Phase 2: Inventory Management (PENDING)

### Required Features
- Inventory Manager role permissions
- Dashboard metrics:
  - Total inventory value (store-wise / category-wise)
  - Stock on hand (SKU, product, variant)
  - Low-stock & out-of-stock indicators
  - Fast-moving vs slow-moving items
  - Expiry alerts (if applicable)
  - Stock aging (days in inventory)
  - Reorder level vs current stock
  - Damaged / blocked stock (read-only)

### APIs to Create
- GET `/api/inventory/dashboard` - Inventory dashboard metrics
- GET `/api/inventory/value` - Total inventory value
- GET `/api/inventory/stock-on-hand` - Stock on hand details
- GET `/api/inventory/alerts` - Low stock and out-of-stock alerts
- GET `/api/inventory/movement-analysis` - Fast/slow moving items
- GET `/api/inventory/expiry-alerts` - Expiry alerts
- GET `/api/inventory/aging` - Stock aging report
- GET `/api/inventory/damaged-blocked` - Damaged/blocked stock (read-only)

---

## Phase 3: Purchases Management (PENDING)

### Required Features
- Purchase Manager role permissions
- Dashboard metrics:
  - Purchase summary (daily / weekly / monthly)
  - Open purchase orders (POs)
  - Pending approvals
  - Supplier-wise purchase value
  - Category-wise procurement
  - Delivery status (received / pending / delayed)
  - Purchase vs sales trend
  - Tax & discount summary (read-only)
  - GRN (Goods Receipt Note) status

### APIs to Create
- GET `/api/purchases/dashboard` - Purchase dashboard
- GET `/api/purchases/summary` - Purchase summary (daily/weekly/monthly)
- GET `/api/purchases/orders/open` - Open purchase orders
- GET `/api/purchases/orders/pending-approval` - Pending approvals
- GET `/api/purchases/supplier-analysis` - Supplier-wise analysis
- GET `/api/purchases/category-analysis` - Category-wise analysis
- GET `/api/purchases/delivery-status` - Delivery status
- GET `/api/purchases/trend` - Purchase vs sales trend
- GET `/api/purchases/tax-discount-summary` - Tax & discount summary
- GET `/api/purchases/grn-status` - GRN status

---

## Phase 4: Sales Management (PENDING)

### Required Features
- Sales roles: Cashier, Store Manager, Store Admin
- Dashboard metrics:
  - Store-specific metrics
  - Recent activity
  - Sales dashboard (daily / weekly / monthly)
  - High-level inventory alerts (low stock, overstock)
  - Analytics

### POS/Sale Features (Cashier)
- Sales & Billing
- Payments
- Order Operations
- BOGO (Buy One Get One)
- Void Amount Payment
- Customer Handling
- Hold/Resume Orders
- Cancel Order
- KOT (Kitchen Order Ticket)
- Tasting Chocolates to Customer (Track)

### APIs to Create
- GET `/api/sales/dashboard` - Sales dashboard
- GET `/api/sales/metrics` - Sales metrics
- GET `/api/sales/recent-activity` - Recent activity
- POST `/api/sales/orders` - Create order
- POST `/api/sales/orders/:id/payments` - Process payment
- POST `/api/sales/orders/:id/hold` - Hold order
- POST `/api/sales/orders/:id/resume` - Resume order
- POST `/api/sales/orders/:id/cancel` - Cancel order
- POST `/api/sales/orders/:id/void-payment` - Void payment
- POST `/api/sales/bogo` - Apply BOGO offer
- POST `/api/sales/kot` - Generate KOT
- POST `/api/sales/tasting` - Track tasting

---

## Phase 5: BOGO Offers - All Cases (PENDING)

### Required Features
- BOGO offer management
- Multiple BOGO scenarios:
  - Buy X Get Y Free
  - Buy X Get Y at Discount
  - Category-based BOGO
  - Product-specific BOGO
  - Time-based BOGO
  - Customer tier-based BOGO

### APIs to Create
- GET `/api/bogo/offers` - List all BOGO offers
- POST `/api/bogo/offers` - Create BOGO offer
- PUT `/api/bogo/offers/:id` - Update BOGO offer
- DELETE `/api/bogo/offers/:id` - Delete BOGO offer
- GET `/api/bogo/offers/:id` - Get BOGO offer details
- POST `/api/bogo/apply` - Apply BOGO to order
- GET `/api/bogo/eligible` - Get eligible BOGO offers for order

---

## Role-Based Permission Matrix

### SuperAdmin (PlatformAdmin)
- **Dashboard**: View, Export, Metrics data of tenants, Recent activity, Revenue overview, System health monitoring
- **Reports**: Generate custom reports
- **User Management**: CRUD tenant admin
- **Administration**: Export audit logs, View subscriptions of all tenants, Manage settings

### Tenant Admin (Brand)
- **Dashboard**: Tenant-specific metrics, Recent activity, Revenue overview
- **Reports**: Generate custom reports
- **User Management**: CRUD store (store manager by default), Checkbox for tenant as store manager, CRUD store manager
- **Administration**: Export audit logs, View own subscriptions, Manage settings

### Store Admin (CompanyOwned or FranchiseOwned)
- **Dashboard**: Store-specific metrics, Recent activity, Sales dashboard (daily/weekly/monthly), High-level inventory alerts, Analytics
- **Reports**: Generate Reports
- **User Management**: CRUD Manage Store Staff, Ensure store follows company policies
- **Administration**: Export audit logs, View own subscriptions, Manage settings

### Store Manager
- **Dashboard**: Store-specific metrics, Recent activity, Sales dashboard (daily/weekly/monthly), High-level inventory alerts, Analytics
- **User Management**: CRUD Manage Store Staff, Ensure store follows company policies

### Cashier
- **POS/Sale**: Sales & Billing, Payments, Order Operations, BOGO, Void Amount Payment, Customer Handling, Hold/Resume Orders, Cancel Order, KOT, Tasting Chocolates to Customer (Track)

### Kitchen Staff (KDS)
- **KDS**: View incoming kitchen orders, Change order status (Received/Preparing/Ready), Mark items as completed

### Inventory Manager
- **Dashboard**: Total inventory value (store-wise/category-wise), Stock on hand (SKU/product/variant), Low-stock & out-of-stock indicators, Fast-moving vs slow-moving items, Expiry alerts, Stock aging, Reorder level vs current stock, Damaged/blocked stock (read-only)

### Purchase Manager
- **Dashboard**: Purchase summary (daily/weekly/monthly), Open purchase orders, Pending approvals, Supplier-wise purchase value, Category-wise procurement, Delivery status, Purchase vs sales trend, Tax & discount summary (read-only), GRN status

### Accountant
- **Dashboard**: View (financial data)

### Support Staff
- **Dashboard**: View

### System Auditor
- **All Modules**: View, Compliance/Logs

### HR Manager
- **Dashboard**: View

---

## Database Migration Steps

1. Run Prisma migration to create new tables:
   ```bash
   npm run prisma:migrate
   ```

2. Seed default data:
   ```bash
   npm run prisma:seed
   ```

3. Verify schema:
   ```bash
   npm run prisma:validate
   ```

---

## Frontend Integration (sv-capital-admin-ui)

### Required Updates
- [ ] Update role definitions in frontend
- [ ] Update permission checking service
- [ ] Update API endpoints
- [ ] Create tenant management UI
- [ ] Update user management UI with tenant assignment
- [ ] Create role-based navigation
- [ ] Update dashboard components based on roles

---

## Standards & Best Practices

1. **Database**: Use Prisma ORM with PostgreSQL
2. **API**: RESTful APIs with NestJS
3. **Authentication**: JWT-based authentication
4. **Authorization**: Role-based and permission-based guards
5. **Validation**: Class-validator for DTOs
6. **Documentation**: Swagger/OpenAPI
7. **Error Handling**: Standardized error responses
8. **Logging**: Comprehensive audit logging
9. **Testing**: Unit and integration tests (to be added)

---

## Notes

- All APIs should include proper authentication and authorization
- All database operations should be audited
- Multi-tenant data isolation must be enforced
- Store-level data isolation must be enforced
- Permission checks should be at both role and permission level
- Use transaction for critical operations
- Implement proper error handling and validation
