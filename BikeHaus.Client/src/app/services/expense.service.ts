import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Expense {
  id: number;
  bezeichnung: string;
  kategorie: string | null;
  betrag: number;
  datum: string;
  lieferant: string | null;
  belegNummer: string | null;
  belegDatei: string | null;
  notizen: string | null;
  faelligkeitsDatum: string | null;
  bezahlt: boolean;
  zahlungsart: string | null;
  createdAt?: string;
}

export interface ExpenseCreate {
  bezeichnung: string;
  kategorie: string | null;
  betrag: number;
  datum: string;
  lieferant: string | null;
  belegNummer: string | null;
  notizen: string | null;
  faelligkeitsDatum: string | null;
  bezahlt: boolean;
  zahlungsart: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private apiUrl = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl);
  }

  getById(id: number): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/${id}`);
  }

  search(query: string): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.apiUrl}/search`, {
      params: { q: query },
    });
  }

  create(expense: ExpenseCreate): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, expense);
  }

  update(id: number, expense: ExpenseCreate): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${id}`, expense);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadDocument(id: number, file: File): Observable<Expense> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Expense>(`${this.apiUrl}/${id}/document`, formData);
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/document`);
  }

  getDocumentUrl(path: string): string {
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }
}
