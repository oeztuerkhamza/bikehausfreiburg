import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Bicycle,
  BicycleCreate,
  BicycleImage,
  BicycleUpdate,
  BusyPeriod,
  PaginatedResult,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class BicycleService {
  private url = `${environment.apiUrl}/bicycles`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Bicycle[]> {
    return this.http.get<Bicycle[]>(this.url);
  }

  getPaginated(
    page: number,
    pageSize: number,
    status?: string,
    search?: string,
    zustand?: string,
    fahrradtyp?: string,
    reifengroesse?: string,
    marke?: string,
    isRentable?: boolean,
  ): Observable<PaginatedResult<Bicycle>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) params = params.set('status', status);
    if (search) params = params.set('search', search);
    if (zustand) params = params.set('zustand', zustand);
    if (fahrradtyp) params = params.set('fahrradtyp', fahrradtyp);
    if (reifengroesse) params = params.set('reifengroesse', reifengroesse);
    if (marke) params = params.set('marke', marke);
    if (isRentable !== undefined) params = params.set('isRentable', isRentable.toString());

    return this.http.get<PaginatedResult<Bicycle>>(`${this.url}/paginated`, {
      params,
    });
  }

  getById(id: number): Observable<Bicycle> {
    return this.http.get<Bicycle>(`${this.url}/${id}`);
  }

  getAvailable(): Observable<Bicycle[]> {
    return this.http.get<Bicycle[]>(`${this.url}/available`);
  }

  search(term: string): Observable<Bicycle[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<Bicycle[]>(`${this.url}/search`, { params });
  }

  create(bicycle: BicycleCreate): Observable<Bicycle> {
    return this.http.post<Bicycle>(this.url, bicycle);
  }

  update(id: number, bicycle: BicycleUpdate): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, bicycle);
  }

  /**
   * Einziger Weg, die am Fahrrad hinterlegte Kaution zu ändern — bewusst nicht
   * Teil von update(), damit kein anderes Formular sie nebenbei überschreibt.
   * null = keine Kaution hinterlegt.
   */
  setKaution(id: number, kaution: number | null): Observable<Bicycle> {
    return this.http.put<Bicycle>(`${this.url}/${id}/kaution`, { kaution });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  getBusyPeriods(id: number): Observable<BusyPeriod[]> {
    return this.http.get<BusyPeriod[]>(`${this.url}/${id}/busy-periods`);
  }

  // Batch: busy periods for many bikes in one request (keyed by bicycle id).
  getBusyPeriodsBatch(
    ids: number[],
  ): Observable<Record<number, BusyPeriod[]>> {
    return this.http.post<Record<number, BusyPeriod[]>>(
      `${this.url}/busy-periods/batch`,
      { ids },
    );
  }

  getAvailableForPeriod(start: string, end: string): Observable<Bicycle[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<Bicycle[]>(`${this.url}/available-for-period`, { params });
  }

  // Next free Lagernummer (stock number) — suggested when taking in a new bike.
  getNextLagernummer(): Observable<number> {
    return this.http.get<number>(`${this.url}/next-lagernummer`);
  }

  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/brands`);
  }

  // Normalised (trimmed, upper-case) frame numbers shared by more than one bike.
  getDuplicateRahmennummern(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/duplicate-rahmennummern`);
  }

  getModels(brand?: string): Observable<string[]> {
    let params = new HttpParams();
    if (brand) params = params.set('brand', brand);
    return this.http.get<string[]>(`${this.url}/models`, { params });
  }

  // ── Publishing ──
  togglePublishWebsite(id: number): Observable<Bicycle> {
    return this.http.post<Bicycle>(`${this.url}/${id}/toggle-publish-website`, {});
  }

  togglePublishKleinanzeigen(id: number): Observable<Bicycle> {
    return this.http.post<Bicycle>(`${this.url}/${id}/toggle-publish-kleinanzeigen`, {});
  }

  setKleinanzeigenAnzeigeNr(id: number, anzeigeNr: string): Observable<Bicycle> {
    return this.http.put<Bicycle>(`${this.url}/${id}/kleinanzeigen-anzeige-nr`, { anzeigeNr });
  }

  // ── Gallery Images ──
  getGallery(id: number): Observable<BicycleImage[]> {
    return this.http.get<BicycleImage[]>(`${this.url}/${id}/gallery`);
  }

  uploadGalleryImage(bicycleId: number, file: File): Observable<BicycleImage> {
    // Images are downscaled/compressed centrally by imageCompressionInterceptor.
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<BicycleImage>(`${this.url}/${bicycleId}/gallery`, formData);
  }

  deleteGalleryImage(bicycleId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${bicycleId}/gallery/${imageId}`);
  }

  reorderGalleryImages(
    bicycleId: number,
    imageIds: number[],
  ): Observable<BicycleImage[]> {
    return this.http.put<BicycleImage[]>(
      `${this.url}/${bicycleId}/gallery/reorder`,
      { imageIds },
    );
  }
}
