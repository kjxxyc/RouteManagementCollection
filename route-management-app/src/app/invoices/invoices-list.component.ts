import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card p-3">
      <h2 class="h5 mb-2">Facturas</h2>
      <p class="text-muted mb-0">Listado de facturas (placeholder).</p>
    </section>
  `,
})
export class InvoicesListComponent {}
