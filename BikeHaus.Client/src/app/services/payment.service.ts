import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, timeout, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { v4 as uuidv4 } from 'uuid';

/**
 * Payment method enum (matches backend)
 */
export enum PaymentMethodType {
  CreditCard = 0,
  DebitCard = 1,
  SepaDirectDebit = 2,
  Ideal = 3,
  PayPal = 4,
  Klarna = 5,
  Bancontact = 6,
  ApplePay = 7,
  GooglePay = 8,
  EPS = 9,
  Giropay = 10,
  KBC = 11,
  Przelewy24 = 12,
}

/**
 * Payment DTOs (must match backend models)
 */
export interface CreatePaymentRequest {
  onlineSaleId: string;
  method: PaymentMethodType;
  customerEmail?: string;
  customerName?: string;
}

export interface PaymentResponse {
  paymentId: string;
  externalPaymentId: string;
  checkoutUrl: string;
  status: string;
  amount: number;
  totalAmount: number;
  adjustmentAmount: number;
  adjustmentReason: string;
  qrCode?: string;
}

export interface PaymentStatusResponse {
  status: string;
  isPaid: boolean;
  errorMessage?: string;
  externalPaymentId?: string;
}

export interface PricingInfo {
  baseAmount: number;
  method: PaymentMethodType;
  adjustment: number;
  adjustmentLabel: string;
  totalAmount: number;
  isValid: boolean;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason: string;
}

export interface RefundResponse {
  isSuccess: boolean;
  refundId: string;
  status: string;
  errorMessage?: string;
}

/**
 * Payment Service — PCI DSS uyumlu
 * Kart bilgileri, CVV, IBAN ASLA bu serviste işlenmez
 * Mollie API'ye yönlendir
 */
@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly apiUrl = `${environment.apiUrl}/payment`;
  private csrfToken$ = new BehaviorSubject<string>('');
  private readonly REQUEST_TIMEOUT = 15000; // 15 saniye

  constructor(private http: HttpClient) {
    this.initializeCsrfToken();
  }

  /**
   * CSRF token'ı al veya oluştur
   */
  private initializeCsrfToken(): void {
    // ASP.NET Core antiforgery middleware CSRF cookie'sini otomatik ayarlar
    // Ve X-XSRF-TOKEN header'ında gönderiyoruz
    const token = this.generateCsrfToken();
    this.csrfToken$.next(token);
  }

  /**
   * Frontend'deki CSRF token'ı oluştur
   */
  private generateCsrfToken(): string {
    return uuidv4();
  }

  /**
   * Ödeme oluştur — Mollie checkout URL'si döner
   * ❌ Kart bilgileri gönderme
   * ✅ Sadece ödeme yöntemi ve satış ID'si gönder
   */
  createPayment(
    onlineSaleId: string,
    method: PaymentMethodType,
    customerEmail?: string,
    customerName?: string,
  ): Observable<PaymentResponse> {
    const request: CreatePaymentRequest = {
      onlineSaleId,
      method,
      customerEmail,
      customerName,
    };

    // Idempotency key — tekrarlı işlem koruması (24 saat)
    const idempotencyKey = uuidv4();
    const csrfToken = this.csrfToken$.value;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken,
      'Idempotency-Key': idempotencyKey,
    });

    return this.http
      .post<PaymentResponse>(`${this.apiUrl}/create`, request, { headers })
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        tap((response) => {
          console.log('Payment created:', response.paymentId);
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * Ödeme durumunu kontrol et
   */
  getPaymentStatus(paymentId: string): Observable<PaymentStatusResponse> {
    return this.http
      .get<PaymentStatusResponse>(`${this.apiUrl}/status/${paymentId}`, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      })
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * Fiyatlandırma bilgisi (surcharge/discount)
   * Frontend'de tutar hesaplamak için
   * ⚠️ Backend'den dönen tutar nihai tutardır, frontend'in override etmesi YASAK
   */
  getPricing(
    baseAmount: number,
    method: PaymentMethodType,
  ): Observable<PricingInfo> {
    const params = new URLSearchParams({
      baseAmount: baseAmount.toFixed(2),
      method: PaymentMethodType[method],
    });

    return this.http
      .get<PricingInfo>(`${this.apiUrl}/pricing?${params.toString()}`)
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * İade işlemi — admin only
   */
  refundPayment(request: RefundRequest): Observable<RefundResponse> {
    const csrfToken = this.csrfToken$.value;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken,
    });

    return this.http
      .post<RefundResponse>(`${this.apiUrl}/refund`, request, { headers })
      .pipe(
        timeout(this.REQUEST_TIMEOUT),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * Hata işleme — hassas bilgileri gösterme
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let userMessage = 'Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.';

    if (error.status === 429) {
      userMessage = 'Çok fazla istek. Lütfen biraz bekleyip tekrar deneyin.';
    } else if (error.status === 400) {
      userMessage = 'Geçersiz ödeme bilgileri.';
    } else if (error.status === 401) {
      userMessage = 'Lütfen giriş yapın.';
    }

    console.error('Payment error:', error);
    return throwError(() => new Error(userMessage));
  }
}
