import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Return,
  ReturnCreate,
  ReturnList,
  PaginatedResult,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReturnService {
  private url = `${environment.apiUrl}/returns`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ReturnList[]> {
    return this.http.get<ReturnList[]>(this.url);
  }

  getPaginated(
    page: number,
    pageSize: number,
    status?: string,
    search?: string,
  ): Observable<PaginatedResult<ReturnList>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);

    return this.http.get<PaginatedResult<ReturnList>>(`${this.url}/paginated`, {
      params,
    });
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
