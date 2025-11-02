import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouteService } from '../../../services/route.service';
import { ToastService } from '../../../services/toast.service';
import { ExcelService } from '../../../services/excel.service';
import { Route } from '../../../models/route.model';
import { PagedResult } from '../../../models/paged-result.model';

@Component({
  selector: 'app-routes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './routes-list.html',
  styleUrl: './routes-list.scss',
})
export class RoutesListComponent implements OnInit {
  private routeService = inject(RouteService);
  private toastService = inject(ToastService);
  private excelService = inject(ExcelService);

  routes = signal<Route[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  
  // Filters
  startDate = signal<string>('');
  endDate = signal<string>('');
  status = signal<string>('');
  searchTerm = signal<string>('');
  showAdvancedSearch = signal(false);

  ngOnInit(): void {
    this.loadRoutes();
  }

  get filteredRoutes() {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.routes();
    
    return this.routes().filter(route =>
      route.name.toLowerCase().includes(term) ||
      route.description.toLowerCase().includes(term) ||
      route.status.toLowerCase().includes(term) ||
      route.id.toString().includes(term)
    );
  }

  loadRoutes(): void {
    this.loading.set(true);
    const start = this.startDate() ? new Date(this.startDate()) : undefined;
    const end = this.endDate() ? new Date(this.endDate()) : undefined;
    const stat = this.status() || undefined;

    this.routeService.getAll(start, end, stat, this.currentPage(), this.pageSize()).subscribe({
      next: (data: PagedResult<Route>) => {
        this.routes.set(data.items);
        this.totalCount.set(data.totalCount);
        this.loading.set(false);
      },
      error: (error) => {
        this.toastService.error('Error al cargar rutas');
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadRoutes();
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadRoutes();
  }

  clearFilters(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.status.set('');
    this.applyFilters();
  }

  publishRoute(id: number): void {
    this.routeService.publish(id).subscribe({
      next: () => {
        this.toastService.success('Ruta publicada exitosamente');
        this.loadRoutes();
      },
      error: () => {
        this.toastService.error('Error al publicar ruta');
      }
    });
  }

  deleteRoute(id: number): void {
    if (confirm('¿Está seguro de eliminar esta ruta?')) {
      this.routeService.delete(id).subscribe({
        next: () => {
          this.toastService.success('Ruta eliminada exitosamente');
          this.loadRoutes();
        },
        error: () => {
          this.toastService.error('Error al eliminar ruta');
        }
      });
    }
  }

  exportToExcel(): void {
    if (this.routes().length === 0) {
      this.toastService.warning('No hay datos para exportar');
      return;
    }

    const dataToExport = this.routes().map(route => ({
      'ID': route.id,
      'Nombre': route.name,
      'Descripción': route.description,
      'Fecha': route.date,
      'Estado': route.status,
      'Publicada': route.isPublished ? 'Sí' : 'No',
      'Fecha Publicación': route.publishedAt || 'N/A'
    }));

    this.excelService.exportToExcel(dataToExport, 'rutas', 'Rutas');
    this.toastService.success('Rutas exportadas a Excel');
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount() / this.pageSize());
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
