import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Reservation,
  ReservationCreate,
  ReservationList,
  ReservationUpdate,
  ReservationConvertToSale,
  Sale,
  PaginatedResult,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private url = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ReservationList[]> {
    return this.http.get<ReservationList[]>(this.url);
  }

  getPaginated(
    page: number,
    pageSize: number,
    status?: string,
    search?: string,
  ): Observable<PaginatedResult<ReservationList>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);

    return this.http.get<PaginatedResult<ReservationList>>(
      `${this.url}/paginated`,
      {
        params,
      },
    );
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
