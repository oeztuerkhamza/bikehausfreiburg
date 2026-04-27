import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PaginatedResult,
  RentalBooking,
  RentalBookingApprove,
  RentalBookingCancel,
  RentalBookingList,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class RentalBookingService {
  private url = `${environment.apiUrl}/rental-bookings`;

  constructor(private http: HttpClient) {}

  getPaginated(
    page: number,
    pageSize: number,
    status?: string,
    search?: string,
  ): Observable<PaginatedResult<RentalBookingList>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);

    return this.http.get<PaginatedResult<RentalBookingList>>(
      `${this.url}/paginated`,
      { params },
    );
  }

  getById(id: number): Observable<RentalBooking> {
    return this.http.get<RentalBooking>(`${this.url}/${id}`);
  }

  approve(id: number, dto: RentalBookingApprove): Observable<RentalBooking> {
    return this.http.post<RentalBooking>(`${this.url}/${id}/approve`, dto);
  }

  cancel(id: number, dto: RentalBookingCancel): Observable<RentalBooking> {
    return this.http.post<RentalBooking>(`${this.url}/${id}/cancel`, dto);
  }

  getPendingCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.url}/pending-count`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
