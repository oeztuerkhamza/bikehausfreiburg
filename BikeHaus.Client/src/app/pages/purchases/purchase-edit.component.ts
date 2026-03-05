import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PurchaseService } from '../../services/purchase.service';
import { DocumentService } from '../../services/document.service';
import { TranslationService } from '../../services/translation.service';
import {
  Purchase,
  PurchaseUpdate,
  PaymentMethod,
  BikeCondition,
  BikeStatus,
  Document as DocModel,
} from '../../models/models';
import { AddressAutocompleteComponent } from '../../components/address-autocomplete/address-autocomplete.component';
import { AddressSuggestion } from '../../services/address.service';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-purchase-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AddressAutocompleteComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.editPurchase }}</h1>
        <a routerLink="/purchases" class="btn btn-outline">{{ t.back }}</a>
      </div>

      <div *ngIf="loading" class="loading">{{ t.loading }}</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <form *ngIf="purchase && !loading" (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Seller info -->
          <div class="form-card">
            <h2>{{ t.seller }} ({{ t.customer }})</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.firstNameRequired }}</label>
                <input
                  [(ngModel)]="seller.vorname"
                  name="sellerVorname"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.lastNameRequired }}</label>
                <input
                  [(ngModel)]="seller.nachname"
                  name="sellerNachname"
                  required
                />
              </div>
              <div class="field full">
                <label>{{ t.searchAddress }}</label>
                <app-address-autocomplete
                  placeholder="z.B. Bissierstraße 16, Freiburg"
                  (addressSelected)="onSellerAddressSelected($event)"
                ></app-address-autocomplete>
                <small class="hint">{{ t.addressHint }}</small>
              </div>
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
                <input [(ngModel)]="seller.telefon" name="sellerTel" />
              </div>
              <div class="field">
                <label>{{ t.email }}</label>
                <input
                  type="email"
                  [(ngModel)]="seller.email"
                  name="sellerEmail"
                />
              </div>
            </div>
          </div>

          <!-- Bicycle info -->
          <div class="form-card">
            <h2>{{ t.bicycle }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.brand }} *</label>
                <input [(ngModel)]="bicycle.marke" name="bikeMarke" required />
              </div>
              <div class="field">
                <label>{{ t.model }} *</label>
                <input
                  [(ngModel)]="bicycle.modell"
                  name="bikeModell"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.frameNumber }} *</label>
                <input
                  [(ngModel)]="bicycle.rahmennummer"
                  name="bikeRahmen"
                  required
                  style="text-transform: uppercase"
                />
              </div>
              <div class="field">
                <label>{{ t.frameSize }}</label>
                <input
                  [(ngModel)]="bicycle.rahmengroesse"
                  name="bikeRahmengroesse"
                  placeholder="z.B. 52, 56, M, L"
                />
              </div>
              <div class="field">
                <label>{{ t.color }} *</label>
                <div class="color-chips">
                  <button
                    type="button"
                    *ngFor="let c of colorOptions"
                    class="color-chip"
                    [class.selected]="isColorSelected(bicycle.farbe, c.value)"
                    [style.--chip-color]="c.hex"
                    (click)="
                      bicycle.farbe = toggleColor(bicycle.farbe, c.value)
                    "
                  >
                    <span class="chip-dot"></span>
                    {{ c.label }}
                  </button>
                </div>
              </div>
              <div class="field">
                <label>{{ t.wheelSize }} *</label>
                <select
                  [(ngModel)]="bicycle.reifengroesse"
                  name="bikeReifen"
                  required
                >
                  <option value="">-- {{ t.selectOption }} --</option>
                  <option value="12">12"</option>
                  <option value="14">14"</option>
                  <option value="16">16"</option>
                  <option value="18">18"</option>
                  <option value="20">20"</option>
                  <option value="24">24"</option>
                  <option value="26">26"</option>
                  <option value="27.5">27.5"</option>
                  <option value="28">28"</option>
                  <option value="29">29"</option>
                </select>
              </div>
              <div class="field">
                <label>{{ t.stockNo }}</label>
                <input
                  [(ngModel)]="bicycle.stokNo"
                  name="bikeStokNo"
                  placeholder="optional"
                />
              </div>
              <div class="field">
                <label>{{ t.bicycleType }}</label>
                <select [(ngModel)]="bicycle.fahrradtyp" name="bikeFahrradtyp">
                  <option value="">-- Auswählen --</option>
                  <option value="E-Bike">E-Bike</option>
                  <option value="E-Trekking Pedelec">E-Trekking Pedelec</option>
                  <option value="Trekking">Trekking</option>
                  <option value="City">City</option>
                  <option value="MTB">Mountainbike (MTB)</option>
                  <option value="Rennrad">Rennrad</option>
                  <option value="Kinderfahrrad">Kinderfahrrad</option>
                  <option value="Lastenrad">Lastenrad</option>
                  <option value="Sonstige">Sonstige</option>
                </select>
              </div>
              <div class="field">
                <label>{{ t.artLabel }}</label>
                <select [(ngModel)]="bicycle.art" name="bikeArt">
                  <option value="">-- Auswählen --</option>
                  <option value="Herren">Herren</option>
                  <option value="Damen">Damen</option>
                  <option value="Kinder">Kinder</option>
                </select>
              </div>
              <div class="field">
                <label>{{ t.condition }} *</label>
                <select
                  [(ngModel)]="bicycle.zustand"
                  name="bikeZustand"
                  required
                >
                  <option value="Gebraucht">
                    {{ t.usedCondition }}
                  </option>
                  <option value="Neu">{{ t.newCondition }}</option>
                </select>
              </div>
              <div class="field full">
                <label>{{ t.descriptionEquipment }}</label>
                <textarea
                  [(ngModel)]="bicycle.beschreibung"
                  name="bikeBeschr"
                  rows="4"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Purchase details -->
          <div class="form-card">
            <h2>{{ t.purchaseData }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.receiptNo }}</label>
                <input [(ngModel)]="belegNummer" name="belegNummer" />
              </div>
              <div class="field">
                <label>{{ t.priceRequired }}</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="preis"
                  name="preis"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.plannedSellingPrice }} (€)</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="verkaufspreisVorschlag"
                  name="verkaufspreisVorschlag"
                  placeholder="optional"
                />
              </div>
              <div class="field">
                <label>{{ t.paymentMethodRequired }}</label>
                <select [(ngModel)]="zahlungsart" name="zahlungsart" required>
                  <option value="Bar">{{ t.cash }}</option>
                  <option value="PayPal">{{ t.paypal }}</option>
                  <option value="Karte">{{ t.bankTransfer }}</option>
                  <option value="Ueberweisung">Überweisung</option>
                </select>
              </div>
              <div class="field">
                <label>{{ t.purchaseDate }} *</label>
                <input
                  type="date"
                  [(ngModel)]="kaufdatum"
                  name="kaufdatum"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.adNumber }}</label>
                <input
                  [(ngModel)]="anzeigeNr"
                  name="anzeigeNr"
                  placeholder="optional"
                />
              </div>
              <div class="field full">
                <label>{{ t.notes }}</label>
                <textarea
                  [(ngModel)]="notizen"
                  name="notizen"
                  rows="2"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Photo Gallery -->
          <div class="form-card">
            <h2>📷 {{ t.photoGallery }}</h2>
            <div class="gallery-section">
              <div class="gallery-grid" *ngIf="documents.length > 0">
                <div class="gallery-item" *ngFor="let doc of documents">
                  <img
                    [src]="getDocumentUrl(doc)"
                    [alt]="doc.fileName"
                    (click)="openImagePreview(doc)"
                  />
                  <button
                    type="button"
                    class="delete-btn"
                    (click)="deleteDocument(doc)"
                    title="Löschen"
                  >
                    ×
                  </button>
                </div>
              </div>
              <p *ngIf="documents.length === 0" class="no-photos">
                {{ t.noPhotos }}
              </p>
              <div class="upload-row">
                <input
                  type="file"
                  #photoInput
                  (change)="onPhotosSelected($event)"
                  accept="image/*"
                  multiple
                  style="display: none"
                />
                <button
                  type="button"
                  class="btn btn-outline"
                  (click)="photoInput.click()"
                  [disabled]="uploading"
                >
                  {{ uploading ? t.uploading : t.addPhotos }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            [disabled]="submitting"
          >
            {{ submitting ? t.saving : t.saveChanges }}
          </button>
        </div>
      </form>
    </div>

    <!-- Image Preview Modal -->
    <div class="preview-overlay" *ngIf="previewImage" (click)="closePreview()">
      <button type="button" class="close-preview">×</button>
      <img [src]="previewImage" alt="Preview" />
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 900px;
        margin: 0 auto;
        animation: fadeIn 0.4s ease;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 22px;
      }
      .page-header h1 {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      .loading,
      .error {
        text-align: center;
        padding: 48px;
        font-size: 1.1rem;
        color: var(--text-secondary, #64748b);
      }
      .error {
        color: var(--accent-danger, #ef4444);
      }
      .form-sections {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .form-card {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 24px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
      }
      .form-card h2 {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 16px;
        color: var(--text-primary);
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      @media (max-width: 600px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
      .field label {
        display: block;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-secondary, #64748b);
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .field input,
      .field select,
      .field textarea {
        width: 100%;
        padding: 9px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        transition: var(--transition-fast);
      }
      .field input:focus,
      .field select:focus,
      .field textarea:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }
      .field.full {
        grid-column: 1 / -1;
      }
      .field .hint {
        display: block;
        font-size: 0.73rem;
        color: var(--text-secondary, #94a3b8);
        margin-top: 4px;
      }
      .color-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .color-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: 20px;
        background: var(--bg-card, #fff);
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .color-chip:hover {
        border-color: var(--accent-primary, #6366f1);
        background: var(--table-hover, #f1f5f9);
      }
      .color-chip.selected {
        border-color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        font-weight: 600;
      }
      .chip-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--chip-color, #ccc);
        border: 1px solid rgba(0, 0, 0, 0.12);
        flex-shrink: 0;
      }
      .form-actions {
        margin-top: 24px;
        text-align: right;
      }
      .btn-lg {
        padding: 12px 32px;
        font-size: 1.05rem;
      }
      /* Photo Gallery */
      .gallery-section {
        margin-top: 12px;
      }
      .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }
      .gallery-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: var(--radius-md, 10px);
        overflow: hidden;
        border: 1px solid var(--border-light, #e2e8f0);
        cursor: pointer;
      }
      .gallery-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.2s;
      }
      .gallery-item:hover img {
        transform: scale(1.05);
      }
      .gallery-item .delete-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(239, 68, 68, 0.9);
        color: #fff;
        border: none;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .gallery-item:hover .delete-btn {
        opacity: 1;
      }
      .upload-area {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .upload-area input[type='file'] {
        display: none;
      }
      .upload-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 20px;
        background: var(--accent-primary, #6366f1);
        color: #fff;
        border: none;
        border-radius: var(--radius-md, 10px);
        font-size: 0.9rem;
        cursor: pointer;
        transition: var(--transition-fast);
      }
      .upload-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .upload-btn:hover:not(:disabled) {
        background: var(--accent-primary-dark, #4f46e5);
      }
      .empty-gallery {
        color: var(--text-secondary, #64748b);
        font-size: 0.9rem;
        padding: 20px;
        text-align: center;
        border: 2px dashed var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        margin-bottom: 16px;
      }
      /* Image Preview Modal */
      .preview-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        cursor: pointer;
      }
      .preview-overlay img {
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: var(--radius-md, 10px);
      }
      .close-preview {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        color: #fff;
        font-size: 24px;
        cursor: pointer;
      }
    `,
  ],
})
export class PurchaseEditComponent implements OnInit {
  private translationService = inject(TranslationService);
  get t() {
    return this.translationService.translations();
  }

  colorOptions = [
    { value: 'Schwarz', label: 'Schwarz', hex: '#1a1a1a' },
    { value: 'Weiß', label: 'Weiß', hex: '#f5f5f5' },
    { value: 'Rot', label: 'Rot', hex: '#ef4444' },
    { value: 'Blau', label: 'Blau', hex: '#3b82f6' },
    { value: 'Grün', label: 'Grün', hex: '#22c55e' },
    { value: 'Gelb', label: 'Gelb', hex: '#eab308' },
    { value: 'Orange', label: 'Orange', hex: '#f97316' },
    { value: 'Grau', label: 'Grau', hex: '#9ca3af' },
    { value: 'Silber', label: 'Silber', hex: '#c0c0c0' },
    { value: 'Pink', label: 'Pink', hex: '#ec4899' },
  ];

  isColorSelected(farbe: string, color: string): boolean {
    if (!farbe) return false;
    return farbe.split(/[,\/]\s*/).includes(color);
  }

  toggleColor(farbe: string, color: string): string {
    const colors = farbe ? farbe.split(/[,\/]\s*/).filter(Boolean) : [];
    const idx = colors.indexOf(color);
    if (idx >= 0) colors.splice(idx, 1);
    else colors.push(color);
    return colors.join('/');
  }

  purchase: Purchase | null = null;
  loading = true;
  error = '';
  submitting = false;
  uploading = false;
  documents: DocModel[] = [];
  previewImage: string | null = null;

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

  bicycle = {
    marke: '',
    modell: '',
    rahmennummer: '',
    rahmengroesse: '',
    farbe: '',
    reifengroesse: '',
    stokNo: '',
    fahrradtyp: '',
    art: '',
    beschreibung: '',
    status: BikeStatus.Available,
    zustand: BikeCondition.Gebraucht,
  };

  preis = 0;
  verkaufspreisVorschlag: number | null = null;
  zahlungsart: PaymentMethod = PaymentMethod.Bar;
  kaufdatum = '';
  notizen = '';
  anzeigeNr = '';
  belegNummer = '';

  constructor(
    private purchaseService: PurchaseService,
    private documentService: DocumentService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = this.t.invalidPurchaseId;
      this.loading = false;
      return;
    }

    this.purchaseService.getById(+id).subscribe({
      next: (purchase) => {
        this.purchase = purchase;
        this.loadFormData(purchase);
        this.loadDocuments(+id);
        this.loading = false;
      },
      error: () => {
        this.error = this.t.purchaseNotFound;
        this.loading = false;
      },
    });
  }

  loadDocuments(purchaseId: number) {
    this.documentService.getByPurchaseId(purchaseId).subscribe({
      next: (docs) => {
        this.documents = docs;
      },
      error: () => {
        // silently fail - photos are optional
      },
    });
  }

  getDocumentUrl(doc: DocModel): string {
    return `${environment.apiUrl}/documents/${doc.id}/download`;
  }

  onPhotosSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.purchase) return;

    this.uploading = true;
    const uploads = Array.from(input.files).map((file) => {
      return this.documentService.upload(
        file,
        'screenshot',
        undefined,
        this.purchase!.id,
        undefined,
      );
    });

    forkJoin(uploads).subscribe({
      next: () => {
        this.loadDocuments(this.purchase!.id);
        this.uploading = false;
        input.value = '';
      },
      error: () => {
        this.uploading = false;
      },
    });
  }

  deleteDocument(doc: DocModel) {
    if (!confirm('Löschen?')) return;
    this.documentService.delete(doc.id).subscribe({
      next: () => {
        this.documents = this.documents.filter((d) => d.id !== doc.id);
      },
    });
  }

  openImagePreview(doc: DocModel) {
    this.previewImage = this.getDocumentUrl(doc);
  }

  closePreview() {
    this.previewImage = null;
  }

  private loadFormData(purchase: Purchase) {
    // Load seller data
    if (purchase.seller) {
      this.seller = {
        vorname: purchase.seller.vorname || '',
        nachname: purchase.seller.nachname || '',
        strasse: purchase.seller.strasse || '',
        hausnummer: purchase.seller.hausnummer || '',
        plz: purchase.seller.plz || '',
        stadt: purchase.seller.stadt || '',
        telefon: purchase.seller.telefon || '',
        email: purchase.seller.email || '',
        steuernummer: purchase.seller.steuernummer || '',
      };
    }

    // Load bicycle data
    if (purchase.bicycle) {
      this.bicycle = {
        marke: purchase.bicycle.marke || '',
        modell: purchase.bicycle.modell || '',
        rahmennummer: purchase.bicycle.rahmennummer || '',
        rahmengroesse: purchase.bicycle.rahmengroesse || '',
        farbe: purchase.bicycle.farbe || '',
        reifengroesse: purchase.bicycle.reifengroesse || '',
        stokNo: purchase.bicycle.stokNo || '',
        fahrradtyp: purchase.bicycle.fahrradtyp || '',
        art: purchase.bicycle.art || '',
        beschreibung: purchase.bicycle.beschreibung || '',
        status: (purchase.bicycle.status as BikeStatus) || BikeStatus.Available,
        zustand:
          (purchase.bicycle.zustand as BikeCondition) ||
          BikeCondition.Gebraucht,
      };
    }

    // Load purchase data
    this.preis = purchase.preis;
    this.verkaufspreisVorschlag = purchase.verkaufspreisVorschlag || null;
    this.zahlungsart = purchase.zahlungsart as PaymentMethod;
    this.kaufdatum = purchase.kaufdatum
      ? new Date(purchase.kaufdatum).toISOString().split('T')[0]
      : '';
    this.notizen = purchase.notizen || '';
    this.anzeigeNr = purchase.anzeigeNr || '';
    this.belegNummer = purchase.belegNummer || '';
  }

  onSellerAddressSelected(address: AddressSuggestion) {
    this.seller.strasse = address.strasse;
    this.seller.hausnummer = address.hausnummer;
    this.seller.plz = address.plz;
    this.seller.stadt = address.stadt;
  }

  submit() {
    if (!this.purchase) return;
    this.submitting = true;

    const update: PurchaseUpdate = {
      bicycle: this.bicycle,
      seller: this.seller,
      preis: this.preis,
      verkaufspreisVorschlag: this.verkaufspreisVorschlag || undefined,
      zahlungsart: this.zahlungsart,
      kaufdatum: this.kaufdatum,
      notizen: this.notizen || undefined,
      anzeigeNr: this.anzeigeNr || undefined,
      belegNummer: this.belegNummer || undefined,
    };

    this.purchaseService.update(this.purchase.id, update).subscribe({
      next: () => {
        this.router.navigate(['/purchases']);
      },
      error: () => {
        this.submitting = false;
        alert(this.t.saveError);
      },
    });
  }
}
