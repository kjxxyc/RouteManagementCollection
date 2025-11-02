export interface Invoice {
  id: number;
  routeId?: number;
  invoiceNumber: string;
  amount: number;
  customerName: string;
  customerAddress: string;
  isOutOfRoute: boolean;
  createdAt: Date | string;
}

export interface CreateInvoiceRequest {
  routeId?: number;
  invoiceNumber: string;
  amount: number;
  customerName: string;
  customerAddress: string;
  isOutOfRoute: boolean;
}
