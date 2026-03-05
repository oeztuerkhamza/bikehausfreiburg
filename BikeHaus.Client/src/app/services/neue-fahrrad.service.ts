import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  NeueFahrrad,
  NeueFahrradCreate,
  NeueFahrradUpdate,
  NeueFahrradImage,
  NeueFahrradCategory,
} from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class NeueFahrradService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/neue-fahrraeder`;

  getAll(): Observable<NeueFahrrad[]> {
    return this.http.get<NeueFahrrad[]>(this.baseUrl);
  }

  getById(id: number): Observable<NeueFahrrad> {
    return this.http.get<NeueFahrrad>(`${this.baseUrl}/${id}`);
  }

  getCategories(): Observable<NeueFahrradCategory[]> {
    return this.http.get<NeueFahrradCategory[]>(`${this.baseUrl}/categories`);
  }

  create(data: NeueFahrradCreate): Observable<NeueFahrrad> {
    return this.http.post<NeueFahrrad>(this.baseUrl, data);
  }

  update(id: number, data: NeueFahrradUpdate): Observable<NeueFahrrad> {
    return this.http.put<NeueFahrrad>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadImages(id: number, files: File[]): Observable<NeueFahrradImage[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<NeueFahrradImage[]>(
      `${this.baseUrl}/${id}/images`,
      formData,
    );
  }

  deleteImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/images/${imageId}`);
  }
}
