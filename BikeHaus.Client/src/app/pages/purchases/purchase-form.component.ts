import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PurchaseService } from '../../services/purchase.service';
import { DocumentService } from '../../services/document.service';
import { BicycleService } from '../../services/bicycle.service';
import { TranslationService } from '../../services/translation.service';
import {
  PurchaseCreate,
  PaymentMethod,
  BikeCondition,
  SignatureCreate,
  DocumentType,
} from '../../models/models';
import { SignaturePadComponent } from '../../components/signature-pad/signature-pad.component';
import { AddressAutocompleteComponent } from '../../components/address-autocomplete/address-autocomplete.component';
import { AddressSuggestion } from '../../services/address.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    SignaturePadComponent,
    AddressAutocompleteComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.newPurchaseTitle }}</h1>
        <a routerLink="/purchases" class="btn btn-outline">{{ t.back }}</a>
      </div>

      <form (ngSubmit)="submit()" #f="ngForm">
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
                  (ngModelChange)="updateSignerName()"
                />
              </div>
              <div class="field">
                <label>{{ t.lastNameRequired }}</label>
                <input
                  [(ngModel)]="seller.nachname"
                  name="sellerNachname"
                  required
                  (ngModelChange)="updateSignerName()"
                />
              </div>
              <div class="field full">
                <label>{{ t.searchAddress }}</label>
                <app-address-autocomplete
                  placeholder="z.B. Bissierstraße 16, Freiburg"
                  (addressSelected)="onSellerAddressSelected($event)"
                ></app-address-autocomplete>
                <small class="hint"
                  >{{ t.addressHint }}</small
                >
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
                />
              </div>
              <div class="field">
                <label>{{ t.color }}</label>
                <input [(ngModel)]="bicycle.farbe" name="bikeFarbe" />
              </div>
              <div class="field">
                <label>{{ t.wheelSize }} *</label>
                <input
                  [(ngModel)]="bicycle.reifengroesse"
                  name="bikeReifen"
                  required
                  placeholder="z.B. 28"
                />
              </div>
              <div class="field">
                <label>{{ t.stockNo }} *</label>
                <input
                  [(ngModel)]="bicycle.stokNo"
                  name="bikeStokNo"
                  required
                  readonly
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
                  placeholder="z.B.&#10;E-Trekking Pedelec&#10;Bosch Performance Line 65&#10;NM 500 Wh&#10;28 Zoll Trapez 50 cm"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Purchase details -->
          <div class="form-card">
            <h2>{{ t.purchaseData }}</h2>
            <div class="form-grid">
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
                  <option value="Ueberweisung">{{ t.bankTransfer }}</option>
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

          <!-- Document Upload (Rechnung or Kleinanzeigen) -->
          <div class="form-card">
            <h2>
              {{
                bicycle.zustand === 'Neu'
                  ? t.invoiceRequired
                  : t.screenshotsRequired
              }}
            </h2>
            <p class="hint-text">
              {{
                bicycle.zustand === 'Neu'
                  ? t.invoiceHint
                  : t.screenshotsHint
              }}
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
                {{
                  bicycle.zustand === 'Neu'
                    ? '📄 ' + t.selectInvoice
                    : '📷 ' + t.selectPhotos
                }}
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

          <!-- Signature -->
          <div class="form-card">
            <h2>{{ t.sellerSignature }}</h2>
            <app-signature-pad
              [label]="t.signatures"
              [(ngModel)]="signatureData"
              name="signature"
            ></app-signature-pad>
            <div class="field" style="margin-top:8px;">
              <label>{{ t.signerName }}</label>
              <input [(ngModel)]="signerName" name="signerName" />
            </div>
          </div>
        </div>

        <!-- Validation messages -->
        <div class="validation-errors" *ngIf="!canSubmit() && !submitting">
          <p *ngIf="!seller.vorname?.trim()" class="error-msg">
            ⚠️ {{ t.sellerFirstNameRequired }}
          </p>
          <p *ngIf="!seller.nachname?.trim()" class="error-msg">
            ⚠️ {{ t.sellerLastNameRequired }}
          </p>
          <p *ngIf="!bicycle.marke?.trim()" class="error-msg">
            ⚠️ {{ t.brandIsRequired }}
          </p>
          <p *ngIf="!bicycle.modell?.trim()" class="error-msg">
            ⚠️ {{ t.modelIsRequired }}
          </p>
          <p *ngIf="!bicycle.rahmennummer?.trim()" class="error-msg">
            ⚠️ {{ t.frameNumberIsRequired }}
          </p>

          <p *ngIf="!bicycle.reifengroesse?.trim()" class="error-msg">
            ⚠️ {{ t.wheelSizeIsRequired }}
          </p>
          <p *ngIf="!preis || preis <= 0" class="error-msg">
            ⚠️ {{ t.priceMustBeGreaterThanZero }}
          </p>
          <p *ngIf="!kaufdatum" class="error-msg">
            ⚠️ {{ t.purchaseDateIsRequired }}
          </p>
          <p *ngIf="selectedFiles.length === 0" class="error-msg">
            ⚠️
            {{
              bicycle.zustand === 'Neu'
                ? t.invoiceIsRequired
                : t.screenshotIsRequired
            }}
          </p>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            [disabled]="!canSubmit() || submitting"
          >
            {{ submitting ? t.saving : t.savePurchase }}
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
      .form-actions {
        margin-top: 24px;
        text-align: right;
      }
      .btn-lg {
        padding: 12px 32px;
        font-size: 1.05rem;
      }
      .hint-text {
        font-size: 0.85rem;
        color: var(--text-secondary, #64748b);
        margin-bottom: 12px;
      }
      .upload-area {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      .file-count {
        font-size: 0.9rem;
        color: var(--text-secondary, #64748b);
      }
      .preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;
      }
      .preview-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: var(--radius-md, 10px);
        overflow: hidden;
        border: 1.5px solid var(--border-light, #e2e8f0);
      }
      .preview-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .remove-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 24px;
        height: 24px;
        border: none;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        transition: var(--transition-fast);
      }
      .remove-btn:hover {
        background: var(--accent-danger, #ef4444);
      }
    `,
  ],
})
export class PurchaseFormComponent implements OnInit {
  private translationService = inject(TranslationService);
  get t() { return this.translationService.translations(); }

  seller = {
    vorname: '',
    nachname: '',
    strasse: '',
    hausnummer: '',
    plz: '',
    stadt: '',
    telefon: '',
    email: '',
  };
  bicycle = {
    marke: '',
    modell: '',
    rahmennummer: '',
    farbe: '',
    reifengroesse: '',
    stokNo: '',
    fahrradtyp: '',
    beschreibung: '',
    zustand: BikeCondition.Gebraucht,
  };
  preis = 0;
  verkaufspreisVorschlag: number | null = null;
  zahlungsart: PaymentMethod = PaymentMethod.Bar;
  kaufdatum = '';
  notizen = '';
  signatureData = '';
  signerName = '';
  submitting = false;

  // Screenshot upload
  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  constructor(
    private purchaseService: PurchaseService,
    private documentService: DocumentService,
    private bicycleService: BicycleService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.kaufdatum = new Date().toISOString().split('T')[0];
    this.bicycleService.getNextStokNo().subscribe({
      next: (res) => {
        this.bicycle.stokNo = res.stokNo;
      },
      error: () => {
        // fallback: leave empty
      },
    });
  }

  canSubmit(): boolean {
    return !!(
      this.seller.vorname?.trim() &&
      this.seller.nachname?.trim() &&
      this.bicycle.marke?.trim() &&
      this.bicycle.modell?.trim() &&
      this.bicycle.rahmennummer?.trim() &&
      this.bicycle.reifengroesse?.trim() &&
      this.preis > 0 &&
      this.kaufdatum &&
      this.selectedFiles.length > 0
    );
  }

  onSellerAddressSelected(address: AddressSuggestion) {
    this.seller.strasse = address.strasse;
    this.seller.hausnummer = address.hausnummer;
    this.seller.plz = address.plz;
    this.seller.stadt = address.stadt;
  }

  updateSignerName() {
    const name = [this.seller.vorname, this.seller.nachname]
      .filter(Boolean)
      .join(' ')
      .trim();
    if (name) {
      this.signerName = name;
    }
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (const file of Array.from(input.files)) {
        this.selectedFiles.push(file);

        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrls.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
    // Reset input so same file can be selected again
    input.value = '';
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  submit() {
    this.submitting = true;
    const signature: SignatureCreate | undefined = this.signatureData
      ? {
          signatureData: this.signatureData,
          signerName:
            this.signerName || `${this.seller.vorname} ${this.seller.nachname}`,
          signatureType: 'Seller' as any,
        }
      : undefined;

    const purchase: PurchaseCreate = {
      bicycle: this.bicycle,
      seller: this.seller,
      preis: this.preis,
      verkaufspreisVorschlag: this.verkaufspreisVorschlag || undefined,
      zahlungsart: this.zahlungsart,
      kaufdatum: this.kaufdatum,
      notizen: this.notizen || undefined,
      signature,
    };

    this.purchaseService.create(purchase).subscribe({
      next: (result) => {
        // Upload Kleinanzeigen screenshots if any
        if (this.selectedFiles.length > 0 && result.id) {
          const docType =
            this.bicycle.zustand === 'Neu'
              ? DocumentType.Rechnung
              : DocumentType.Screenshot;
          const uploadObservables = this.selectedFiles.map((file) =>
            this.documentService.upload(
              file,
              docType,
              result.bicycle.id,
              result.id,
            ),
          );

          forkJoin(uploadObservables).subscribe({
            next: () => {
              this.router.navigate(['/purchases']);
            },
            error: () => {
              // Purchase created but uploads failed - still navigate
              console.error('Fehler beim Hochladen der Screenshots');
              this.router.navigate(['/purchases']);
            },
          });
        } else {
          this.router.navigate(['/purchases']);
        }
      },
      error: () => {
        this.submitting = false;
        alert('Fehler beim Speichern des Ankaufs');
      },
    });
  }
}
