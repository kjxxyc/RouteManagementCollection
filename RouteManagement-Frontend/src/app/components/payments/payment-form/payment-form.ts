import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../services/payment.service';
import { InvoiceService } from '../../../services/invoice.service';
import { ToastService } from '../../../services/toast.service';
import { RegisterPaymentRequest } from '../../../models/payment.model';
import { Invoice } from '../../../models/invoice.model';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-form.html',
  styleUrl: './payment-form.scss',
})
export class PaymentFormComponent implements OnInit {
  private paymentService = inject(PaymentService);
  private invoiceService = inject(InvoiceService);
  private toastService = inject(ToastService);

  invoices = signal<Invoice[]>([]);
  loading = signal(false);
  loadingInvoices = signal(true);
  
  formData = signal<RegisterPaymentRequest>({
    invoiceId: 0,
    amount: 0,
    paymentMethod: '',
    reference: ''
  });

  paymentMethods = ['Efectivo', 'Transferencia', 'Cheque', 'Tarjeta'];

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.invoiceService.getAll(undefined, undefined, 1, 100).subscribe({
      next: (data) => {
        this.invoices.set(data.items);
        this.loadingInvoices.set(false);
      },
      error: () => {
        this.toastService.error('Error al cargar facturas');
        this.loadingInvoices.set(false);
      }
    });
  }

  onInvoiceChange(): void {
    const invoice = this.invoices().find(i => i.id === this.formData().invoiceId);
    if (invoice) {
      this.formData.update(data => ({ ...data, amount: invoice.amount }));
    }
  }

  onSubmit(): void {
    if (!this.formData().invoiceId) {
      this.toastService.warning('Seleccione una factura');
      return;
    }

    this.loading.set(true);
    this.paymentService.register(this.formData()).subscribe({
      next: () => {
        this.toastService.success('Pago registrado exitosamente');
        this.formData.set({ invoiceId: 0, amount: 0, paymentMethod: '', reference: '' });
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Error al registrar pago');
        this.loading.set(false);
      }
    });
  }
}
