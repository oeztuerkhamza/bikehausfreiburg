import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Expense {
  id: number;
  bezeichnung: string;
  kategorie: string | null;
  betrag: number;
  datum: string;
  lieferant: string | null;
  belegNummer: string | null;
  notizen: string | null;
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
}

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private apiUrl = 'http://localhost:5196/api/expenses';

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
}
