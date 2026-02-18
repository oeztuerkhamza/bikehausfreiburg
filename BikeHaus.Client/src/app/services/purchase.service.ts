import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Purchase, PurchaseCreate, PurchaseList, PurchaseUpdate } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private url = `${environment.apiUrl}/purchases`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PurchaseList[]> {
    return this.http.get<PurchaseList[]>(this.url);
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

  update(id: number, purchase: PurchaseUpdate): Observable<Purchase> {
    return this.http.put<Purchase>(`${this.url}/${id}`, purchase);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  downloadKaufbeleg(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/kaufbeleg`, {
      responseType: 'blob',
    });
  }
}
