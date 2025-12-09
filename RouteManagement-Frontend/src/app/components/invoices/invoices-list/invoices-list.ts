import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InvoiceService } from '../../../services/invoice.service';
import { RouteService } from '../../../services/route.service';
import { ToastService } from '../../../services/toast.service';
import { Invoice } from '../../../models/invoice.model';
import { Route } from '../../../models/route.model';
import { PagedResult } from '../../../models/paged-result.model';
import { InvoiceFormComponent } from '../invoice-form/invoice-form';

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, InvoiceFormComponent],
  templateUrl: './invoices-list.html',
  styleUrl: './invoices-list.scss',
})
export class InvoicesListComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private routeService = inject(RouteService);
  private toastService = inject(ToastService);

  invoices = signal<Invoice[]>([]);
  routes = signal<Route[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  
  // Filters
  routeId = signal<number | undefined>(undefined);
  isOutOfRoute = signal<boolean | undefined>(undefined);
  showForm = signal(false);

  ngOnInit(): void {
    this.loadRoutes();
    this.loadInvoices();
  }

  loadRoutes(): void {
    this.routeService.getAll(undefined, undefined, undefined, 1, 100).subscribe({
      next: (data) => {
        this.routes.set(data.items);
      }
    });
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.invoiceService.getAll(this.routeId(), this.isOutOfRoute(), this.currentPage(), this.pageSize()).subscribe({
      next: (data: PagedResult<Invoice>) => {
        this.invoices.set(data.items);
        this.totalCount.set(data.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.toastService.error('Error al cargar facturas');
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadInvoices();
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadInvoices();
  }

  clearFilters(): void {
    this.routeId.set(undefined);
    this.isOutOfRoute.set(undefined);
    this.applyFilters();
  }

  deleteInvoice(id: number): void {
    if (confirm('¿Está seguro de eliminar esta factura?')) {
      this.invoiceService.delete(id).subscribe({
        next: () => {
          this.toastService.success('Factura eliminada exitosamente');
          this.loadInvoices();
        },
        error: () => {
          this.toastService.error('Error al eliminar factura');
        }
      });
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount() / this.pageSize());
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
