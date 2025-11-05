# Enterprise POS Database Design

## 📊 Overview

This database design supports a **multi-tenant, multi-store, globally scalable POS system** similar to Starbucks architecture. It handles:
- **Company-owned stores** (directly managed)
- **Licensed stores** (franchise-like, regional management)
- **Joint ventures** (shared IT governance)
- **Global backend** with regional data centers
- **Granular permission system** with role-based and resource-based access
- **Complete audit trail** for compliance

---

## 🏗️ Architecture Flow

```
[Customer Order @ POS]
        ↓
[Local Store Server]
        ↓ (Syncs via secure APIs)
[Regional Data Center / Cloud Node]
        ↓
[Global Starbucks Backend]
        ↓
[Central Data Warehouse / BI / ERP / Loyalty Systems]
```

---

## 📋 Database Schema Structure

### 1. **Permission System** (Granular Access Control)

#### `Group` - Hierarchical User Groups
- **Purpose**: Organize users into groups with hierarchical structure
- **Features**:
  - Self-referential hierarchy (`parentId`)
  - Level tracking for hierarchy depth
  - Groups can have multiple children
- **Example**: "Managers" → "Store Managers" → "Assistant Managers"

#### `Permission` - Base Permission Definitions
- **Purpose**: Define all possible permissions in the system
- **Structure**:
  - `resource`: What (USER, ORDER, PRODUCT, etc.)
  - `action`: How (CREATE, READ, UPDATE, DELETE, etc.)
  - `module`: Category (USER_MANAGEMENT, REPORTS, etc.)
- **Example**: `resource: PRODUCT_CREATE, action: CREATE, module: INVENTORY`

#### `AccessPermission` - Store/Region Specific Permissions
- **Purpose**: Override permissions at store/region level
- **Features**:
  - Can be store-specific or region-specific
  - Supports conditions (JSON) for time restrictions, amount limits
- **Use Case**: Store in India might have different tax permissions than US store

#### `GroupPermission` - Group-Permission Mapping
- **Purpose**: Assign permissions to groups
- **Features**:
  - One group can have many permissions
  - Conditions can be added (e.g., can only approve orders < $1000)
- **Example**: "Cashiers" group → `ORDER_CREATE`, `ORDER_READ`

#### `UserPermission` - Direct User Permissions
- **Purpose**: Override group permissions for specific users
- **Features**:
  - Can be temporary (expiresAt)
  - Can be store-specific
  - Overrides group permissions
- **Use Case**: Temporary promotion for junior cashier to approve refunds

#### `UserGroup` - User-Group Assignment
- **Purpose**: Assign users to groups
- **Features**:
  - One user can be in multiple groups
  - Primary group designation
  - Store-specific group assignments
- **Example**: User can be "Manager" globally, "Cashier" at Store A

---

### 2. **Store & Organization** (Multi-Store Architecture)

#### `Country`
- ISO country codes, currency, timezone
- Supports global operations

#### `Region`
- Regional data centers (e.g., "US_EAST", "APAC_INDIA")
- Each region has a data center URL for sync
- Maps to countries

#### `Store`
- **Store Types**: `COMPANY_OWNED`, `LICENSED`, `JOINT_VENTURE`
- **Features**:
  - Hierarchical store structure (parentStoreId)
  - Store-specific configuration (tax, payment methods)
  - Local server URL for offline sync
  - Sync status tracking
- **Address & Location**: Full address with GPS coordinates
- **Ownership**: License number, expiry for licensed stores

#### `StoreOwnership`
- **Purpose**: Track ownership details for licensed/joint venture stores
- **Fields**:
  - Owner name (e.g., "Tata Consumer Products Limited")
  - License details
  - Contract information (JSON)
- **Use Case**: Track franchise agreements, contract terms

#### `UserStore`
- **Purpose**: Many-to-many user-store assignment
- **Features**:
  - Primary store designation
  - Temporary assignments (expiresAt)
- **Use Case**: User can work at multiple stores

---

### 3. **Product & Menu** (Global Menu with Local Pricing)

#### `Category`
- Hierarchical product categories
- Display order for POS UI
- Supports nested categories

#### `Product`
- **Global product definition**
- Base pricing (can be overridden per store)
- Attributes (size, flavor, etc.) stored as JSON
- Tags for search/filtering
- Status tracking (ACTIVE, DISCONTINUED, OUT_OF_STOCK)

#### `ProductStore`
- **Store-specific product configuration**
- Store-specific pricing
- Stock level at store
- Reorder levels
- **Use Case**: Same product, different prices in different regions

#### `Tax`
- **Multi-level tax configuration**
- Can be country-level, region-level, or store-level
- Effective dates for tax changes
- **Use Case**: GST in India, VAT in EU, Sales Tax in US

---

### 4. **Orders & Sales** (Transaction Management)

#### `Order`
- **Order tracking**
- Order number (unique, sequential)
- Customer information (guest or registered)
- Order status workflow: PENDING → CONFIRMED → PREPARING → READY → COMPLETED
- Pricing breakdown (subtotal, tax, discount, total)
- Loyalty points earned/used
- Payment status tracking

#### `OrderItem`
- Line items for each order
- Product reference
- Quantity, pricing, tax
- Customizations (JSON attributes)
- Discounts per item

#### `Payment`
- **Multiple payment methods per order**
- Supports: CASH, CARD, UPI, APPLE_PAY, GOOGLE_PAY, LOYALTY_POINTS, STORED_VALUE
- Transaction ID tracking
- Refund support
- Receipt URLs

---

### 5. **Inventory** (Stock Management)

#### `Inventory`
- **Store-level stock tracking**
- Current quantity
- Reserved quantity (for pending orders)
- Available quantity (calculated)
- Reorder levels
- Location within store

#### `InventoryMovement`
- **Complete audit trail of stock changes**
- Movement types: IN, OUT, ADJUSTMENT, TRANSFER, RETURN, WASTE
- Reference to source (order, transfer, etc.)
- Cost tracking for accounting
- **Use Case**: Track every stock change for compliance

---

### 6. **Loyalty & Rewards** (Customer Engagement)

#### `Customer`
- Customer information
- Loyalty points balance
- Tier status (GOLD, PLATINUM, etc.)
- Preferences (JSON)

#### `LoyaltyProgram`
- Program configuration
- Points per dollar/order
- Redemption rules (JSON)
- Tier definitions

#### `LoyaltyTransaction`
- **Complete points transaction history**
- Types: EARN, REDEEM, EXPIRY, ADJUSTMENT
- Points expiry tracking
- Linked to orders

---

### 7. **Sync & Audit** (Data Synchronization)

#### `SyncLog`
- **Track all sync operations**
- Store → Regional → Global sync
- Sync types: FULL, INCREMENTAL, PRODUCTS, ORDERS
- Direction: PUSH_TO_REGIONAL, PULL_FROM_REGIONAL, etc.
- Success/failure tracking
- Record counts
- Error details

#### `AuditLog`
- **Complete audit trail**
- Every create/update/delete tracked
- User, IP, user agent
- Old/new values
- Change diff
- **Use Case**: Compliance, security, debugging

---

## 🔑 Key Design Features

### 1. **Scalability**
- ✅ Indexed foreign keys
- ✅ Composite indexes for common queries
- ✅ JSON fields for flexible attributes
- ✅ Partitioning-ready (by store, region, date)

### 2. **Multi-Tenancy**
- ✅ Store-level data isolation
- ✅ Region-level configuration
- ✅ Global defaults with local overrides

### 3. **Reporting Ready**
- ✅ Denormalized fields for fast queries
- ✅ Timestamps on all tables
- ✅ Audit trails for all changes
- ✅ Aggregated fields (totals, counts)

### 4. **Flexibility**
- ✅ JSON fields for extensible attributes
- ✅ Hierarchical structures (groups, categories, stores)
- ✅ Soft deletes (status fields)
- ✅ Effective dates (tax, licenses)

### 5. **Compliance**
- ✅ Complete audit logging
- ✅ User tracking (createdBy, updatedBy)
- ✅ Timestamp tracking
- ✅ Change tracking (old/new values)

---

## 📊 Entity Relationship Highlights

### Permission Flow
```
User → UserGroup → Group → GroupPermission → Permission
User → UserPermission → Permission (direct override)
Permission → AccessPermission → Store/Region (location-specific)
```

### Store Hierarchy
```
Country → Region → Store → StoreOwnership
Store → Store (parent/child hierarchy)
```

### Order Flow
```
Store → Order → OrderItem → Product
Order → Payment (multiple payments per order)
Order → Customer → LoyaltyTransaction
```

### Inventory Flow
```
Store → Inventory → Product
Inventory → InventoryMovement (audit trail)
```

### Sync Flow
```
Store → SyncLog → Region → Global Backend
```

---

## 🎯 Reporting Optimizations

### Pre-aggregated Fields
- Order totals (subtotal, tax, discount, total)
- Inventory quantities (current, reserved, available)
- Loyalty points balance

### Indexes for Common Queries
- Orders by date, store, status
- Products by category, status
- Users by role, status
- Inventory by store, product

### Audit Trail
- Every change tracked in AuditLog
- Sync operations logged in SyncLog
- Inventory movements tracked

---

## 🚀 Future Enhancements

1. **Materialized Views** for complex reports
2. **Read Replicas** for reporting database
3. **Partitioning** by date for large tables
4. **Full-text Search** on products, customers
5. **Caching Layer** (Redis) for frequently accessed data

---

*Database Design Version: 1.0*
*Last Updated: 2025-11-05*

