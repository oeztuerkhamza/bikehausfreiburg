import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Reservation,
  ReservationCreate,
  ReservationList,
  ReservationUpdate,
  ReservationConvertToSale,
  Sale,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private url = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ReservationList[]> {
    return this.http.get<ReservationList[]>(this.url);
  }

  getById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.url}/${id}`);
  }

  create(reservation: ReservationCreate): Observable<Reservation> {
    return this.http.post<Reservation>(this.url, reservation);
  }

  update(id: number, reservation: ReservationUpdate): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.url}/${id}`, reservation);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  cancel(id: number): Observable<void> {
    return this.http.post<void>(`${this.url}/${id}/cancel`, {});
  }

  convertToSale(id: number, dto: ReservationConvertToSale): Observable<Sale> {
    return this.http.post<Sale>(`${this.url}/${id}/convert-to-sale`, dto);
  }

  expireOld(): Observable<void> {
    return this.http.post<void>(`${this.url}/expire-old`, {});
  }
}
