import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Document as DocModel } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private url = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<DocModel[]> {
    return this.http.get<DocModel[]>(this.url);
  }

  getByBicycleId(bicycleId: number): Observable<DocModel[]> {
    return this.http.get<DocModel[]>(`${this.url}/bicycle/${bicycleId}`);
  }

  upload(
    file: File,
    documentType: string,
    bicycleId?: number,
    purchaseId?: number,
    saleId?: number,
  ): Observable<DocModel> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (bicycleId) formData.append('bicycleId', bicycleId.toString());
    if (purchaseId) formData.append('purchaseId', purchaseId.toString());
    if (saleId) formData.append('saleId', saleId.toString());
    return this.http.post<DocModel>(this.url, formData);
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/download`, {
      responseType: 'blob',
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
