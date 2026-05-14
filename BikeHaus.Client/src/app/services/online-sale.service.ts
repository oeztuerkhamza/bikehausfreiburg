import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OnlineSale {
  id: number;
  bikeId: number;
  bikeUrl?: string | null;
  bikeTitle: string;
  preis: number;
  vorname: string;
  nachname: string;
  email: string;
  adresse: string;
  abholtag: string;
  molliePaymentId: string;
  isVerarbeitet: boolean;
  createdAt: string;
}

export interface OnlineSaleRefundResult {
  refundId: string;
  status: string;
  isVerarbeitet: boolean;
}

export interface OnlineSalesResult {
  total: number;
  items: OnlineSale[];
}

export interface OnlineSaleUpdate {
  vorname?: string;
  nachname?: string;
  email?: string;
  adresse?: string;
  abholtag?: string;
}

@Injectable({ providedIn: 'root' })
export class OnlineSaleService {
  private url = `${environment.apiUrl}/online-sales`;

  constructor(private http: HttpClient) {}

  getAll(
    page: number,
    pageSize: number,
    verarbeitet?: boolean,
  ): Observable<OnlineSalesResult> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    if (verarbeitet !== undefined)
      params = params.set('verarbeitet', verarbeitet.toString());
    return this.http.get<OnlineSalesResult>(this.url, { params });
  }

  getPendingCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.url}/pending-count`);
  }

  markProcessed(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/mark-processed`, {});
  }

  update(id: number, dto: OnlineSaleUpdate): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, dto);
  }

  downloadBeleg(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/beleg`, { responseType: 'blob' });
  }

  refund(id: number): Observable<OnlineSaleRefundResult> {
    return this.http.post<OnlineSaleRefundResult>(
      `${this.url}/${id}/refund`,
      {},
    );
  }
}
