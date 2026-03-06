import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  HomepageAccessory,
  HomepageAccessoryCreate,
  HomepageAccessoryUpdate,
  HomepageAccessoryImage,
  HomepageAccessoryCategory,
} from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class HomepageAccessoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/homepage-accessories`;

  getAll(): Observable<HomepageAccessory[]> {
    return this.http.get<HomepageAccessory[]>(this.baseUrl);
  }

  getById(id: number): Observable<HomepageAccessory> {
    return this.http.get<HomepageAccessory>(`${this.baseUrl}/${id}`);
  }

  getCategories(): Observable<HomepageAccessoryCategory[]> {
    return this.http.get<HomepageAccessoryCategory[]>(
      `${this.baseUrl}/categories`,
    );
  }

  create(data: HomepageAccessoryCreate): Observable<HomepageAccessory> {
    return this.http.post<HomepageAccessory>(this.baseUrl, data);
  }

  update(
    id: number,
    data: HomepageAccessoryUpdate,
  ): Observable<HomepageAccessory> {
    return this.http.put<HomepageAccessory>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadImages(
    id: number,
    files: File[],
  ): Observable<HomepageAccessoryImage[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<HomepageAccessoryImage[]>(
      `${this.baseUrl}/${id}/images`,
      formData,
    );
  }

  deleteImage(imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/images/${imageId}`);
  }
}
