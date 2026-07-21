import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AppReleaseInfo {
  available: boolean;
  fileName?: string;
  sizeBytes?: number;
  updatedAt?: string;
}

/**
 * Android-App (APK) Download. Läuft über einen JWT-geschützten Endpunkt,
 * damit die Datei nicht öffentlich erreichbar ist.
 */
@Injectable({
  providedIn: 'root',
})
export class AppReleaseService {
  private readonly apiUrl = `${environment.apiUrl}/apprelease`;

  constructor(private readonly http: HttpClient) {}

  getInfo(): Observable<AppReleaseInfo> {
    return this.http.get<AppReleaseInfo>(`${this.apiUrl}/info`);
  }

  download(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download`, {
      responseType: 'blob',
    });
  }
}
