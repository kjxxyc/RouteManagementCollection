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

  getRouteById(id: number): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/legacy/${id}`);
  }
}
