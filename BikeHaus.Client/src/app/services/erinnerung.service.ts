import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Erinnerung, ErinnerungApprove } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ErinnerungService {
  private url = `${environment.apiUrl}/erinnerungen`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Erinnerung[]> {
    return this.http.get<Erinnerung[]>(this.url);
  }

  getPending(): Observable<Erinnerung[]> {
    return this.http.get<Erinnerung[]>(`${this.url}/pending`);
  }

  approve(id: number, dto: ErinnerungApprove): Observable<Erinnerung> {
    return this.http.put<Erinnerung>(`${this.url}/${id}/approve`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
