import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Bicycle, BicycleCreate, BicycleUpdate } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BicycleService {
  private url = `${environment.apiUrl}/bicycles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Bicycle[]> {
    return this.http.get<Bicycle[]>(this.url);
  }

  getById(id: number): Observable<Bicycle> {
    return this.http.get<Bicycle>(`${this.url}/${id}`);
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
}
