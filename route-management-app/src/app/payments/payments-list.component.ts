
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments-list.component.html',
  styleUrl: './payments-list.component.scss'
})

export class PaymentsListComponent implements OnInit {
  payments: any[] = [];
  filteredPayments: any[] = [];
  loading = false;
  error: string | null = null;
  search = '';
  pageSize = 10;
  page = 1;

  // Filtros visuales para igualar a rutas
  ruta = '';
  fechaRuta: string | null = null;
  fechaDocumento: string | null = null;

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    // No establecer fechas por defecto; solo filtrar cuando el usuario las provea
    this.fechaRuta = null;
    this.fechaDocumento = null;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.api.getPendingPayments().subscribe({
      next: (data) => {
        this.payments = data ?? [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar facturas con contraseña.';
        this.loading = false;
      }
    });
  }
/*
  onSearchChange(event: any): void {
    const value = event?.target ? event.target.value : event;
    this.search = String(value ?? '').trim();
    this.page = 1;
    this.applyFilters();
  }*/

  onSearchChange(value: string | number | null): void {
    this.search = String(value ?? '').trim();
    this.page = 1;
    this.applyFilters();
  }

  onPageSizeChange(event: any): void {
    const value = event?.target ? event.target.value : event;
    const size = Number(value ?? 10) || 10;
    this.pageSize = size;
    this.page = 1;
    this.applyFilters();
  }

  changePage(delta: number): void {
    const totalPages = Math.max(1, Math.ceil(this.filteredPayments.length / this.pageSize));
    this.page = Math.min(Math.max(1, this.page + delta), totalPages);
  }

  get pagedPayments(): any[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredPayments.slice(start, start + this.pageSize);
  }

  private applyFilters(): void {
    const term = this.search.trim().toLowerCase();
    let base = this.payments ?? [];
    // Filtro por texto
    if (term) {
      base = base.filter((r) => {
        const doc = String(r.no_Documento ?? '').toLowerCase();
        const name = String(r.nombre_SN ?? '').toLowerCase();
        const desc = String(r.direccion_SN ?? '').toLowerCase();
        return doc.includes(term) || name.includes(term) || desc.includes(term);
      });
    }
    // Filtro por ruta
    const rutaText = this.ruta.trim().toLowerCase();
    if (rutaText) {
      base = base.filter((r) => String(r.noRuta ?? '').toLowerCase().includes(rutaText));
    }
    // Filtro por fecha documento (rango)
    const fromDate = this.toLocalYMDDate(this.fechaRuta);
    const toDate = this.toLocalYMDDate(this.fechaDocumento);
    if (fromDate || toDate) {
      base = base.filter((r) => {
        const docDate = r.fecha_documento ? new Date(r.fecha_documento) : null;
        const gteFrom = fromDate && docDate ? docDate >= fromDate : true;
        const lteTo = toDate && docDate ? docDate <= toDate : true;
        return gteFrom && lteTo;
      });
    }
    // Estado por defecto como en rutas
    this.filteredPayments = base.map((r) => ({
      ...r,
      estadoRegistro: r?.estadoRegistro || 'Registrado'
    }));
  }

  // Selección y modal de pago
  private selectedDocs = new Set<string | number>();
  showPaymentModal = false;
  paymentForma = '';
  paymentMonto = 0;
  saving = false;
  saveError: string | null = null;

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

  get selectedPayments(): any[] {
    const keys = this.selectedDocs;
    if (!keys.size) return [];
    const all = this.payments ?? [];
    return all.filter((r) => keys.has(r?.no_Documento ?? r?.id));
  }

  openPaymentModal(): void {
    this.saveError = null;
    this.paymentForma = '';
    this.paymentMonto = 0;
    this.showPaymentModal = true;
  }

  cancelPayment(): void {
    this.showPaymentModal = false;
    this.paymentForma = '';
    this.paymentMonto = 0;
    this.saveError = null;
  }

  confirmPayment(): void {
    this.saveError = null;
    if (!this.selectedDocs.size) {
      this.saveError = 'Selecciona al menos una factura.';
      return;
    }
    if (!this.paymentForma.trim()) {
      this.saveError = 'Selecciona la forma de pago.';
      return;
    }
    if (this.paymentMonto <= 0) {
      this.saveError = 'Ingresa un monto válido.';
      return;
    }
    // Según contrato del API se envía por documento
    const ids = Array.from(this.selectedDocs);
    this.saving = true;
    let completed = 0;
    let failed = false;
    ids.forEach((id) => {
      const formaCode = this.paymentForma.trim().toUpperCase();
      const monto = Number(this.paymentMonto.toFixed ? this.paymentMonto.toFixed(2) : this.paymentMonto);
      const docId = Number(id);
      this.api.addPaymentForm(docId, {
        montoPago: isNaN(monto) ? this.paymentMonto : monto,
        formaPago: formaCode,
        usuario: 'system'
      }).subscribe({
        next: () => {
          completed++;
          if (completed === ids.length && !failed) {
            this.saving = false;
            this.showPaymentModal = false;
            this.selectedDocs.clear();
            this.paymentForma = '';
            this.paymentMonto = 0;
            this.load();
          }
        },
        error: () => {
          failed = true;
          this.saving = false;
          this.saveError = 'No se pudo registrar la forma de pago.';
        }
      });
    });
  }

  buscar(): void {
    this.applyFilters();
    this.page = 1;
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
    return new Date(`${ymd}T00:00:00`);
  }
  
}
