import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CampaignPreview {
  recipientCount: number;
  skippedUnsubscribed: number;
}

export interface CampaignActionResult {
  ok: boolean;
  message: string;
  total: number;
}

export interface CampaignStatus {
  state: 'idle' | 'running' | 'completed' | 'failed';
  total: number;
  sent: number;
  failed: number;
  startedAt: string | null;
  finishedAt: string | null;
  lastError: string | null;
}

@Injectable({ providedIn: 'root' })
export class CampaignService {
  private url = `${environment.apiUrl}/newsletter`;

  constructor(private http: HttpClient) {}

  // ── Google-review campaign ──
  preview(): Observable<CampaignPreview> {
    return this.http.get<CampaignPreview>(`${this.url}/campaign/preview`);
  }

  sendTest(email: string): Observable<CampaignActionResult> {
    return this.http.post<CampaignActionResult>(`${this.url}/campaign/test`, {
      email,
    });
  }

  send(): Observable<CampaignActionResult> {
    return this.http.post<CampaignActionResult>(`${this.url}/campaign/send`, {});
  }

  status(): Observable<CampaignStatus> {
    return this.http.get<CampaignStatus>(`${this.url}/campaign/status`);
  }

  // ── opt-out (Abmelde-) list management ──
  getUnsubscribed(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/unsubscribed`);
  }

  addUnsubscribe(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.url}/unsubscribe`, {
      email,
    });
  }

  removeUnsubscribe(email: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.url}/unsubscribe?email=${encodeURIComponent(email)}`,
    );
  }
}
