
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  getRoutes(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.baseUrl}/legacy/PendingPass`);
  }

  getRoutesByDate(dateFrom: string, dateTo: string): Observable<unknown[]> {
    const params = `dateFrom=${encodeURIComponent(dateFrom)}&dateTo=${encodeURIComponent(dateTo)}`;
    return this.http.get<unknown[]>(`${this.baseUrl}/legacy/PendingPass/GetByDate?${params}`);
  }

  createRouteSnapshot(payload: unknown): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/legacy/Routes/snapshot`, payload);
  }

  createRoute(payload: unknown): Observable<unknown> {
    return this.http.post<unknown>(`${this.baseUrl}/legacy/Routes/route`, payload);
  }

  // Agrega forma de pago a un snapshot específico
  addPaymentForm(noDocumento: number, payload: { montoPago: number; formaPago: string; usuario: string }): Observable<unknown> {
    // El contrato ahora es PATCH /legacy/Routes/snapshot/{noDocumento}
    return this.http.patch<unknown>(`${this.baseUrl}/legacy/Routes/snapshot/${noDocumento}`, payload);
  }

  getPendingPayments(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.baseUrl}/legacy/PendingPayment`);
  }
}
