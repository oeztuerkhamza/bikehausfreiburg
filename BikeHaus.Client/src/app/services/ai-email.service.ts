import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AiEmailReplyRequest {
  body: string;
  instruction: string;
  fromName?: string;
  fromEmail?: string;
  subject?: string;
  tone?: 'formal' | 'friendly';
}

export interface AiEmailReplyResponse {
  detectedLanguage: string;
  detectedLanguageName: string;
  replySubject: string;
  replyBody: string;
}

@Injectable({ providedIn: 'root' })
export class AiEmailService {
  private url = `${environment.apiUrl}/aiemail`;

  constructor(private http: HttpClient) {}

  generateReply(req: AiEmailReplyRequest): Observable<AiEmailReplyResponse> {
    return this.http.post<AiEmailReplyResponse>(`${this.url}/generate-reply`, req);
  }
}
