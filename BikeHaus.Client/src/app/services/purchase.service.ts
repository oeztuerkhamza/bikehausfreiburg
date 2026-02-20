import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Purchase,
  PurchaseCreate,
  PurchaseList,
  PurchaseUpdate,
  BulkPurchaseCreate,
  BulkPurchaseResult,
  PaginatedResult,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private url = `${environment.apiUrl}/purchases`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PurchaseList[]> {
    return this.http.get<PurchaseList[]>(this.url);
  }

  getPaginated(
    page: number,
    pageSize: number,
    status?: string,
    search?: string,
    marke?: string,
    fahrradtyp?: string,
    farbe?: string,
  ): Observable<PaginatedResult<PurchaseList>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);
    if (marke) params = params.set('marke', marke);
    if (fahrradtyp) params = params.set('fahrradtyp', fahrradtyp);
    if (farbe) params = params.set('farbe', farbe);

    return this.http.get<PaginatedResult<PurchaseList>>(
      `${this.url}/paginated`,
      {
        params,
      },
    );
  }

  getById(id: number): Observable<Purchase> {
    return this.http.get<Purchase>(`${this.url}/${id}`);
  }

  getByBicycleId(bicycleId: number): Observable<Purchase> {
    return this.http.get<Purchase>(`${this.url}/by-bicycle/${bicycleId}`);
  }

  create(purchase: PurchaseCreate): Observable<Purchase> {
    return this.http.post<Purchase>(this.url, purchase);
  }

  createBulk(bulk: BulkPurchaseCreate): Observable<BulkPurchaseResult> {
    return this.http.post<BulkPurchaseResult>(`${this.url}/bulk`, bulk);
  }

  getNextBelegNummer(): Observable<{ belegNummer: string }> {
    return this.http.get<{ belegNummer: string }>(
      `${this.url}/next-belegnummer`,
    );
  }

  update(id: number, purchase: PurchaseUpdate): Observable<Purchase> {
    return this.http.put<Purchase>(`${this.url}/${id}`, purchase);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  getStoreNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/store-names`);
  }

  downloadKaufbeleg(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/kaufbeleg`, {
      responseType: 'blob',
    });
  }
}
