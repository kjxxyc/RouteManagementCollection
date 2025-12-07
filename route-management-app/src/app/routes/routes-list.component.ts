import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, switchMap } from 'rxjs';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-routes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './routes-list.component.html',
  styleUrl: './routes-list.component.scss'
})

export class RoutesListComponent implements OnInit {
  routes: any[] = [];
  filteredRoutes: any[] = [];
  loading = false;
  error: string | null = null;
  search = '';
  dateFrom: string | null = null;
  dateTo: string | null = null;
  pageSize = 5;
  page = 1;
  // selección y modal de contraseña
  private selectedDocs = new Set<string | number>();
  showPassModal = false;
  passValue = '';
  saving = false;
  saveError: string | null = null;
  readonly maxPassLen = 30;

  // Modal crear ruta
  showRouteModal = false;
  routeSaving = false;
  routeError: string | null = null;
  routeForm = {
    tipoRuta: 'CONTRASENIA',
    fechaRuta: this.getTodayYMD(),
    estado: 'GENERADA',
    usuario: '',
    usuarioAsignado: ''
  };

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    // Default range aligned with backend example
    this.dateFrom = '2024-01-01';
    this.dateTo = '2026-01-01';
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    const fromParam = this.toApiDate(this.dateFrom);
    const toParam = this.toApiDate(this.dateTo);

    if (!fromParam || !toParam) {
      this.error = 'Fechas inválidas. Ajusta el rango y vuelve a intentar.';
      this.loading = false;
      return;
    }

    this.api.getRoutesByDate(fromParam, toParam).subscribe({
      next: (data) => {
        this.routes = data ?? [];
        this.page = 1;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        // Fallback al endpoint general si falla el filtrado por fecha
        this.api.getRoutes().subscribe({
          next: (data) => {
            this.routes = data ?? [];
            this.page = 1;
            this.applyFilters();
            this.loading = false;
          },
          error: () => {
            const status = err?.status ? ` (${err.status})` : '';
            this.error = `Error al cargar facturas pendientes${status}.`;
            this.loading = false;
          }
        });
      }
    });
  }

  onSearchChange(value: string | number | null): void {
    this.search = String(value ?? '').trim();
    this.page = 1;
    this.applyFilters();
  }

  onPageSizeChange(value: string | number | null): void {
    const size = Number(value ?? 10) || 10;
    this.pageSize = size;
    this.page = 1;
    this.applyFilters();
  }

  changePage(delta: number): void {
    const totalPages = Math.max(1, Math.ceil(this.filteredRoutes.length / this.pageSize));
    this.page = Math.min(Math.max(1, this.page + delta), totalPages);
  }

  get pagedRoutes(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredRoutes.slice(start, start + this.pageSize);
  }

  get selectedRoutes(): any[] {
    const keys = this.selectedDocs;
    if (!keys.size) return [];
    const all = this.routes ?? [];
    return all.filter((r) => keys.has(r?.no_Documento ?? r?.id));
  }

  getDiasPago(route: any): string {
    if (!route) {
      return '';
    }

    if (route.todos_Dias === 'Y') {
      return 'Todos los días';
    }

    const dias: string[] = [];

    if (route.lunes === 'Y') dias.push('Lunes');
    if (route.martes === 'Y') dias.push('Martes');
    if (route.miercoles === 'Y') dias.push('Miércoles');
    if (route.jueves === 'Y') dias.push('Jueves');
    if (route.viernes === 'Y') dias.push('Viernes');

    return dias.join(', ');
  }

  private getTodayYMD(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private toLocalYMDDate(ymd: string | null): Date | null {
    if (!ymd) return null;
    // Ensure we parse as local midnight to avoid TZ shifting
    return new Date(`${ymd}T00:00:00`);
  }

  private toIsoDate(ymd: string | null): string {
    const local = this.toLocalYMDDate(ymd);
    return local ? local.toISOString() : new Date().toISOString();
  }

  private toApiDate(ymd: string | null): string | null {
    if (!ymd) return null;
    const [y, m, d] = ymd.split('-').map((v) => Number(v));
    if (!y || !m || !d) return null;
    // API expects M-D-YYYY (without leading zeros)
    return `${m}-${d}-${y}`;
  }

  private applyFilters(): void {
    const term = this.search.trim().toLowerCase();
    const fromDate = this.toLocalYMDDate(this.dateFrom);
    const toDate = this.toLocalYMDDate(this.dateTo);
    const base = this.routes ?? [];

    this.filteredRoutes = base.filter((r) => {
      const doc = String(r.no_Documento ?? '').toLowerCase();
      const name = String(r.nombre_SN ?? '').toLowerCase();
      const desc = String(r.direccion_SN ?? '').toLowerCase();
      const matchesText = term ? doc.includes(term) || name.includes(term) || desc.includes(term) : true;

      const docDate = r.fecha_documento ? new Date(r.fecha_documento) : null;
      const gteFrom = fromDate && docDate ? docDate >= fromDate : true;
      const lteTo = toDate && docDate ? docDate <= toDate : true;
      const matchesFechaDoc = gteFrom && lteTo;

      return matchesText && matchesFechaDoc;
    });

    // estado por defecto "Registrado" cuando no viene del API
    this.filteredRoutes = this.filteredRoutes.map((r) => ({
      ...r,
      estadoRegistro: r.estadoRegistro || 'Registrado'
    }));
  }

  openCreateRouteModal(): void {
    if (!this.selectedCount) return;
    this.routeError = null;
    this.routeForm = {
      tipoRuta: this.routeForm.tipoRuta || 'CONTRASENIA',
      fechaRuta: this.routeForm.fechaRuta || this.getTodayYMD(),
      estado: this.routeForm.estado || 'GENERADA',
      usuario: this.routeForm.usuario || '',
      usuarioAsignado: this.routeForm.usuarioAsignado || ''
    };
    this.showRouteModal = true;
  }

  cancelCreateRoute(): void {
    this.showRouteModal = false;
    this.routeSaving = false;
    this.routeError = null;
  }

  confirmCreateRoute(): void {
    this.routeError = null;
    if (!this.selectedRoutes.length) {
      this.routeError = 'Selecciona al menos una factura.';
      return;
    }

    const tipoRuta = this.routeForm.tipoRuta.trim();
    const estado = this.routeForm.estado.trim() || 'GENERADA';
    const usuario = this.routeForm.usuario.trim();
    const usuarioAsignado = this.routeForm.usuarioAsignado.trim();
    const fechaRutaIso = this.toIsoDate(this.routeForm.fechaRuta);
    const noDocumentos = this.selectedRoutes
      .map((r) => r?.no_Documento ?? r?.id)
      .filter((v) => v !== undefined && v !== null);

    if (!tipoRuta || !usuario) {
      this.routeError = 'Completa tipo de ruta y usuario.';
      return;
    }

    if (!noDocumentos.length) {
      this.routeError = 'No hay facturas válidas seleccionadas.';
      return;
    }

    const nowIso = new Date().toISOString();
    const snapshots = this.selectedRoutes.map((r) => ({
      no_Documento: r?.no_Documento ?? 0,
      fechaInsert: nowIso,
      fecha_documento: r?.fecha_documento ?? nowIso,
      fecha_vencimiento: r?.fecha_vencimiento ?? nowIso,
      id_SN: r?.id_SN ?? '',
      nombre_SN: r?.nombre_SN ?? '',
      direccion_SN: r?.direccion_SN ?? '',
      total_Documento: r?.total_Documento ?? 0,
      total_Pagado: r?.total_Pagado ?? 0,
      u_contrasenia: r?.u_contrasenia ?? '',
      u_fecha_contrasenia: r?.u_fecha_contrasenia ?? nowIso,
      u_forma_pago: r?.u_forma_pago ?? '',
      todos_Dias: r?.todos_Dias ?? '',
      lunes: r?.lunes ?? '',
      martes: r?.martes ?? '',
      miercoles: r?.miercoles ?? '',
      jueves: r?.jueves ?? '',
      viernes: r?.viernes ?? '',
      ruta1: r?.ruta1 ?? '',
      ruta2: r?.ruta2 ?? '',
      ruta3: r?.ruta3 ?? '',
      ruta4: r?.ruta4 ?? '',
      estadoRegistro: r?.estadoRegistro ?? 'Activo',
      usuarioRegistro: r?.usuarioRegistro ?? usuario
    }));

    const snapshotCalls = snapshots.map((s) => this.api.createRouteSnapshot(s));

    this.routeSaving = true;
    forkJoin(snapshotCalls)
      .pipe(
        switchMap(() =>
          this.api.createRoute({
            tipoRuta,
            fechaRuta: fechaRutaIso,
            estado,
            usuario,
            usuarioAsignado,
            noDocumentos
          })
        )
      )
      .subscribe({
        next: () => {
          this.routeSaving = false;
          this.showRouteModal = false;
          this.selectedDocs.clear();
          this.load();
        },
        error: () => {
          this.routeSaving = false;
          this.routeError = 'No se pudo crear la ruta.';
        }
      });
  }

  AddPass(): void {
    this.saveError = null;
    this.passValue = '';
    this.showPassModal = true;
  }

  cancelPass(): void {
    this.showPassModal = false;
    this.passValue = '';
    this.saveError = null;
  }

  toggleSelected(r: any): void {
    const key = r?.no_Documento ?? r?.id ?? r;
    if (this.selectedDocs.has(key)) {
      this.selectedDocs.delete(key);
    } else {
      this.selectedDocs.add(key);
    }
  }

  isSelected(r: any): boolean {
    const key = r?.no_Documento ?? r?.id ?? r;
    return this.selectedDocs.has(key);
  }

  get selectedCount(): number {
    return this.selectedDocs.size;
  }

  confirmAddPass(): void {
    this.saveError = null;
    if (!this.passValue.trim()) {
      this.saveError = 'Ingresa una contraseña.';
      return;
    }
    if (this.passValue.length > this.maxPassLen) {
      this.saveError = `La contraseña no debe exceder ${this.maxPassLen} caracteres.`;
      return;
    }
    if (!this.selectedDocs.size) {
      this.saveError = 'Selecciona al menos una factura.';
      return;
    }
    // Construir y enviar un snapshot por cada factura seleccionada
    const nowIso = new Date().toISOString();
    const snapshots = this.selectedRoutes.map((r) => ({
      no_Documento: r?.no_Documento ?? 0,
      fechaInsert: nowIso,
      fecha_documento: r?.fecha_documento ?? nowIso,
      fecha_vencimiento: r?.fecha_vencimiento ?? nowIso,
      id_SN: r?.id_SN ?? '',
      nombre_SN: r?.nombre_SN ?? '',
      direccion_SN: r?.direccion_SN ?? '',
      total_Documento: r?.total_Documento ?? 0,
      total_Pagado: r?.total_Pagado ?? 0,
      u_contrasenia: this.passValue.trim(),
      u_fecha_contrasenia: nowIso,
      u_forma_pago: r?.u_forma_pago ?? '',
      todos_Dias: r?.todos_Dias ?? '',
      lunes: r?.lunes ?? '',
      martes: r?.martes ?? '',
      miercoles: r?.miercoles ?? '',
      jueves: r?.jueves ?? '',
      viernes: r?.viernes ?? '',
      ruta1: r?.ruta1 ?? '',
      ruta2: r?.ruta2 ?? '',
      ruta3: r?.ruta3 ?? '',
      ruta4: r?.ruta4 ?? '',
      estadoRegistro: r?.estadoRegistro ?? 'Activo',
      usuarioRegistro: r?.usuarioRegistro ?? 'system'
    }));

    this.saving = true;
    let completed = 0;
    let failed = false;
    if (!snapshots.length) {
      this.saving = false;
      this.saveError = 'No hay elementos seleccionados para guardar.';
      return;
    }
    snapshots.forEach((s) => {
      this.api.createRouteSnapshot(s).subscribe({
        next: () => {
          completed++;
          if (completed === snapshots.length && !failed) {
            this.saving = false;
            this.showPassModal = false;
            this.passValue = '';
            this.selectedDocs.clear();
            this.load();
          }
        },
        error: () => {
          failed = true;
          this.saving = false;
          this.saveError = 'No se pudo guardar una o más contraseñas.';
        }
      });
    });
  }

  buscar(): void {
    this.page = 1;
    this.load();
  }
}
