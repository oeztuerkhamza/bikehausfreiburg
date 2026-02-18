import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PurchaseService } from '../../services/purchase.service';
import { DocumentService } from '../../services/document.service';
import { BicycleService } from '../../services/bicycle.service';
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
        <h1>Neuer Ankauf (Kaufbeleg)</h1>
        <a routerLink="/purchases" class="btn btn-outline">Zurück</a>
      </div>

      <form (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Seller info -->
          <div class="form-card">
            <h2>Verkäufer (Kunde)</h2>
            <div class="form-grid">
              <div class="field">
                <label>Vorname *</label>
                <input
                  [(ngModel)]="seller.vorname"
                  name="sellerVorname"
                  required
                  (ngModelChange)="updateSignerName()"
                />
              </div>
              <div class="field">
                <label>Nachname *</label>
                <input
                  [(ngModel)]="seller.nachname"
                  name="sellerNachname"
                  required
                  (ngModelChange)="updateSignerName()"
                />
              </div>
              <div class="field full">
                <label>Adresse suchen</label>
                <app-address-autocomplete
                  placeholder="z.B. Bissierstraße 16, Freiburg"
                  (addressSelected)="onSellerAddressSelected($event)"
                ></app-address-autocomplete>
                <small class="hint"
                  >Tippen Sie eine Adresse ein für Vorschläge</small
                >
              </div>
              <div class="field">
                <label>Straße</label>
                <input [(ngModel)]="seller.strasse" name="sellerStrasse" />
              </div>
              <div class="field">
                <label>Hausnummer</label>
                <input [(ngModel)]="seller.hausnummer" name="sellerHausnr" />
              </div>
              <div class="field">
                <label>PLZ</label>
                <input [(ngModel)]="seller.plz" name="sellerPlz" />
              </div>
              <div class="field">
                <label>Stadt</label>
                <input [(ngModel)]="seller.stadt" name="sellerStadt" />
              </div>
              <div class="field">
                <label>Telefon</label>
                <input [(ngModel)]="seller.telefon" name="sellerTel" />
              </div>
              <div class="field">
                <label>E-Mail</label>
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
            <h2>Fahrrad</h2>
            <div class="form-grid">
              <div class="field">
                <label>Marke *</label>
                <input [(ngModel)]="bicycle.marke" name="bikeMarke" required />
              </div>
              <div class="field">
                <label>Modell *</label>
                <input
                  [(ngModel)]="bicycle.modell"
                  name="bikeModell"
                  required
                />
              </div>
              <div class="field">
                <label>Rahmennummer *</label>
                <input
                  [(ngModel)]="bicycle.rahmennummer"
                  name="bikeRahmen"
                  required
                />
              </div>
              <div class="field">
                <label>Farbe</label>
                <input [(ngModel)]="bicycle.farbe" name="bikeFarbe" />
              </div>
              <div class="field">
                <label>Reifengröße (Zoll) *</label>
                <input
                  [(ngModel)]="bicycle.reifengroesse"
                  name="bikeReifen"
                  required
                  placeholder="z.B. 28"
                />
              </div>
              <div class="field">
                <label>Stok Nr. *</label>
                <input
                  [(ngModel)]="bicycle.stokNo"
                  name="bikeStokNo"
                  required
                  readonly
                />
              </div>
              <div class="field">
                <label>Fahrradtyp</label>
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
                <label>Zustand *</label>
                <select
                  [(ngModel)]="bicycle.zustand"
                  name="bikeZustand"
                  required
                >
                  <option value="Gebraucht">
                    Gebraucht (3 Monate Garantie)
                  </option>
                  <option value="Neu">Neu (2 Jahre Gewährleistung)</option>
                </select>
              </div>
              <div class="field full">
                <label>Beschreibung (Ausstattung)</label>
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
            <h2>Kaufdaten</h2>
            <div class="form-grid">
              <div class="field">
                <label>Preis (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="preis"
                  name="preis"
                  required
                />
              </div>
              <div class="field">
                <label>Geplanter Verkaufspreis (€)</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="verkaufspreisVorschlag"
                  name="verkaufspreisVorschlag"
                  placeholder="optional"
                />
              </div>
              <div class="field">
                <label>Zahlungsart *</label>
                <select [(ngModel)]="zahlungsart" name="zahlungsart" required>
                  <option value="Bar">Bar</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Ueberweisung">Überweisung</option>
                </select>
              </div>
              <div class="field">
                <label>Kaufdatum *</label>
                <input
                  type="date"
                  [(ngModel)]="kaufdatum"
                  name="kaufdatum"
                  required
                />
              </div>
              <div class="field full">
                <label>Notizen</label>
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
                  ? 'Rechnung (Kaufbeleg) *'
                  : 'Kleinanzeigen Screenshots *'
              }}
            </h2>
            <p class="hint-text">
              {{
                bicycle.zustand === 'Neu'
                  ? 'Bitte laden Sie die Kaufrechnung des neuen Fahrrads hoch.'
                  : 'Bitte laden Sie Screenshots von Kleinanzeigen hoch.'
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
                    ? '📄 Rechnung auswählen'
                    : '📷 Fotos auswählen'
                }}
              </button>
              <span class="file-count" *ngIf="selectedFiles.length > 0">
                {{ selectedFiles.length }} Foto(s) ausgewählt
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
            <h2>Unterschrift des Verkäufers</h2>
            <app-signature-pad
              label="Unterschrift"
              [(ngModel)]="signatureData"
              name="signature"
            ></app-signature-pad>
            <div class="field" style="margin-top:8px;">
              <label>Name des Unterschreibenden</label>
              <input [(ngModel)]="signerName" name="signerName" />
            </div>
          </div>
        </div>

        <!-- Validation messages -->
        <div class="validation-errors" *ngIf="!canSubmit() && !submitting">
          <p *ngIf="!seller.vorname?.trim()" class="error-msg">
            ⚠️ Vorname des Verkäufers ist erforderlich
          </p>
          <p *ngIf="!seller.nachname?.trim()" class="error-msg">
            ⚠️ Nachname des Verkäufers ist erforderlich
          </p>
          <p *ngIf="!bicycle.marke?.trim()" class="error-msg">
            ⚠️ Marke ist erforderlich
          </p>
          <p *ngIf="!bicycle.modell?.trim()" class="error-msg">
            ⚠️ Modell ist erforderlich
          </p>
          <p *ngIf="!bicycle.rahmennummer?.trim()" class="error-msg">
            ⚠️ Rahmennummer ist erforderlich
          </p>

          <p *ngIf="!bicycle.reifengroesse?.trim()" class="error-msg">
            ⚠️ Reifengröße ist erforderlich
          </p>
          <p *ngIf="!preis || preis <= 0" class="error-msg">
            ⚠️ Preis muss größer als 0 sein
          </p>
          <p *ngIf="!kaufdatum" class="error-msg">
            ⚠️ Kaufdatum ist erforderlich
          </p>
          <p *ngIf="selectedFiles.length === 0" class="error-msg">
            ⚠️
            {{
              bicycle.zustand === 'Neu'
                ? 'Rechnung ist erforderlich'
                : 'Kleinanzeigen Screenshot ist erforderlich'
            }}
          </p>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            [disabled]="!canSubmit() || submitting"
          >
            {{ submitting ? 'Wird gespeichert...' : 'Ankauf speichern' }}
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
      @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
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
        .form-grid { grid-template-columns: 1fr; }
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
        box-shadow: 0 0 0 3px var(--accent-primary-light, rgba(99,102,241,0.10));
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
