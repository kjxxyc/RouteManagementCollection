export interface AuditLog {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  oldValue?: string;
  newValue?: string;
  username: string;
  createdAt: Date | string;
}
