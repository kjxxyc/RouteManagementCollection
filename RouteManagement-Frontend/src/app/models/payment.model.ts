export interface Payment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  paymentDate: Date | string;
  reference?: string;
}

export interface RegisterPaymentRequest {
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  reference?: string;
}
