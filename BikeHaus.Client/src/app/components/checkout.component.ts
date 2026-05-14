import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  PaymentService,
  PaymentMethodType,
  PaymentResponse,
  PricingInfo,
} from '../services/payment.service';

/**
 * Checkout Component — Güvenli ödeme UI
 * ❌ Kart bilgileri burada toplanmaz
 * ✅ Ödeme yöntemi seçimi + Mollie'ye yönlendir
 */
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="checkout-container">
      <h1>Kasse — Checkout</h1>

      <!-- Siparişi Özeti -->
      <div class="order-summary">
        <h2>Sipariş Özeti</h2>
        <div class="order-item">
          <span>Ürün:</span>
          <span class="price">{{ product?.title }}</span>
        </div>
        <div class="order-item">
          <span>Taban Fiyat:</span>
          <span class="price">{{ baseAmount | currency: 'EUR' }}</span>
        </div>
        <div
          *ngIf="selectedPricing && selectedPricing.adjustment !== 0"
          class="order-item adjustment"
        >
          <span>{{ selectedPricing.adjustmentReason }}:</span>
          <span
            [ngClass]="{
              positive: selectedPricing.adjustment < 0,
              negative: selectedPricing.adjustment > 0,
            }"
          >
            {{ selectedPricing.adjustment | currency: 'EUR' }}
          </span>
        </div>
        <hr />
        <div class="order-item total">
          <span><strong>Toplam:</strong></span>
          <span class="total-price"
            ><strong>{{ totalAmount | currency: 'EUR' }}</strong></span
          >
        </div>
      </div>

      <!-- Ödeme Yöntemi Seçimi -->
      <div class="payment-methods">
        <h2>Ödeme Yöntemi Seçin</h2>

        <div *ngIf="isLoading" class="loading">Yükleniyor...</div>

        <div *ngIf="!isLoading" class="method-options">
          <div
            *ngFor="let method of paymentMethods"
            class="method-card"
            [class.selected]="selectedMethod === method.type"
            (click)="selectPaymentMethod(method.type)"
            [class.disabled]="isProcessing"
          >
            <div class="method-info">
              <h3>{{ method.label }}</h3>
              <p>{{ method.description }}</p>
            </div>

            <div class="method-price">
              <div *ngIf="method.pricing">
                <span class="total">{{
                  method.pricing.totalAmount | currency: 'EUR'
                }}</span>
                <span
                  *ngIf="method.pricing.adjustment !== 0"
                  class="adjustment"
                  [ngClass]="{ discount: method.pricing.adjustment < 0 }"
                >
                  {{ method.pricing.adjustment > 0 ? '+' : '' }}
                  {{ method.pricing.adjustment | currency: 'EUR' }}
                </span>
              </div>
            </div>

            <div class="method-badge">
              <span *ngIf="method.type === 2" class="badge sepa"
                >Bestes Angebot</span
              >
              <span *ngIf="method.type === 4" class="badge paypal"
                >Popular</span
              >
              <span *ngIf="method.type === 5" class="badge klarna"
                >Flexible</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Fehlermeldungen -->
      <div *ngIf="errorMessage" class="error-message">
        ⚠️ {{ errorMessage }}
      </div>

      <!-- Zahlungs-Button -->
      <div class="checkout-actions">
        <button
          (click)="proceedToPayment()"
          [disabled]="!selectedMethod || isProcessing"
          class="btn-primary"
        >
          <span *ngIf="!isProcessing">Zur Zahlung →</span>
          <span *ngIf="isProcessing">Wird verarbeitet...</span>
        </button>
      </div>

      <!-- Sicherheits-Info -->
      <div class="security-notice">
        <p>🔒 Sichere Verbindung | 3D Secure | PCI DSS Certified</p>
        <p>
          Ihre Zahlungsdaten werden niemals auf unseren Servern gespeichert.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .checkout-container {
        max-width: 600px;
        margin: 2rem auto;
        padding: 2rem;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      h1 {
        text-align: center;
        margin-bottom: 2rem;
        color: #333;
      }

      .order-summary {
        background: #f9f9f9;
        padding: 1.5rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        border: 1px solid #e0e0e0;
      }

      .order-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        font-size: 1rem;
      }

      .order-item.adjustment {
        color: #059669;
      }

      .order-item.adjustment.negative {
        color: #dc2626;
      }

      .order-item.total {
        font-size: 1.25rem;
        padding: 1rem 0 0 0;
      }

      .total-price {
        color: #059669;
      }

      .payment-methods h2 {
        margin-bottom: 1.5rem;
        color: #333;
      }

      .method-options {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .method-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        background: white;
      }

      .method-card:hover:not(.disabled) {
        border-color: #2563eb;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
      }

      .method-card.selected {
        border-color: #2563eb;
        background: #eff6ff;
      }

      .method-card.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .method-info {
        flex: 1;
      }

      .method-info h3 {
        margin: 0;
        font-size: 1.1rem;
        color: #333;
      }

      .method-info p {
        margin: 0.25rem 0 0 0;
        color: #666;
        font-size: 0.85rem;
      }

      .method-price {
        text-align: right;
        min-width: 100px;
      }

      .method-price .total {
        display: block;
        font-size: 1.25rem;
        font-weight: 600;
        color: #059669;
      }

      .method-price .adjustment {
        display: block;
        font-size: 0.875rem;
        color: #666;
        margin-top: 0.25rem;
      }

      .method-price .adjustment.discount {
        color: #059669;
      }

      .method-badge {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
      }

      .badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        color: white;
      }

      .badge.sepa {
        background: #059669;
      }

      .badge.paypal {
        background: #003087;
      }

      .badge.klarna {
        background: #ffb3c7;
        color: #333;
      }

      .error-message {
        background: #fee;
        border: 1px solid #fcc;
        color: #c33;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
      }

      .checkout-actions {
        margin-bottom: 2rem;
      }

      .btn-primary {
        width: 100%;
        padding: 1rem;
        font-size: 1.1rem;
        font-weight: 600;
        color: white;
        background: #2563eb;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .btn-primary:hover:not(:disabled) {
        background: #1d4ed8;
      }

      .btn-primary:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      .loading {
        text-align: center;
        color: #666;
        padding: 2rem;
      }

      .security-notice {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        padding: 1rem;
        border-radius: 4px;
        color: #1e40af;
        font-size: 0.9rem;
      }

      .security-notice p {
        margin: 0.5rem 0;
      }
    `,
  ],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  selectedMethod: PaymentMethodType | null = null;
  selectedPricing: PricingInfo | null = null;
  isLoading = false;
  isProcessing = false;
  errorMessage: string | null = null;
  baseAmount = 0;
  totalAmount = 0;
  product: any = null;

  private destroy$ = new Subject<void>();

  /**
   * Verfügbare Zahlungsmethoden
   * EU-konform: Karte + SEPA ohne Aufschlag
   */
  paymentMethods = [
    {
      type: PaymentMethodType.CreditCard,
      label: 'Kreditkarte',
      description: 'Visa, Mastercard, American Express',
      pricing: null as PricingInfo | null,
    },
    {
      type: PaymentMethodType.DebitCard,
      label: 'Debitkarte',
      description: 'Girocard, EC-Karte',
      pricing: null as PricingInfo | null,
    },
    {
      type: PaymentMethodType.SepaDirectDebit,
      label: 'SEPA Lastschrift',
      description: 'Direkte Bankverbindung — Bestzins!',
      pricing: null as PricingInfo | null,
    },
    {
      type: PaymentMethodType.Ideal,
      label: 'iDEAL',
      description: 'Online Banking Niederlande',
      pricing: null as PricingInfo | null,
    },
    {
      type: PaymentMethodType.PayPal,
      label: 'PayPal',
      description: 'Sichere Zahlung über Ihr PayPal-Konto',
      pricing: null as PricingInfo | null,
    },
    {
      type: PaymentMethodType.Klarna,
      label: 'Klarna (Rechnung / Ratenkauf)',
      description: 'Zahlen Sie in Raten oder später',
      pricing: null as PricingInfo | null,
    },
  ];

  constructor(
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadOrderData();
    this.loadPricing();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Bestelldaten laden
   */
  private loadOrderData(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const saleId = params['saleId'];
        if (saleId) {
          // In Produktion: API aufrufen um Bestelldaten zu laden
          this.product = { id: saleId, title: 'Fahrrad' };
          this.baseAmount = 299.99; // Beispiel
          this.totalAmount = this.baseAmount;
        }
      });
  }

  /**
   * Fiyatlandırma für alle Zahlungsmethoden laden
   */
  private loadPricing(): void {
    this.isLoading = true;

    Promise.all(
      this.paymentMethods.map((method) =>
        this.paymentService
          .getPricing(this.baseAmount, method.type)
          .toPromise(),
      ),
    )
      .then((pricings) => {
        pricings.forEach((pricing, index) => {
          if (pricing) {
            this.paymentMethods[index].pricing = pricing;
          }
        });
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Fehler beim Laden der Preisangaben:', error);
        this.errorMessage = 'Preisangaben konnten nicht geladen werden.';
        this.isLoading = false;
      });
  }

  /**
   * Zahlungsmethode auswählen
   */
  selectPaymentMethod(method: PaymentMethodType): void {
    this.selectedMethod = method;
    const methodData = this.paymentMethods.find((m) => m.type === method);
    if (methodData?.pricing) {
      this.selectedPricing = methodData.pricing;
      this.totalAmount = methodData.pricing.totalAmount;
    }
    this.errorMessage = null;
  }

  /**
   * Zur Zahlung fortfahren — Mollie Checkout öffnen
   */
  proceedToPayment(): void {
    if (!this.selectedMethod || !this.product) {
      this.errorMessage = 'Bitte wählen Sie eine Zahlungsmethode.';
      return;
    }

    this.isProcessing = true;

    this.paymentService
      .createPayment(this.product.id, this.selectedMethod)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaymentResponse) => {
          // Mollie Checkout öffnen
          window.location.href = response.checkoutUrl;
        },
        error: (error) => {
          this.errorMessage =
            error.message || 'Zahlung konnte nicht initiiert werden.';
          this.isProcessing = false;
          console.error('Payment creation error:', error);
        },
      });
  }
}
