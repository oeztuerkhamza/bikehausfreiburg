import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  RentalAccessory,
  RentalAccessoryCreate,
  RentalAccessoryList,
  RentalAccessoryUpdate,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class RentalAccessoryService {
  private url = `${environment.apiUrl}/rental-accessories`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RentalAccessoryList[]> {
    return this.http.get<RentalAccessoryList[]>(this.url);
  }

  getActive(): Observable<RentalAccessoryList[]> {
    return this.http.get<RentalAccessoryList[]>(`${this.url}/active`);
  }

  getById(id: number): Observable<RentalAccessory> {
    return this.http.get<RentalAccessory>(`${this.url}/${id}`);
  }

  create(dto: RentalAccessoryCreate): Observable<RentalAccessory> {
    return this.http.post<RentalAccessory>(this.url, dto);
  }

  update(id: number, dto: RentalAccessoryUpdate): Observable<RentalAccessory> {
    return this.http.put<RentalAccessory>(`${this.url}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
