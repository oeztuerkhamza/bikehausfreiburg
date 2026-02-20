import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Sale,
  SaleCreate,
  SaleList,
  SaleUpdate,
  PaginatedResult,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private url = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SaleList[]> {
    return this.http.get<SaleList[]>(this.url);
  }

  getPaginated(
    page: number,
    pageSize: number,
    status?: string,
    search?: string,
    marke?: string,
    fahrradtyp?: string,
    farbe?: string,
  ): Observable<PaginatedResult<SaleList>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);
    if (marke) params = params.set('marke', marke);
    if (fahrradtyp) params = params.set('fahrradtyp', fahrradtyp);
    if (farbe) params = params.set('farbe', farbe);

    return this.http.get<PaginatedResult<SaleList>>(`${this.url}/paginated`, {
      params,
    });
  }

  getById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.url}/${id}`);
  }

  create(sale: SaleCreate): Observable<Sale> {
    return this.http.post<Sale>(this.url, sale);
  }

  getNextBelegNummer(): Observable<{ belegNummer: string }> {
    return this.http.get<{ belegNummer: string }>(
      `${this.url}/next-belegnummer`,
    );
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
