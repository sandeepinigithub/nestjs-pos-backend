import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { PermissionsModule } from './permissions/permissions.module';
import { StoresModule } from './stores/stores.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { InventoryModule } from './inventory/inventory.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { AuditModule } from './audit/audit.module';
import { SyncModule } from './sync/sync.module';
import { HealthModule } from './health/health.module';
import { CommonModule } from './common/common.module';
import { TenantsModule } from './tenants/tenants.module';
import { PurchasesModule } from './purchases/purchases.module';
import { SalesModule } from './sales/sales.module';
import { BOGOModule } from './bogo/bogo.module';
import { PromotionsModule } from './promotions/promotions.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CommonModule,
    AuthModule,
    UsersModule,
    GroupsModule,
    PermissionsModule,
    TenantsModule,
    StoresModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    InventoryModule,
    PurchasesModule,
    SalesModule,
    BOGOModule,
    LoyaltyModule,
    AuditModule,
    SyncModule,
    HealthModule,
    PromotionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
