import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AccessoryCatalog,
  AccessoryCatalogCreate,
  AccessoryCatalogList,
  AccessoryCatalogUpdate,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class AccessoryCatalogService {
  private url = `${environment.apiUrl}/accessorycatalog`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AccessoryCatalogList[]> {
    return this.http.get<AccessoryCatalogList[]>(this.url);
  }

  getActive(): Observable<AccessoryCatalogList[]> {
    return this.http.get<AccessoryCatalogList[]>(`${this.url}/active`);
  }

  search(query: string): Observable<AccessoryCatalogList[]> {
    return this.http.get<AccessoryCatalogList[]>(`${this.url}/search`, {
      params: { q: query },
    });
  }

  getById(id: number): Observable<AccessoryCatalog> {
    return this.http.get<AccessoryCatalog>(`${this.url}/${id}`);
  }

  create(data: AccessoryCatalogCreate): Observable<AccessoryCatalog> {
    return this.http.post<AccessoryCatalog>(this.url, data);
  }

  update(
    id: number,
    data: AccessoryCatalogUpdate,
  ): Observable<AccessoryCatalog> {
    return this.http.put<AccessoryCatalog>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
