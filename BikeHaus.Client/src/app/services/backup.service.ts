import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BackupService {
  private readonly apiUrl = `${environment.apiUrl}/backup`;

  constructor(private readonly http: HttpClient) {}

  downloadBackup(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download`, {
      responseType: 'blob',
    });
  }

  restoreBackup(file: File): Observable<{ message: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ message: string }>(
      `${this.apiUrl}/restore`,
      formData,
    );
  }
}
