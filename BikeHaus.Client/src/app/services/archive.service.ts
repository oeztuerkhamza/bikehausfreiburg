import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ArchiveSearchResult,
  ArchiveBicycleHistory,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class ArchiveService {
  private url = `${environment.apiUrl}/archive`;

  constructor(private http: HttpClient) {}

  search(query: string): Observable<ArchiveSearchResult[]> {
    return this.http.get<ArchiveSearchResult[]>(`${this.url}/search`, {
      params: { q: query },
    });
  }

  getHistory(bicycleId: number): Observable<ArchiveBicycleHistory> {
    return this.http.get<ArchiveBicycleHistory>(
      `${this.url}/history/${bicycleId}`,
    );
  }
}
