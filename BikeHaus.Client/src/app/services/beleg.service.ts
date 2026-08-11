import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  BelegArt,
  BelegListItem,
  FlatpayImportResult,
} from '../models/models';

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

  /**
   * Flatpay-Transaktionsbericht (.xlsx) hochladen. Der Server hakt die
   * passenden Belege an und meldet, was offen blieb.
   */
  importFlatpayReport(file: File): Observable<FlatpayImportResult> {
    const form = new FormData();
    form.append('datei', file, file.name);
    return this.http.post<FlatpayImportResult>(
      `${this.apiUrl}/flatpay/import`,
      form,
    );
  }

  /** Häkchen "in Flatpay verbucht" setzen oder entfernen. */
  setFlatpay(
    art: BelegArt,
    id: number,
    flatpay: boolean,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/flatpay`, { art, id, flatpay });
  }
}
