import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuditLog } from '../models/audit.model';
import { PagedResult } from '../models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/audit`;

  getAll(entityType?: string, entityId?: number, page: number = 1, pageSize: number = 10): Observable<PagedResult<AuditLog>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (entityType) {
      params = params.set('entityType', entityType);
    }
    if (entityId !== undefined) {
      params = params.set('entityId', entityId.toString());
    }

    return this.http.get<PagedResult<AuditLog>>(this.apiUrl, { params });
  }
}
