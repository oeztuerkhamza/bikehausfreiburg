import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Sale, SaleCreate, SaleList, SaleUpdate } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private url = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SaleList[]> {
    return this.http.get<SaleList[]>(this.url);
  }

  getById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.url}/${id}`);
  }

  create(sale: SaleCreate): Observable<Sale> {
    return this.http.post<Sale>(this.url, sale);
  }

  update(id: number, sale: SaleUpdate): Observable<Sale> {
    return this.http.put<Sale>(`${this.url}/${id}`, sale);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  downloadVerkaufsbeleg(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/verkaufsbeleg`, {
      responseType: 'blob',
    });
  }
}
