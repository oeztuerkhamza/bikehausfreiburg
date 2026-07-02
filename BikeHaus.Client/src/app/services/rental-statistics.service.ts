import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RentalDailyStats {
  date: string;
  rentedBikeCount: number;
  newRentalCount: number;
  revenue: number;
}

export interface TopRentalBike {
  bike: string;
  rentalDays: number;
  revenue: number;
}

export interface RentalStatistics {
  startDate: string;
  endDate: string;
  totalRentalDays: number;
  rentalContractCount: number;
  rentedBikeCount: number;
  totalRevenue: number;
  dailyBreakdown: RentalDailyStats[];
  topBikes: TopRentalBike[];
}

@Injectable({
  providedIn: 'root',
})
export class RentalStatisticsService {
  private apiUrl = `${environment.apiUrl}/rentalstatistics`;

  constructor(private http: HttpClient) {}

  getRentalStatistics(
    startDate: Date,
    endDate: Date,
  ): Observable<RentalStatistics> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get<RentalStatistics>(this.apiUrl, { params });
  }
}
