import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteService } from '../../../services/route.service';
import { InvoiceService } from '../../../services/invoice.service';

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

  totalRoutes = signal(0);
  totalInvoices = signal(0);
  loading = signal(true);

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.routeService.getAll(undefined, undefined, undefined, 1, 1).subscribe({
      next: (data) => {
        this.totalRoutes.set(data.totalCount);
      }
    });

    this.invoiceService.getAll(undefined, undefined, 1, 1).subscribe({
      next: (data) => {
        this.totalInvoices.set(data.totalCount);
        this.loading.set(false);
      }
    });
  }
}
