import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Invoice, CreateInvoiceRequest } from '../models/invoice.model';
import { PagedResult } from '../models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/invoices`;

  getAll(routeId?: number, isOutOfRoute?: boolean, page: number = 1, pageSize: number = 10): Observable<PagedResult<Invoice>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (routeId !== undefined) {
      params = params.set('routeId', routeId.toString());
    }
    if (isOutOfRoute !== undefined) {
      params = params.set('isOutOfRoute', isOutOfRoute.toString());
    }

    return this.http.get<PagedResult<Invoice>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateInvoiceRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
