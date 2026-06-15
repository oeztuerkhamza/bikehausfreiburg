import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  EBike,
  EBikeCreate,
  EBikeUpdate,
  EBikeImage,
  EBikeCategory,
} from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class EBikeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/e-bikes`;

  getAll(): Observable<EBike[]> {
    return this.http.get<EBike[]>(this.baseUrl);
  }

  getById(id: number): Observable<EBike> {
    return this.http.get<EBike>(`${this.baseUrl}/${id}`);
  }

  getCategories(): Observable<EBikeCategory[]> {
    return this.http.get<EBikeCategory[]>(`${this.baseUrl}/categories`);
  }

  create(data: EBikeCreate): Observable<EBike> {
    return this.http.post<EBike>(this.baseUrl, data);
  }

  update(id: number, data: EBikeUpdate): Observable<EBike> {
    return this.http.put<EBike>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadImages(id: number, files: File[]): Observable<EBikeImage[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<EBikeImage[]>(
      `${this.baseUrl}/${id}/images`,
      formData,
    );
  }

  deleteImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/images/${imageId}`);
  }
}
