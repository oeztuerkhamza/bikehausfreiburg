import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Return, ReturnCreate, ReturnList } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReturnService {
  private url = `${environment.apiUrl}/returns`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ReturnList[]> {
    return this.http.get<ReturnList[]>(this.url);
  }

  getById(id: number): Observable<Return> {
    return this.http.get<Return>(`${this.url}/${id}`);
  }

  create(returnData: ReturnCreate): Observable<Return> {
    return this.http.post<Return>(this.url, returnData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  downloadRueckgabebeleg(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/rueckgabebeleg`, {
      responseType: 'blob',
    });
  }
}
