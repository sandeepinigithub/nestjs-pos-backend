/**
 * User-related events
 */

export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly createdBy?: string,
  ) {}
}

export class UserUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly updatedBy?: string,
  ) {}
}

export class UserDeletedEvent {
  constructor(
    public readonly userId: string,
    public readonly deletedBy?: string,
  ) {}
}

export class UserStatusChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
    public readonly changedBy?: string,
  ) {}
}

