import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card p-3">
      <h2 class="h5 mb-2">Reportes</h2>
      <p class="text-muted mb-0">Generación y visualización de reportes (placeholder).</p>
    </section>
  `,
})
export class ReportsComponent {}
