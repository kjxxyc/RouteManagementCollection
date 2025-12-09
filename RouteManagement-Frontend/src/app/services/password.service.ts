import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Password, CapturePasswordRequest } from '../models/password.model';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/passwords`;

  getByRouteId(routeId: number): Observable<Password> {
    return this.http.get<Password>(`${this.apiUrl}/route/${routeId}`);
  }

  capture(request: CapturePasswordRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }
}
