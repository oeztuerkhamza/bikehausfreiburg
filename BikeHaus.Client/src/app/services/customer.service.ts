import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Customer, CustomerCreate, CustomerUpdate } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private url = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.url);
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.url}/${id}`);
  }

  search(term: string): Observable<Customer[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<Customer[]>(`${this.url}/search`, { params });
  }

  create(customer: CustomerCreate): Observable<Customer> {
    return this.http.post<Customer>(this.url, customer);
  }

  update(id: number, customer: CustomerUpdate): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, customer);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
