import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RentalReview, RentalReviewApprove } from '../models/models';

@Injectable({ providedIn: 'root' })
export class RentalReviewService {
  private url = `${environment.apiUrl}/rental-reviews`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RentalReview[]> {
    return this.http.get<RentalReview[]>(this.url);
  }

  getPending(): Observable<RentalReview[]> {
    return this.http.get<RentalReview[]>(`${this.url}/pending`);
  }

  approve(id: number, dto: RentalReviewApprove): Observable<RentalReview> {
    return this.http.put<RentalReview>(`${this.url}/${id}/approve`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
