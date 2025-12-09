import { Component, inject, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../../services/invoice.service';
import { RouteService } from '../../../services/route.service';
import { ToastService } from '../../../services/toast.service';
import { CreateInvoiceRequest } from '../../../models/invoice.model';
import { Route } from '../../../models/route.model';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice-form.html',
  styleUrl: './invoice-form.scss',
})
export class InvoiceFormComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private routeService = inject(RouteService);
  private toastService = inject(ToastService);

  close = output<void>();
  
  routes = signal<Route[]>([]);
  loading = signal(false);
  
  formData = signal<CreateInvoiceRequest>({
    routeId: undefined,
    invoiceNumber: '',
    amount: 0,
    customerName: '',
    customerAddress: '',
    isOutOfRoute: false
  });

  ngOnInit(): void {
    this.loadRoutes();
  }

  loadRoutes(): void {
    this.routeService.getAll(undefined, undefined, undefined, 1, 100).subscribe({
      next: (data) => {
        this.routes.set(data.items);
      }
    });
  }

  onSubmit(): void {
    this.loading.set(true);
    this.invoiceService.create(this.formData()).subscribe({
      next: () => {
        this.toastService.success('Factura creada exitosamente');
        this.close.emit();
      },
      error: () => {
        this.toastService.error('Error al crear factura');
        this.loading.set(false);
      }
    });
  }

  onCancel(): void {
    this.close.emit();
  }
}
