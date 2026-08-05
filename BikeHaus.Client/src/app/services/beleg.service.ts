import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BelegListItem } from '../models/models';

/**
 * Gemeinsame Sicht auf Miet- und Verkaufsbelege. Der PDF-Export liefert alle
 * Belege des Zeitraums in EINER Datei, in derselben Reihenfolge wie die Liste.
 */
@Injectable({
  providedIn: 'root',
})
export class BelegService {
  private readonly apiUrl = `${environment.apiUrl}/belege`;

  constructor(private readonly http: HttpClient) {}

  getBelege(startDate: string, endDate: string): Observable<BelegListItem[]> {
    return this.http.get<BelegListItem[]>(this.apiUrl, {
      params: { startDate, endDate },
    });
  }

  downloadCombinedPdf(startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/pdf`, {
      params: { startDate, endDate },
      responseType: 'blob',
    });
  }

  getAnkaufBelege(startDate: string, endDate: string): Observable<BelegListItem[]> {
    return this.http.get<BelegListItem[]>(`${this.apiUrl}/ankauf`, {
      params: { startDate, endDate },
    });
  }

  downloadAnkaufPdf(startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/ankauf/pdf`, {
      params: { startDate, endDate },
      responseType: 'blob',
    });
  }
}
