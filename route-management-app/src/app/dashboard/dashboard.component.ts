import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card p-3">
      <h2 class="h5 mb-2">Dashboard</h2>
      <p class="text-muted mb-0">Resumen y métricas (placeholder).</p>
    </section>
  `,
})
export class DashboardComponent {} 
