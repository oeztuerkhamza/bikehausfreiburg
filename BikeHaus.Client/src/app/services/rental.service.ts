import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Rental,
  RentalCreate,
  RentalList,
  RentalUpdate,
  RentalReturn,
  PaginatedResult,
} from '../models/models';

export interface RentalCalendarItem {
  id: number;
  mietvertragNummer: string;
  bikeInfo: string;
  customerName: string;
  startDatum: string;
  endDatum: string;
  status: string;
  hasEBike: boolean;
}

@Injectable({ providedIn: 'root' })
export class RentalService {
  private url = `${environment.apiUrl}/rentals`;

  constructor(private http: HttpClient) {}

  getCalendar(from: string, to: string): Observable<RentalCalendarItem[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<RentalCalendarItem[]>(`${this.url}/calendar`, {
      params,
    });
  }

  getAll(): Observable<RentalList[]> {
    return this.http.get<RentalList[]>(this.url);
  }

  getPaginated(
    page: number,
    pageSize: number,
    status?: string,
    search?: string,
  ): Observable<PaginatedResult<RentalList>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);

    return this.http.get<PaginatedResult<RentalList>>(`${this.url}/paginated`, {
      params,
    });
  }

  getById(id: number): Observable<Rental> {
    return this.http.get<Rental>(`${this.url}/${id}`);
  }

  create(rental: RentalCreate): Observable<Rental> {
    return this.http.post<Rental>(this.url, rental);
  }

  update(id: number, rental: RentalUpdate): Observable<Rental> {
    return this.http.put<Rental>(`${this.url}/${id}`, rental);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  returnBicycle(id: number, payload: RentalReturn): Observable<Rental> {
    return this.http.post<Rental>(`${this.url}/${id}/return`, payload);
  }

  cancel(id: number): Observable<Rental> {
    return this.http.post<Rental>(`${this.url}/${id}/cancel`, {});
  }

  downloadMietvertragPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/mietvertrag-pdf`, {
      responseType: 'blob',
    });
  }

  downloadMietbedingungenPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/bedingungen-pdf`, {
      responseType: 'blob',
    });
  }

  downloadKautionsquittungPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/kaution-pdf`, {
      responseType: 'blob',
    });
  }

  uploadAusweis(id: number, file: File): Observable<{ path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ path: string }>(`${this.url}/${id}/ausweis`, formData);
  }

  downloadAusweis(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/ausweis`, { responseType: 'blob' });
  }
}
