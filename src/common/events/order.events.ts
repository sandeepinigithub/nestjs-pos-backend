/**
 * Order-related events
 */

export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly storeId: string,
    public readonly customerId?: string,
    public readonly totalAmount: number,
    public readonly createdBy?: string,
  ) {}
}

export class OrderStatusChangedEvent {
  constructor(
    public readonly orderId: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
    public readonly changedBy?: string,
  ) {}
}

export class OrderCompletedEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly storeId: string,
    public readonly totalAmount: number,
    public readonly completedAt: Date,
  ) {}
}

export class OrderCancelledEvent {
  constructor(
    public readonly orderId: string,
    public readonly orderNumber: string,
    public readonly cancelledBy?: string,
    public readonly reason?: string,
  ) {}
}

