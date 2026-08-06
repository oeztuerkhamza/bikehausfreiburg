import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { PurchaseService } from '../../services/purchase.service';
import { DocumentService } from '../../services/document.service';
import { BicycleService } from '../../services/bicycle.service';
import { NotificationService } from '../../services/notification.service';
import { TranslationService } from '../../services/translation.service';
import { CustomerAutocompleteComponent } from '../../components/customer-autocomplete/customer-autocomplete.component';
import {
  PurchaseCreateForExistingBike,
  PaymentMethod,
  BikeCondition,
  DocumentType,
  Customer,
} from '../../models/models';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-missing-purchase-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CustomerAutocompleteComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.createPurchase }}</h1>
        <a routerLink="/purchases/missing" class="btn btn-outline">{{
          t.back
        }}</a>
      </div>

      <form (ngSubmit)="submit()" #f="ngForm">
        <!-- Wizard progress (mobile only) -->
        <div class="wizard-progress" *ngIf="isMobile">
          <div class="wizard-progress-top">
            <span class="wizard-step-count"
              >Schritt {{ currentStep + 1 }} / {{ totalSteps }}</span
            >
            <span class="wizard-step-name">{{ currentStepLabel }}</span>
          </div>
          <div class="wizard-progress-bar">
            <div
              class="wizard-progress-fill"
              [style.width.%]="((currentStep + 1) / totalSteps) * 100"
            ></div>
          </div>
          <div class="wizard-dots">
            <span
              class="wizard-dot"
              *ngFor="let s of wizardSteps; let idx = index"
              [class.active]="idx === currentStep"
              [class.done]="idx < currentStep"
              (click)="goToStep(idx)"
            ></span>
          </div>
        </div>

        <div class="form-sections">
          <!-- STEP 0: Fahrrad -->
          <div
            class="wizard-step"
            [class.wizard-hidden]="isMobile && currentStep !== 0"
          >
          <!-- Bicycle Info -->
          <div class="form-card">
            <h2>🚲 {{ t.bicycle }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.brand }} *</label>
                <input [(ngModel)]="bikeMarke" name="bikeMarke" required />
              </div>
              <div class="field">
                <label>{{ t.model }}</label>
                <input [(ngModel)]="bikeModell" name="bikeModell" />
              </div>
              <div class="field">
                <label>{{ t.frameNumber }} *</label>
                <input
                  [(ngModel)]="bikeRahmennummer"
                  name="bikeRahmennummer"
                  required
                  style="text-transform: uppercase"
                />
              </div>
              <div class="field">
                <label>{{ t.frameSize }}</label>
                <input
                  [(ngModel)]="bikeRahmengroesse"
                  name="bikeRahmengroesse"
                />
              </div>
              <div class="field">
                <label>{{ t.color }}</label>
                <input [(ngModel)]="bikeFarbe" name="bikeFarbe" />
              </div>
              <div class="field">
                <label>{{ t.wheelSize }} *</label>
                <input
                  [(ngModel)]="bikeReifengroesse"
                  name="bikeReifengroesse"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.bicycleType }}</label>
                <input [(ngModel)]="bikeFahrradtyp" name="bikeFahrradtyp" />
              </div>
            </div>
          </div>
          </div>
          <!-- /STEP 0 -->

          <!-- STEP 1: Ankaufsdaten -->
          <div
            class="wizard-step"
            [class.wizard-hidden]="isMobile && currentStep !== 1"
          >
          <!-- Purchase Details -->
          <div class="form-card">
            <h2>{{ t.purchases }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.receiptNo }}</label>
                <input [(ngModel)]="belegNummer" name="belegNummer" />
              </div>
              <div class="field">
                <label>{{ t.bicyclePrice }} *</label>
                <input
                  [(ngModel)]="preis"
                  name="preis"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.plannedSellingPrice }}</label>
                <input
                  [(ngModel)]="verkaufspreisVorschlag"
                  name="verkaufspreisVorschlag"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>
              <div class="field">
                <label>{{ t.paymentMethodRequired }}</label>
                <select [(ngModel)]="zahlungsart" name="zahlungsart" required>
                  <option [value]="PaymentMethod.Bar">{{ t.cash }}</option>
                  <option [value]="PaymentMethod.PayPal">
                    {{ t.paypal }}
                  </option>
                  <option [value]="PaymentMethod.Karte">
                    {{ t.bankTransfer }}
                  </option>
                  <option [value]="PaymentMethod.Ueberweisung">
                    {{ t.wireTransfer }}
                  </option>
                </select>
              </div>
              <div class="field">
                <label>{{ t.purchaseDate }} *</label>
                <input
                  [(ngModel)]="kaufdatum"
                  name="kaufdatum"
                  type="date"
                  required
                />
              </div>
              <div class="field full">
                <label>{{ t.notes }}</label>
                <textarea
                  [(ngModel)]="notizen"
                  name="notizen"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
          </div>
          <!-- /STEP 1 -->

          <!-- STEP 2: Verkäufer -->
          <div
            class="wizard-step"
            [class.wizard-hidden]="isMobile && currentStep !== 2"
          >
          <!-- Seller info -->
          <div class="form-card">
            <h2>{{ t.seller }} ({{ t.customer }})</h2>
            <div class="form-grid">
              <app-customer-autocomplete
                [vorname]="seller.vorname"
                (vornameChange)="seller.vorname = $event"
                [nachname]="seller.nachname"
                (nachnameChange)="seller.nachname = $event"
                [vornameLabel]="t.firstName"
                [nachnameLabel]="t.lastName"
                [hasOtherData]="hasOtherSellerData()"
                (customerSelected)="onSellerSelected($event)"
              ></app-customer-autocomplete>
              <div class="field">
                <label>{{ t.street }}</label>
                <input [(ngModel)]="seller.strasse" name="sellerStrasse" />
              </div>
              <div class="field">
                <label>{{ t.houseNumber }}</label>
                <input [(ngModel)]="seller.hausnummer" name="sellerHausnr" />
              </div>
              <div class="field">
                <label>{{ t.postalCode }}</label>
                <input [(ngModel)]="seller.plz" name="sellerPlz" />
              </div>
              <div class="field">
                <label>{{ t.city }}</label>
                <input [(ngModel)]="seller.stadt" name="sellerStadt" />
              </div>
              <div class="field">
                <label>{{ t.phone }}</label>
                <input [(ngModel)]="seller.telefon" name="sellerTelefon" />
              </div>
              <div class="field">
                <label>{{ t.email }}</label>
                <input
                  [(ngModel)]="seller.email"
                  name="sellerEmail"
                  type="email"
                />
              </div>
            </div>
          </div>
          </div>
          <!-- /STEP 2 -->

          <!-- STEP 3: Fotos -->
          <div
            class="wizard-step"
            [class.wizard-hidden]="isMobile && currentStep !== 3"
          >
          <!-- Verkaufsfotos (for Website & Kleinanzeigen) -->
          <div class="form-card">
            <h2>📸 {{ t.salesPhotos }}</h2>
            <p class="hint-text">
              {{ t.salesPhotosHint }}
            </p>
            <div class="upload-area">
              <input
                type="file"
                #galleryInput
                (change)="onGalleryFilesSelected($event)"
                accept="image/*"
                multiple
                style="display: none"
              />
              <button
                type="button"
                class="btn btn-outline"
                (click)="galleryInput.click()"
              >
                📷 {{ t.selectPhotos }}
              </button>
              <span class="file-count" *ngIf="galleryFiles.length > 0">
                {{ galleryFiles.length }} {{ t.photosSelected }}
              </span>
            </div>
            <div class="preview-grid" *ngIf="galleryPreviewUrls.length > 0">
              <div
                class="preview-item"
                *ngFor="let url of galleryPreviewUrls; let i = index"
              >
                <img [src]="url" alt="Galerie Vorschau" />
                <button
                  type="button"
                  class="remove-btn"
                  (click)="removeGalleryFile(i)"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <!-- Einkaufsfotos (internal documentation) -->
          <div class="form-card">
            <h2>📄 {{ t.purchasePhotos }}</h2>
            <p class="hint-text">
              {{ t.purchasePhotosHint }}
            </p>
            <div class="upload-area">
              <input
                type="file"
                #fileInput
                (change)="onFilesSelected($event)"
                accept="image/*"
                multiple
                style="display: none"
              />
              <button
                type="button"
                class="btn btn-outline"
                (click)="fileInput.click()"
              >
                📷 {{ t.selectPhotos }}
              </button>
              <span class="file-count" *ngIf="selectedFiles.length > 0">
                {{ selectedFiles.length }} {{ t.photosSelected }}
              </span>
            </div>
            <div class="preview-grid" *ngIf="previewUrls.length > 0">
              <div
                class="preview-item"
                *ngFor="let url of previewUrls; let i = index"
              >
                <img [src]="url" alt="Vorschau" />
                <button
                  type="button"
                  class="remove-btn"
                  (click)="removeFile(i)"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
          </div>
          <!-- /STEP 3 -->
        </div>

        <!-- Wizard nav (mobile only) -->
        <div class="wizard-nav" *ngIf="isMobile">
          <a
            routerLink="/purchases/missing"
            class="btn btn-outline wizard-back"
            *ngIf="currentStep === 0"
            >{{ t.back }}</a
          >
          <button
            type="button"
            class="btn btn-outline wizard-back"
            *ngIf="currentStep > 0"
            (click)="prevStep()"
          >
            Zurück
          </button>
          <button
            type="button"
            class="btn btn-primary wizard-next"
            *ngIf="!isLastStep"
            (click)="nextStep()"
          >
            Weiter
          </button>
          <button
            type="submit"
            class="btn btn-primary wizard-next"
            *ngIf="isLastStep"
            [disabled]="submitting || !canSubmit()"
          >
            {{ submitting ? '...' : t.savePurchase }}
          </button>
        </div>

        <div class="form-actions" *ngIf="!isMobile">
          <a routerLink="/purchases/missing" class="btn btn-outline">{{
            t.back
          }}</a>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="submitting || !canSubmit()"
          >
            {{ submitting ? '...' : t.savePurchase }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 900px;
        margin: 0 auto;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 28px;
      }
      .page-header h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
      }

      .form-sections {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .form-card {
        background: var(--bg-secondary);
        border-radius: 14px;
        border: 1px solid var(--border-light);
        padding: 24px;
      }
      .form-card h2 {
        margin: 0 0 16px;
        font-size: 1.1rem;
        font-weight: 600;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .field.full {
        grid-column: 1 / -1;
      }
      .field label {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--text-secondary);
      }
      .field input,
      .field select,
      .field textarea {
        padding: 10px 14px;
        border: 1.5px solid var(--border-color);
        border-radius: 10px;
        font-size: 0.9rem;
        background: var(--bg-primary);
        color: var(--text-primary);
        transition: border-color 0.2s;
      }
      .field input:focus,
      .field select:focus,
      .field textarea:focus {
        border-color: var(--accent-primary);
        outline: none;
      }
      .field input.readonly {
        background: var(--bg-tertiary, rgba(0, 0, 0, 0.03));
        color: var(--text-muted);
        cursor: not-allowed;
      }

      .hint-text {
        margin: 0 0 12px;
        color: var(--text-muted);
        font-size: 0.85rem;
      }

      .upload-area {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      }

      .file-count {
        color: var(--text-secondary);
        font-size: 0.85rem;
      }

      .preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
        gap: 10px;
      }

      .preview-item {
        position: relative;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid var(--border-light);
      }

      .preview-item img {
        width: 100%;
        height: 90px;
        object-fit: cover;
        display: block;
      }

      .remove-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 20px;
        height: 20px;
        border: none;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.65);
        color: #fff;
        cursor: pointer;
        line-height: 20px;
        padding: 0;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 1px solid var(--border-light);
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 20px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 0.88rem;
        cursor: pointer;
        text-decoration: none;
        border: none;
        transition: all 0.2s;
      }
      .btn-outline {
        background: transparent;
        border: 1.5px solid var(--border-color);
        color: var(--text-secondary);
      }
      .btn-outline:hover {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
      }
      .btn-primary {
        background: var(--accent-primary);
        color: #fff;
      }
      .btn-primary:hover {
        background: var(--accent-primary-hover, #4f46e5);
      }
      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* ── Mobile wizard ── */
      .wizard-progress {
        margin-bottom: 16px;
      }
      .wizard-progress-top {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 8px;
      }
      .wizard-step-count {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        white-space: nowrap;
      }
      .wizard-step-name {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .wizard-progress-bar {
        height: 6px;
        background: var(--border-light);
        border-radius: 99px;
        overflow: hidden;
      }
      .wizard-progress-fill {
        height: 100%;
        background: var(--accent-primary, #6366f1);
        border-radius: 99px;
        transition: width 0.25s ease;
      }
      .wizard-dots {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 12px;
      }
      .wizard-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--border-color);
        cursor: pointer;
        transition: all 0.15s;
      }
      .wizard-dot.active {
        background: var(--accent-primary, #6366f1);
        transform: scale(1.35);
      }
      .wizard-dot.done {
        background: var(--accent-primary, #6366f1);
        opacity: 0.5;
      }
      .wizard-hidden {
        display: none;
      }
      .wizard-nav {
        position: sticky;
        bottom: 0;
        z-index: 50;
        display: flex;
        gap: 12px;
        margin-top: 16px;
        padding: 12px 0 calc(12px + env(safe-area-inset-bottom, 0px));
        background: var(--bg-card);
        border-top: 1px solid var(--border-light);
      }
      .wizard-nav .wizard-next {
        flex: 1;
      }
      .wizard-nav .wizard-back {
        flex: 0 0 auto;
      }
      .wizard-nav .btn {
        padding: 14px 18px;
        font-size: 1rem;
        justify-content: center;
      }

      @media (max-width: 640px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
        /* Prevent iOS zoom-on-focus (needs ≥16px) */
        .field input,
        .field select,
        .field textarea {
          font-size: 16px;
        }
        .form-card {
          padding: 16px;
        }
        .form-sections {
          gap: 16px;
        }
        .upload-area .btn {
          width: 100%;
          padding: 13px;
        }
        .remove-btn {
          width: 32px;
          height: 32px;
        }
      }
    `,
  ],
})
export class MissingPurchaseFormComponent implements OnInit {
  private purchaseService = inject(PurchaseService);
  private documentService = inject(DocumentService);
  private bicycleService = inject(BicycleService);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // ── Mobile wizard ──
  isMobile = false;
  currentStep = 0;

  get wizardSteps(): string[] {
    return [this.t.bicycle, this.t.purchases, this.t.seller, 'Fotos'];
  }

  get totalSteps(): number {
    return this.wizardSteps.length;
  }

  get isLastStep(): boolean {
    return this.currentStep === this.totalSteps - 1;
  }

  get currentStepLabel(): string {
    return this.wizardSteps[this.currentStep] ?? '';
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.updateIsMobile();
  }

  private updateIsMobile() {
    if (typeof window === 'undefined') return;
    this.isMobile = window.innerWidth <= 640;
  }

  private scrollToTop() {
    if (typeof document !== 'undefined') {
      document
        .querySelector('.content-area')
        ?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextStep() {
    if (!this.validateStep(this.currentStep)) return;
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.scrollToTop();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.scrollToTop();
    }
  }

  goToStep(step: number) {
    if (step === this.currentStep) return;
    if (step < this.currentStep) {
      this.currentStep = step;
      this.scrollToTop();
      return;
    }
    for (let s = this.currentStep; s < step; s++) {
      if (!this.validateStep(s)) {
        this.currentStep = s;
        this.scrollToTop();
        return;
      }
    }
    this.currentStep = step;
    this.scrollToTop();
  }

  private validateStep(step: number): boolean {
    switch (step) {
      case 0:
        if (
          !this.bikeMarke?.trim() ||
          !this.bikeRahmennummer?.trim() ||
          !this.bikeReifengroesse?.trim()
        ) {
          this.notificationService.error(
            'Bitte Marke, Rahmennummer und Reifengröße ausfüllen.',
          );
          return false;
        }
        return true;
      case 1:
        if (!this.preis || this.preis <= 0 || !this.kaufdatum) {
          this.notificationService.error(
            'Bitte Preis und Kaufdatum ausfüllen.',
          );
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  PaymentMethod = PaymentMethod;
  DocumentType = DocumentType;

  // Bicycle info from query params (read-only)
  bicycleId = 0;
  bikeMarke = '';
  bikeModell = '';
  bikeRahmennummer = '';
  bikeRahmengroesse = '';
  bikeFarbe = '';
  bikeReifengroesse = '';
  bikeFahrradtyp = '';
  bikeArt = '';
  bikeZustand: BikeCondition = BikeCondition.Gebraucht;

  // Form fields
  seller = {
    vorname: '',
    nachname: '',
    strasse: '',
    hausnummer: '',
    plz: '',
    stadt: '',
    telefon: '',
    email: '',
    steuernummer: '',
  };

  preis = 0;
  verkaufspreisVorschlag: number | null = null;
  zahlungsart: PaymentMethod = PaymentMethod.Bar;
  kaufdatum = '';
  notizen = '';
  belegNummer = '';
  submitting = false;

  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  galleryFiles: File[] = [];
  galleryPreviewUrls: string[] = [];

  get t() {
    return this.translationService.translations();
  }

  ngOnInit() {
    this.updateIsMobile();
    this.kaufdatum = new Date().toISOString().split('T')[0];

    // Read bicycle data from query params
    this.route.queryParams.subscribe((params) => {
      this.bicycleId = +params['bicycleId'] || 0;
      this.bikeMarke = params['marke'] || '';
      this.bikeModell = params['modell'] || '';
      this.bikeRahmennummer = params['rahmennummer'] || '';
      this.bikeRahmengroesse = params['rahmengroesse'] || '';
      this.bikeFarbe = params['farbe'] || '';
      this.bikeReifengroesse = params['reifengroesse'] || '';
      this.bikeFahrradtyp = params['fahrradtyp'] || '';
      this.bikeArt = params['art'] || '';
      this.bikeZustand =
        (params['zustand'] as BikeCondition) || BikeCondition.Gebraucht;

      // Pre-fill suggested selling price from sale price
      if (params['salePreis']) {
        this.verkaufspreisVorschlag = +params['salePreis'];
      }
    });

    // Get next Belegnummer
    this.purchaseService.getNextBelegNummer().subscribe({
      next: (res) => {
        this.belegNummer = res.belegNummer;
      },
      error: () => {},
    });
  }

  canSubmit(): boolean {
    return !!(
      this.bicycleId > 0 &&
      this.bikeMarke?.trim() &&
      this.bikeRahmennummer?.trim() &&
      this.bikeReifengroesse?.trim() &&
      this.preis > 0 &&
      this.kaufdatum
    );
  }

  /** Steuert, ob die Kunden-Vorschlagsliste vor der Übernahme nachfragt. */
  hasOtherSellerData(): boolean {
    return !!(
      this.seller.strasse?.trim() ||
      this.seller.hausnummer?.trim() ||
      this.seller.plz?.trim() ||
      this.seller.stadt?.trim() ||
      this.seller.telefon?.trim() ||
      this.seller.email?.trim()
    );
  }

  onSellerSelected(customer: Customer) {
    this.seller.strasse = customer.strasse || '';
    this.seller.hausnummer = customer.hausnummer || '';
    this.seller.plz = customer.plz || '';
    this.seller.stadt = customer.stadt || '';
    this.seller.telefon = customer.telefon || '';
    this.seller.email = customer.email || '';
    this.seller.steuernummer = customer.steuernummer || '';
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (const file of Array.from(input.files)) {
        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrls.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
    input.value = '';
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  onGalleryFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (const file of Array.from(input.files)) {
        this.galleryFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          this.galleryPreviewUrls.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
    input.value = '';
  }

  removeGalleryFile(index: number) {
    this.galleryFiles.splice(index, 1);
    this.galleryPreviewUrls.splice(index, 1);
  }

  submit() {
    if (!this.canSubmit() || this.submitting) return;
    this.submitting = true;

    const dto: PurchaseCreateForExistingBike = {
      bicycleId: this.bicycleId,
      seller: {
        vorname: this.seller.vorname,
        nachname: this.seller.nachname,
        strasse: this.seller.strasse || undefined,
        hausnummer: this.seller.hausnummer || undefined,
        plz: this.seller.plz || undefined,
        stadt: this.seller.stadt || undefined,
        telefon: this.seller.telefon || undefined,
        email: this.seller.email || undefined,
        steuernummer: this.seller.steuernummer || undefined,
      },
      preis: this.preis,
      verkaufspreisVorschlag: this.verkaufspreisVorschlag ?? undefined,
      zahlungsart: this.zahlungsart,
      kaufdatum: this.kaufdatum,
      notizen: this.notizen || undefined,
      belegNummer: this.belegNummer || undefined,
      marke: this.bikeMarke || undefined,
      modell: this.bikeModell || undefined,
      rahmennummer: this.bikeRahmennummer || undefined,
      rahmengroesse: this.bikeRahmengroesse || undefined,
      farbe: this.bikeFarbe || undefined,
      reifengroesse: this.bikeReifengroesse || undefined,
      fahrradtyp: this.bikeFahrradtyp || undefined,
      art: this.bikeArt || undefined,
      zustand: this.bikeZustand,
    };

    this.purchaseService.createForExistingBike(dto).subscribe({
      next: (result) => {
        const allUploads: Observable<any>[] = [];

        if (this.selectedFiles.length > 0 && result.id) {
          const docUploads = this.selectedFiles.map((file) =>
            this.documentService.upload(
              file,
              DocumentType.Screenshot,
              result.bicycle.id,
              result.id,
            ),
          );
          allUploads.push(...docUploads);
        }

        if (this.galleryFiles.length > 0 && result.bicycle?.id) {
          const galleryUploads = this.galleryFiles.map((file) =>
            this.bicycleService.uploadGalleryImage(result.bicycle.id, file),
          );
          allUploads.push(...galleryUploads);
        }

        if (allUploads.length > 0) {
          forkJoin(allUploads).subscribe({
            next: () => {
              this.router.navigate(['/purchases/missing']);
            },
            error: () => {
              this.router.navigate(['/purchases/missing']);
            },
          });
        } else {
          this.router.navigate(['/purchases/missing']);
        }
      },
      error: () => {
        this.submitting = false;
      },
    });
  }
}
