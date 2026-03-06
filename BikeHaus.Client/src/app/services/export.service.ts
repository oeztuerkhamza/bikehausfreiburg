import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private readonly apiUrl = `${environment.apiUrl}/export`;

  constructor(private readonly http: HttpClient) {}

  downloadZip(startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/zip`, {
      params: { startDate, endDate },
      responseType: 'blob',
    });
  }
}
