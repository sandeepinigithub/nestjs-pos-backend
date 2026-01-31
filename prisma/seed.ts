import { PrismaClient, UserRole, UserStatus, PermissionResource, PermissionAction, PermissionModule, BOGOType, BOGOStatus, TenantStatus, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  // ============================================
  // 1. CREATE PERMISSIONS
  // ============================================
  console.log('📋 Creating permissions...');
  
  const permissionResources = Object.values(PermissionResource);
  const permissionActions = [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.EXECUTE, PermissionAction.APPROVE, PermissionAction.REJECT];
  
  const permissions: Record<string, any> = {};
  
  // Create permissions for each resource-action combination
  for (const resource of permissionResources) {
    for (const action of permissionActions) {
      const key = `${resource}_${action}`;
      const module = getModuleForResource(resource);
      
      const permission = await prisma.permission.upsert({
        where: {
          resource_action: {
            resource,
            action,
          },
        },
        update: {},
        create: {
          resource,
          action,
          name: `${action} ${resource.replace(/_/g, ' ')}`,
          description: `Permission to ${action.toLowerCase()} ${resource.replace(/_/g, ' ').toLowerCase()}`,
          module,
          isActive: true,
        },
      });
      
      permissions[key] = permission;
    }
  }
  
  console.log(`✅ Created ${Object.keys(permissions).length} permissions\n`);

  // ============================================
  // 2. CREATE DEFAULT TENANT
  // ============================================
  console.log('🏢 Creating default tenant...');
  
  const defaultTenant = await prisma.tenant.upsert({
    where: { code: 'DEFAULT_TENANT' },
    update: {},
    create: {
      code: 'DEFAULT_TENANT',
      name: 'Default Tenant',
      domain: 'default.pos.com',
      status: TenantStatus.ACTIVE,
      subscriptionPlan: SubscriptionPlan.PROFESSIONAL,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      maxUsers: 100,
      maxStores: 50,
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      email: 'admin@defaulttenant.com',
      phone: '+1234567890',
      currency: 'USD',
      timezone: 'UTC',
      language: 'en',
      dateFormat: 'YYYY-MM-DD',
      features: {
        inventory: true,
        sales: true,
        purchases: true,
        reports: true,
        multiStore: true,
        apiAccess: true,
      },
      isActive: true,
    },
  });
  
  console.log(`✅ Created tenant: ${defaultTenant.name}\n`);

  // ============================================
  // 3. CREATE SUPER ADMIN USER
  // ============================================
  console.log('👤 Creating Super Admin user...');
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@pos.com' },
    update: {},
    create: {
      email: 'superadmin@pos.com',
      username: 'superadmin',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });
  
  console.log(`✅ Created Super Admin: ${superAdmin.email}\n`);

  // ============================================
  // 4. CREATE ROLE-PERMISSION MAPPINGS
  // ============================================
  console.log('🔐 Creating role-permission mappings...');
  
  // Get all permissions
  const allPermissions = await prisma.permission.findMany();
  
  // SUPER_ADMIN - All permissions
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: UserRole.SUPER_ADMIN,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        role: UserRole.SUPER_ADMIN,
        permissionId: permission.id,
        isAllowed: true,
        grantedBy: superAdmin.id,
      },
    });
  }
  
  // TENANT_ADMIN - Tenant management + all tenant-scoped permissions
  const tenantAdminPermissions = allPermissions.filter(p => {
    const resourceStr = p.resource.toString();
    return !resourceStr.includes('TENANT') || p.resource === PermissionResource.USER_READ;
  });
  for (const permission of tenantAdminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: UserRole.TENANT_ADMIN,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        role: UserRole.TENANT_ADMIN,
        permissionId: permission.id,
        isAllowed: true,
        grantedBy: superAdmin.id,
      },
    });
  }
  
  // STORE_ADMIN - Store management + sales + inventory + reports
  const storeAdminPermissions = allPermissions.filter(p => 
    p.module === PermissionModule.STORE_MANAGEMENT ||
    p.module === PermissionModule.SALES ||
    p.module === PermissionModule.INVENTORY ||
    p.module === PermissionModule.REPORTS ||
    p.module === PermissionModule.POS_SALE ||
    p.module === PermissionModule.USER_MANAGEMENT ||
    p.resource.includes('STORE') ||
    p.resource.includes('ORDER') ||
    p.resource.includes('PRODUCT')
  );
  for (const permission of storeAdminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: UserRole.STORE_ADMIN,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        role: UserRole.STORE_ADMIN,
        permissionId: permission.id,
        isAllowed: true,
        grantedBy: superAdmin.id,
      },
    });
  }
  
  // STORE_MANAGER - Sales + inventory + reports (read-only for some)
  const storeManagerPermissions = allPermissions.filter(p => 
    p.module === PermissionModule.SALES ||
    p.module === PermissionModule.INVENTORY ||
    p.module === PermissionModule.REPORTS ||
    p.module === PermissionModule.POS_SALE ||
    p.resource.includes('ORDER') ||
    (p.resource.includes('PRODUCT') && p.action === PermissionAction.READ)
  );
  for (const permission of storeManagerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: UserRole.STORE_MANAGER,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        role: UserRole.STORE_MANAGER,
        permissionId: permission.id,
        isAllowed: true,
        grantedBy: superAdmin.id,
      },
    });
  }
  
  // CASHIER - POS operations + order creation
  const cashierPermissions = allPermissions.filter(p => 
    p.module === PermissionModule.POS_SALE ||
    p.resource === PermissionResource.ORDER_CREATE ||
    p.resource === PermissionResource.ORDER_READ ||
    p.resource === PermissionResource.PRODUCT_READ ||
    p.resource === PermissionResource.ORDER_UPDATE
  );
  for (const permission of cashierPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: UserRole.CASHIER,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        role: UserRole.CASHIER,
        permissionId: permission.id,
        isAllowed: true,
        grantedBy: superAdmin.id,
      },
    });
  }
  
  // KITCHEN_STAFF - KDS operations
  const kitchenStaffPermissions = allPermissions.filter(p => 
    p.module === PermissionModule.KITCHEN_DISPLAY_SYSTEM ||
    (p.resource === PermissionResource.ORDER_READ && p.action === PermissionAction.READ) ||
    (p.resource === PermissionResource.ORDER_UPDATE && p.action === PermissionAction.UPDATE)
  );
  for (const permission of kitchenStaffPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: UserRole.KITCHEN_STAFF,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        role: UserRole.KITCHEN_STAFF,
        permissionId: permission.id,
        isAllowed: true,
        grantedBy: superAdmin.id,
      },
    });
  }
  
  // INVENTORY_MANAGER - Inventory operations
  const inventoryManagerPermissions = allPermissions.filter(p => 
    p.module === PermissionModule.INVENTORY ||
    p.resource.includes('INVENTORY') ||
    (p.resource === PermissionResource.PRODUCT_READ && p.action === PermissionAction.READ)
  );
  for (const permission of inventoryManagerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: UserRole.INVENTORY_MANAGER,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        role: UserRole.INVENTORY_MANAGER,
        permissionId: permission.id,
        isAllowed: true,
        grantedBy: superAdmin.id,
      },
    });
  }
  
  // PURCHASE_MANAGER - Purchase operations
  const purchaseManagerPermissions = allPermissions.filter(p => 
    p.module === PermissionModule.PURCHASES ||
    p.resource.includes('PURCHASE') ||
    (p.resource === PermissionResource.PRODUCT_READ && p.action === PermissionAction.READ)
  );
  for (const permission of purchaseManagerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: UserRole.PURCHASE_MANAGER,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        role: UserRole.PURCHASE_MANAGER,
        permissionId: permission.id,
        isAllowed: true,
        grantedBy: superAdmin.id,
      },
    });
  }
  
  // ACCOUNTANT - Financial reports + read-only access
  const accountantPermissions = allPermissions.filter(p => 
    p.module === PermissionModule.REPORTS ||
    (p.resource === PermissionResource.REPORT_FINANCIAL) ||
    (p.resource === PermissionResource.REPORT_SALES) ||
    (p.action === PermissionAction.READ && (
      p.resource.includes('ORDER') ||
      p.resource.includes('PAYMENT')
    ))
  );
  for (const permission of accountantPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: UserRole.ACCOUNTANT,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        role: UserRole.ACCOUNTANT,
        permissionId: permission.id,
        isAllowed: true,
        grantedBy: superAdmin.id,
      },
    });
  }
  
  // SUPPORT_STAFF - Read-only access
  const supportStaffPermissions = allPermissions.filter(p => 
    p.action === PermissionAction.READ
  );
  for (const permission of supportStaffPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: UserRole.SUPPORT_STAFF,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        role: UserRole.SUPPORT_STAFF,
        permissionId: permission.id,
        isAllowed: true,
        grantedBy: superAdmin.id,
      },
    });
  }
  
  // SYSTEM_AUDITOR - Audit logs + read-only
  const systemAuditorPermissions = allPermissions.filter(p => 
    p.resource === PermissionResource.SYSTEM_AUDIT ||
    (p.action === PermissionAction.READ)
  );
  for (const permission of systemAuditorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: UserRole.SYSTEM_AUDITOR,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        role: UserRole.SYSTEM_AUDITOR,
        permissionId: permission.id,
        isAllowed: true,
        grantedBy: superAdmin.id,
      },
    });
  }
  
  // HR_MANAGER - User management + read-only reports
  const hrManagerPermissions = allPermissions.filter(p => 
    p.module === PermissionModule.USER_MANAGEMENT ||
    p.resource.includes('USER') ||
    (p.module === PermissionModule.REPORTS && p.resource === PermissionResource.REPORT_USER)
  );
  for (const permission of hrManagerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: UserRole.HR_MANAGER,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        role: UserRole.HR_MANAGER,
        permissionId: permission.id,
        isAllowed: true,
        grantedBy: superAdmin.id,
      },
    });
  }
  
  console.log('✅ Created role-permission mappings for all roles\n');

  // ============================================
  // 5. CREATE SAMPLE USERS FOR ALL ROLES
  // ============================================
  console.log('👥 Creating sample users for all roles...');
  
  const roleUsers = [
    { role: UserRole.TENANT_ADMIN, email: 'tenantadmin@pos.com', username: 'tenantadmin', firstName: 'Tenant', lastName: 'Admin', tenantId: defaultTenant.id },
    { role: UserRole.STORE_ADMIN, email: 'storeadmin@pos.com', username: 'storeadmin', firstName: 'Store', lastName: 'Admin', tenantId: defaultTenant.id },
    { role: UserRole.STORE_MANAGER, email: 'storemanager@pos.com', username: 'storemanager', firstName: 'Store', lastName: 'Manager', tenantId: defaultTenant.id },
    { role: UserRole.CASHIER, email: 'cashier@pos.com', username: 'cashier', firstName: 'Cashier', lastName: 'User', tenantId: defaultTenant.id },
    { role: UserRole.KITCHEN_STAFF, email: 'kitchen@pos.com', username: 'kitchen', firstName: 'Kitchen', lastName: 'Staff', tenantId: defaultTenant.id },
    { role: UserRole.INVENTORY_MANAGER, email: 'inventory@pos.com', username: 'inventory', firstName: 'Inventory', lastName: 'Manager', tenantId: defaultTenant.id },
    { role: UserRole.PURCHASE_MANAGER, email: 'purchase@pos.com', username: 'purchase', firstName: 'Purchase', lastName: 'Manager', tenantId: defaultTenant.id },
    { role: UserRole.ACCOUNTANT, email: 'accountant@pos.com', username: 'accountant', firstName: 'Accountant', lastName: 'User', tenantId: defaultTenant.id },
    { role: UserRole.SUPPORT_STAFF, email: 'support@pos.com', username: 'support', firstName: 'Support', lastName: 'Staff', tenantId: defaultTenant.id },
    { role: UserRole.SYSTEM_AUDITOR, email: 'auditor@pos.com', username: 'auditor', firstName: 'System', lastName: 'Auditor', tenantId: defaultTenant.id },
    { role: UserRole.HR_MANAGER, email: 'hr@pos.com', username: 'hr', firstName: 'HR', lastName: 'Manager', tenantId: defaultTenant.id },
  ];
  
  for (const userData of roleUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        tenantId: userData.tenantId,
      },
    });
    console.log(`  ✅ Created ${userData.role}: ${user.email}`);
  }
  
  console.log('✅ Created sample users for all roles\n');

  // ============================================
  // 6. CREATE SAMPLE COUNTRY, REGION AND STORE
  // ============================================
  console.log('🏪 Creating sample country, region and store...');
  
  // Create country first
  const sampleCountry = await prisma.country.upsert({
    where: { code: 'US' },
    update: {},
    create: {
      code: 'US',
      name: 'United States',
      currency: 'USD',
      timezone: 'America/New_York',
      isActive: true,
    },
  });
  
  // Create region
  const sampleRegion = await prisma.region.upsert({
    where: { code: 'US_EAST' },
    update: {},
    create: {
      code: 'US_EAST',
      name: 'US East Region',
      countryId: sampleCountry.id,
      isActive: true,
    },
  });
  
  const sampleStore = await prisma.store.upsert({
    where: { code: 'STORE_001' },
    update: {},
    create: {
      code: 'STORE_001',
      name: 'Main Store',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      countryId: sampleCountry.id,
      regionId: sampleRegion.id,
      phone: '+1234567890',
      email: 'store001@pos.com',
      storeType: 'COMPANY_OWNED',
      ownershipType: 'COMPANY_OWNED',
      status: 'ACTIVE',
      tenantId: defaultTenant.id,
      timezone: 'America/New_York',
      currency: 'USD',
      isActive: true,
    },
  });
  
  console.log(`✅ Created store: ${sampleStore.name}\n`);

  // ============================================
  // 7. CREATE SAMPLE BOGO OFFERS
  // ============================================
  console.log('🎁 Creating sample BOGO offers...');
  
  // Case 1: Buy X Get X Same
  const bogo1 = await prisma.bOGOOffer.upsert({
    where: { code: 'BOGO001' },
    update: {},
    create: {
      code: 'BOGO001',
      name: 'Buy 1 Coffee Get 1 Free',
      description: 'Buy one coffee, get one free',
      type: BOGOType.BUY_X_GET_X_SAME,
      status: BOGOStatus.ACTIVE,
      triggerConfig: {
        productIds: [], // Will be set when products are created
        quantity: 1,
      },
      rewardConfig: {
        productIds: [],
        quantity: 1,
      },
      maxFreeItems: 2,
      tenantId: defaultTenant.id,
      storeIds: [sampleStore.id],
      isActive: true,
      priority: 10,
    },
  });
  
  // Case 2: Buy X Get Y Different
  const bogo2 = await prisma.bOGOOffer.upsert({
    where: { code: 'BOGO002' },
    update: {},
    create: {
      code: 'BOGO002',
      name: 'Buy Pizza Get Coke Free',
      description: 'Buy one pizza, get one coke free',
      type: BOGOType.BUY_X_GET_Y_DIFFERENT,
      status: BOGOStatus.ACTIVE,
      triggerConfig: {
        productIds: [],
        quantity: 1,
      },
      rewardConfig: {
        productIds: [],
        quantity: 1,
      },
      tenantId: defaultTenant.id,
      storeIds: [sampleStore.id],
      isActive: true,
      priority: 9,
    },
  });
  
  // Case 12: Time-Based Offer
  const bogo3 = await prisma.bOGOOffer.upsert({
    where: { code: 'BOGO003' },
    update: {},
    create: {
      code: 'BOGO003',
      name: 'Happy Hour Coffee',
      description: 'Buy 1 Coffee Get 1 Free (4 PM - 7 PM)',
      type: BOGOType.TIME_BASED,
      status: BOGOStatus.ACTIVE,
      triggerConfig: {
        productIds: [],
        quantity: 1,
      },
      rewardConfig: {
        productIds: [],
        quantity: 1,
      },
      timeRestrictions: {
        startTime: '16:00',
        endTime: '19:00',
        days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
      },
      tenantId: defaultTenant.id,
      storeIds: [sampleStore.id],
      isActive: true,
      priority: 8,
    },
  });
  
  console.log(`✅ Created 3 sample BOGO offers\n`);

  console.log('🎉 Database seeding completed successfully!\n');
  console.log('📝 Summary:');
  console.log(`   - Permissions: ${Object.keys(permissions).length}`);
  console.log(`   - Roles configured: 12`);
  console.log(`   - Users created: ${roleUsers.length + 1}`);
  console.log(`   - Tenant created: 1`);
  console.log(`   - Store created: 1`);
  console.log(`   - BOGO offers created: 3`);
  console.log('\n🔑 Default password for all users: Admin@123');
}

// Helper function to map resources to modules
function getModuleForResource(resource: PermissionResource): PermissionModule | null {
  const resourceStr = resource.toString();
  
  if (resourceStr.includes('USER')) return PermissionModule.USER_MANAGEMENT;
  if (resourceStr.includes('STORE')) return PermissionModule.STORE_MANAGEMENT;
  if (resourceStr.includes('PRODUCT')) return PermissionModule.PRODUCT_MANAGEMENT;
  if (resourceStr.includes('ORDER')) return PermissionModule.ORDER_MANAGEMENT;
  if (resourceStr.includes('INVENTORY')) return PermissionModule.INVENTORY;
  if (resourceStr.includes('PURCHASE')) return PermissionModule.PURCHASES;
  if (resourceStr.includes('REPORT')) return PermissionModule.REPORTS;
  if (resourceStr.includes('SYSTEM')) return PermissionModule.SYSTEM;
  
  return null;
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
