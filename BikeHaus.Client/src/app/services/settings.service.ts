import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ShopSettings {
  id: number;
  shopName: string;
  strasse?: string;
  hausnummer?: string;
  plz?: string;
  stadt?: string;
  telefon?: string;
  email?: string;
  website?: string;
  steuernummer?: string;
  ustIdNr?: string;
  bankname?: string;
  iban?: string;
  bic?: string;
  logoBase64?: string;
  logoFileName?: string;
  inhaberVorname?: string;
  inhaberNachname?: string;
  inhaberSignatureBase64?: string;
  inhaberSignatureFileName?: string;
  fahrradNummerStart: number;
  oeffnungszeiten?: string;
  zusatzinfo?: string;
  fullAddress?: string;
}

export interface UpdateShopSettings {
  shopName: string;
  strasse?: string;
  hausnummer?: string;
  plz?: string;
  stadt?: string;
  telefon?: string;
  email?: string;
  website?: string;
  steuernummer?: string;
  ustIdNr?: string;
  bankname?: string;
  iban?: string;
  bic?: string;
  inhaberVorname?: string;
  inhaberNachname?: string;
  fahrradNummerStart: number;
  oeffnungszeiten?: string;
  zusatzinfo?: string;
}

export interface UploadLogo {
  logoBase64: string;
  fileName: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly apiUrl = 'http://localhost:5196/api/settings';

  constructor(private readonly http: HttpClient) {}

  getSettings(): Observable<ShopSettings> {
    return this.http.get<ShopSettings>(this.apiUrl);
  }

  updateSettings(settings: UpdateShopSettings): Observable<ShopSettings> {
    return this.http.put<ShopSettings>(this.apiUrl, settings);
  }

  uploadLogo(logo: UploadLogo): Observable<ShopSettings> {
    return this.http.post<ShopSettings>(`${this.apiUrl}/logo`, logo);
  }

  deleteLogo(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/logo`);
  }

  uploadOwnerSignature(data: {
    signatureBase64: string;
    fileName: string;
  }): Observable<ShopSettings> {
    return this.http.post<ShopSettings>(`${this.apiUrl}/owner-signature`, data);
  }

  deleteOwnerSignature(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/owner-signature`);
  }
}
