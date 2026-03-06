import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Invoice {
  id: number;
  rechnungsNummer: string;
  datum: string;
  betrag: number;
  bezeichnung: string;
  kategorie: string | null;
  kundenName: string | null;
  kundenAdresse: string | null;
  notizen: string | null;
  createdAt?: string;
}

export interface InvoiceCreate {
  rechnungsNummer: string | null;
  datum: string;
  betrag: number;
  bezeichnung: string;
  kategorie: string | null;
  kundenName: string | null;
  kundenAdresse: string | null;
  notizen: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  getById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  search(query: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/search`, {
      params: { q: query },
    });
  }

  getNextRechnungsNummer(): Observable<{ rechnungsNummer: string }> {
    return this.http.get<{ rechnungsNummer: string }>(
      `${this.apiUrl}/next-number`,
    );
  }

  create(invoice: InvoiceCreate): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice);
  }

  update(id: number, invoice: InvoiceCreate): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, invoice);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      responseType: 'blob',
    });
  }
}
