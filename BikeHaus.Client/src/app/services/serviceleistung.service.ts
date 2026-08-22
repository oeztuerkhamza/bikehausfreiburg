import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Serviceleistung {
  id: number;
  belegNummer: string;
  datum: string;
  kundeName: string;
  kundeTelefon: string | null;
  kundeEmail: string | null;
  kundeAdresse: string | null;
  fahrradMarke: string | null;
  fahrradModell: string | null;
  rahmennummer: string | null;
  farbe: string | null;
  durchgefuehrteArbeiten: string;
  verwendeteTeile: string | null;
  preis: number | null;
  zahlungsart: string | null;
  notizen: string | null;
  createdAt?: string;
}

export interface ServiceleistungCreate {
  datum: string;
  kundeName: string;
  kundeTelefon: string | null;
  kundeEmail: string | null;
  kundeAdresse: string | null;
  fahrradMarke: string | null;
  fahrradModell: string | null;
  rahmennummer: string | null;
  farbe: string | null;
  durchgefuehrteArbeiten: string;
  verwendeteTeile: string | null;
  preis: number | null;
  zahlungsart: string | null;
  notizen: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ServiceleistungService {
  private apiUrl = `${environment.apiUrl}/serviceleistungen`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Serviceleistung[]> {
    return this.http.get<Serviceleistung[]>(this.apiUrl);
  }

  getById(id: number): Observable<Serviceleistung> {
    return this.http.get<Serviceleistung>(`${this.apiUrl}/${id}`);
  }

  create(item: ServiceleistungCreate): Observable<Serviceleistung> {
    return this.http.post<Serviceleistung>(this.apiUrl, item);
  }

  update(id: number, item: ServiceleistungCreate): Observable<Serviceleistung> {
    return this.http.put<Serviceleistung>(`${this.apiUrl}/${id}`, item);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getNextBelegNummer(): Observable<{ belegNummer: string }> {
    return this.http.get<{ belegNummer: string }>(
      `${this.apiUrl}/next-belegnummer`,
    );
  }

  downloadServicebeleg(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/servicebeleg`, {
      responseType: 'blob',
    });
  }
}
