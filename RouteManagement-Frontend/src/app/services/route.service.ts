import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Route, CreateRouteRequest, UpdateRouteRequest, ChangeRouteStatusRequest } from '../models/route.model';
import { PagedResult } from '../models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/routes`;

  getAll(startDate?: Date, endDate?: Date, status?: string, page: number = 1, pageSize: number = 10): Observable<PagedResult<Route>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (startDate) {
      params = params.set('startDate', startDate.toISOString());
    }
    if (endDate) {
      params = params.set('endDate', endDate.toISOString());
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PagedResult<Route>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Route> {
    return this.http.get<Route>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateRouteRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }

  update(id: number, request: UpdateRouteRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  publish(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/publish`, {});
  }

  changeStatus(id: number, request: ChangeRouteStatusRequest): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, request);
  }
}
