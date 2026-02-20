import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Bicycle,
  BicycleCreate,
  BicycleUpdate,
  PaginatedResult,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class BicycleService {
  private url = `${environment.apiUrl}/bicycles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Bicycle[]> {
    return this.http.get<Bicycle[]>(this.url);
  }

  getPaginated(
    page: number,
    pageSize: number,
    status?: string,
    search?: string,
    zustand?: string,
    fahrradtyp?: string,
    reifengroesse?: string,
    marke?: string,
  ): Observable<PaginatedResult<Bicycle>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);
    if (zustand) params = params.set('zustand', zustand);
    if (fahrradtyp) params = params.set('fahrradtyp', fahrradtyp);
    if (reifengroesse) params = params.set('reifengroesse', reifengroesse);
    if (marke) params = params.set('marke', marke);

    return this.http.get<PaginatedResult<Bicycle>>(`${this.url}/paginated`, {
      params,
    });
  }

  getById(id: number): Observable<Bicycle> {
    return this.http.get<Bicycle>(`${this.url}/${id}`);
  }

  getByStokNo(stokNo: string): Observable<Bicycle> {
    return this.http.get<Bicycle>(`${this.url}/by-stokno/${stokNo}`);
  }

  getNextStokNo(): Observable<{ stokNo: string }> {
    return this.http.get<{ stokNo: string }>(`${this.url}/next-stokno`);
  }

  getAvailable(): Observable<Bicycle[]> {
    return this.http.get<Bicycle[]>(`${this.url}/available`);
  }

  search(term: string): Observable<Bicycle[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<Bicycle[]>(`${this.url}/search`, { params });
  }

  create(bicycle: BicycleCreate): Observable<Bicycle> {
    return this.http.post<Bicycle>(this.url, bicycle);
  }

  update(id: number, bicycle: BicycleUpdate): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, bicycle);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/brands`);
  }

  getModels(brand?: string): Observable<string[]> {
    let params = new HttpParams();
    if (brand) params = params.set('brand', brand);
    return this.http.get<string[]>(`${this.url}/models`, { params });
  }
}
