import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DailyStats {
  date: string;
  purchaseCount: number;
  saleCount: number;
  expenseCount: number;
  purchaseAmount: number;
  saleAmount: number;
  expenseAmount: number;
  dailyProfit: number;
  dailyNetProfit: number;
}

export interface TopBrand {
  brand: string;
  count: number;
  totalRevenue: number;
}

export interface ExpenseByCategory {
  category: string;
  count: number;
  totalAmount: number;
}

export interface Statistics {
  startDate: string;
  endDate: string;
  purchaseCount: number;
  saleCount: number;
  expenseCount: number;
  totalPurchaseAmount: number;
  totalSaleAmount: number;
  totalExpenseAmount: number;
  profit: number;
  netProfit: number;
  averagePurchasePrice: number;
  averageSalePrice: number;
  averageProfit: number;
  dailyBreakdown: DailyStats[];
  topBrands: TopBrand[];
  expensesByCategory: ExpenseByCategory[];
}

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private apiUrl = `${environment.apiUrl}/statistics`;

  constructor(private http: HttpClient) {}

  getStatistics(startDate: Date, endDate: Date): Observable<Statistics> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get<Statistics>(this.apiUrl, { params });
  }

  getTodayStatistics(): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.apiUrl}/today`);
  }

  getWeekStatistics(): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.apiUrl}/week`);
  }

  getMonthStatistics(): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.apiUrl}/month`);
  }

  getQuarterStatistics(): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.apiUrl}/quarter`);
  }

  getYearStatistics(): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.apiUrl}/year`);
  }
}
