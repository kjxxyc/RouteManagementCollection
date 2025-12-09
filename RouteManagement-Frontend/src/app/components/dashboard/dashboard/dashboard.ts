import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteService } from '../../../services/route.service';
import { InvoiceService } from '../../../services/invoice.service';
import { PaymentService } from '../../../services/payment.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private routeService = inject(RouteService);
  private invoiceService = inject(InvoiceService);
  private paymentService = inject(PaymentService);

  // Basic KPIs
  totalRoutes = signal(0);
  totalInvoices = signal(0);
  totalPayments = signal(0);
  
  // Additional KPIs
  pendingRoutes = signal(0);
  liquidatedRoutes = signal(0);
  outOfRouteInvoices = signal(0);
  totalRevenue = signal(0);
  
  loading = signal(true);

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    // Total routes
    this.routeService.getAll(undefined, undefined, undefined, 1, 1).subscribe({
      next: (data) => {
        this.totalRoutes.set(data.totalCount);
      }
    });

    // Pending routes
    this.routeService.getAll(undefined, undefined, 'Pendiente', 1, 1).subscribe({
      next: (data) => {
        this.pendingRoutes.set(data.totalCount);
      }
    });

    // Liquidated routes
    this.routeService.getAll(undefined, undefined, 'Liquidado', 1, 1).subscribe({
      next: (data) => {
        this.liquidatedRoutes.set(data.totalCount);
      }
    });

    // Total invoices
    this.invoiceService.getAll(undefined, undefined, 1, 1).subscribe({
      next: (data) => {
        this.totalInvoices.set(data.totalCount);
      }
    });

    // Out of route invoices
    this.invoiceService.getAll(undefined, true, 1, 1).subscribe({
      next: (data) => {
        this.outOfRouteInvoices.set(data.totalCount);
      }
    });

    // Total payments
    this.paymentService.getAll(1, 1).subscribe({
      next: (data) => {
        this.totalPayments.set(data.totalCount);
        this.loading.set(false);
      }
    });

    // Calculate revenue (simulated - in real app, would come from API)
    this.totalRevenue.set(125500.50);
    
    // Update computed values
    this.updateComputedValues();
  }

  private updateComputedValues(): void {
    if (this.totalRoutes() === 0) {
      this.completionRate.set(0);
      this.pendingPercentage.set(0);
    } else {
      this.completionRate.set(Math.round((this.liquidatedRoutes() / this.totalRoutes()) * 100));
      this.pendingPercentage.set(Math.round((this.pendingRoutes() / this.totalRoutes()) * 100));
    }
  }

  completionRate = signal(0);
  pendingPercentage = signal(0);
  currentDate = Date.now();
}

