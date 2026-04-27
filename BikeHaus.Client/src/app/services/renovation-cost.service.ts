import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RenovationCost {
  id: number;
  datum: string;
  betrag: number;
  gemachteArbeit: string;
  notizen: string | null;
  createdAt?: string;
}

export interface RenovationCostCreate {
  datum: string;
  betrag: number;
  gemachteArbeit: string;
  notizen: string | null;
}

@Injectable({ providedIn: 'root' })
export class RenovationCostService {
  private apiUrl = `${environment.apiUrl}/renovationcosts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RenovationCost[]> {
    return this.http.get<RenovationCost[]>(this.apiUrl);
  }

  create(dto: RenovationCostCreate): Observable<RenovationCost> {
    return this.http.post<RenovationCost>(this.apiUrl, dto);
  }

  update(id: number, dto: RenovationCostCreate): Observable<RenovationCost> {
    return this.http.put<RenovationCost>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
