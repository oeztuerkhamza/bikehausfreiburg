import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BicycleService } from '../../services/bicycle.service';
import { PurchaseService } from '../../services/purchase.service';
import { DocumentService } from '../../services/document.service';
import { TranslationService } from '../../services/translation.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { environment } from '../../../environments/environment';
import {
  Bicycle,
  BicycleImage,
  BicycleUpdate,
  BikeStatus,
  BikeCondition,
  Purchase,
  PurchaseUpdate,
  CustomerUpdate,
  PaymentMethod,
  Document as DocModel,
} from '../../models/models';

@Component({
  selector: 'app-bicycle-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page" *ngIf="bicycle">
      <div class="page-header">
        <h1>{{ t.edit }}: {{ bicycle.marke }} {{ bicycle.modell }}</h1>
        <div class="header-actions">
          <button
            class="btn btn-primary"
            (click)="save()"
            [disabled]="submitting"
          >
            {{ submitting ? '...' : t.save }}
          </button>
          <a routerLink="/bicycles" class="btn btn-outline">{{ t.cancel }}</a>
        </div>
      </div>

      <div class="edit-grid">
        <!-- Left: Bicycle fields -->
        <div class="edit-card">
          <h2>{{ t.bicycleData }}</h2>
          <div class="form-grid">
            <div class="field">
              <label>{{ t.brand }} *</label>
              <input [(ngModel)]="form.marke" name="marke" />
            </div>
            <div class="field">
              <label>{{ t.model }}</label>
              <input [(ngModel)]="form.modell" name="modell" />
            </div>
            <div class="field">
              <label>{{ t.frameNumber }}</label>
              <input
                [(ngModel)]="form.rahmennummer"
                name="rahmennummer"
                placeholder="optional"
                style="text-transform: uppercase"
              />
            </div>
            <div class="field">
              <label>{{ t.frameSize }}</label>
              <input
                [(ngModel)]="form.rahmengroesse"
                name="rahmengroesse"
                placeholder="z.B. 52, 56, M, L"
              />
            </div>
            <div class="field">
              <label>{{ t.color }}</label>
              <div class="color-chips">
                <button
                  type="button"
                  *ngFor="let c of colorOptions"
                  class="color-chip"
                  [class.selected]="isColorSelected(form.farbe || '', c.value)"
                  [style.--chip-color]="c.hex"
                  (click)="form.farbe = toggleColor(form.farbe || '', c.value)"
                >
                  <span class="chip-dot"></span>
                  {{ c.label }}
                </button>
              </div>
            </div>
            <div class="field">
              <label>{{ t.wheelSize }}</label>
              <select [(ngModel)]="form.reifengroesse" name="reifengroesse">
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
              <input [(ngModel)]="form.stokNo" name="stokNo" />
            </div>
            <div class="field">
              <label>{{ t.bicycleType }}</label>
              <select [(ngModel)]="form.fahrradtyp" name="fahrradtyp">
                <option value="">-- {{ t.selectOption }} --</option>
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
              <select [(ngModel)]="form.art" name="art">
                <option value="">-- {{ t.selectOption }} --</option>
                <option value="Herren">Herren</option>
                <option value="Damen">Damen</option>
                <option value="Kinder">Kinder</option>
              </select>
            </div>
            <div class="field">
              <label>{{ t.condition }}</label>
              <select [(ngModel)]="form.zustand" name="zustand">
                <option [value]="BikeCondition.Gebraucht">
                  {{ t.usedCondition }}
                </option>
                <option [value]="BikeCondition.Neu">
                  {{ t.newCondition }}
                </option>
              </select>
            </div>
            <div class="field">
              <label>{{ t.status }}</label>
              <select [(ngModel)]="form.status" name="status">
                <option value="Available">{{ t.available }}</option>
                <option value="Sold">{{ t.sold }}</option>
                <option value="Reserved">{{ t.reserved }}</option>
              </select>
            </div>
            <div class="field field-full">
              <label>{{ t.description }}</label>
              <textarea
                [(ngModel)]="form.beschreibung"
                name="beschreibung"
                rows="3"
                placeholder="optional"
              ></textarea>
            </div>
            <div class="field" *ngIf="bicycle?.kleinanzeigenAnzeigeNr">
              <label>KA Anzeige-Nr (Verkauf)</label>
              <input
                [value]="bicycle?.kleinanzeigenAnzeigeNr"
                readonly
                class="readonly-field"
              />
            </div>
          </div>
        </div>

        <!-- Purchase Data (Alış Belgesi) -->
        <div class="edit-card" *ngIf="purchase">
          <h2>{{ t.purchaseData }}</h2>
          <div class="form-grid">
            <div class="field">
              <label>{{ t.bicyclePrice }} (EK)</label>
              <input
                type="number"
                [(ngModel)]="purchaseForm.preis"
                name="purchasePreis"
                step="0.01"
              />
            </div>
            <div class="field">
              <label>{{ t.plannedSellingPrice }}</label>
              <input
                type="number"
                [(ngModel)]="purchaseForm.verkaufspreisVorschlag"
                name="verkaufspreisVorschlag"
                step="0.01"
                placeholder="z.B. 350"
              />
            </div>
            <div class="field">
              <label>{{ t.paymentMethod }}</label>
              <select [(ngModel)]="purchaseForm.zahlungsart" name="zahlungsart">
                <option value="Bar">Bar</option>
                <option value="PayPal">PayPal</option>
                <option value="Karte">Karte</option>
              </select>
            </div>
            <div class="field">
              <label>{{ t.purchaseDate }}</label>
              <input
                type="date"
                [(ngModel)]="purchaseForm.kaufdatum"
                name="kaufdatum"
              />
            </div>
            <div class="field">
              <label>Beleg-Nr.</label>
              <input
                [(ngModel)]="purchaseForm.belegNummer"
                name="belegNummer"
              />
            </div>
            <div class="field">
              <label>Anzeige-Nr.</label>
              <input [(ngModel)]="purchaseForm.anzeigeNr" name="anzeigeNr" />
            </div>
            <div class="field field-full">
              <label>{{ t.notes }}</label>
              <textarea
                [(ngModel)]="purchaseForm.notizen"
                name="purchaseNotizen"
                rows="2"
                placeholder="optional"
              ></textarea>
            </div>
          </div>

          <h3 class="sub-heading">{{ t.seller }}</h3>
          <div class="form-grid">
            <div class="field">
              <label>{{ t.firstName }}</label>
              <input [(ngModel)]="sellerForm.vorname" name="sellerVorname" />
            </div>
            <div class="field">
              <label>{{ t.lastName }}</label>
              <input [(ngModel)]="sellerForm.nachname" name="sellerNachname" />
            </div>
            <div class="field">
              <label>{{ t.street || 'Straße' }}</label>
              <input [(ngModel)]="sellerForm.strasse" name="sellerStrasse" />
            </div>
            <div class="field">
              <label>{{ t.houseNumber || 'Hausnr.' }}</label>
              <input
                [(ngModel)]="sellerForm.hausnummer"
                name="sellerHausnummer"
              />
            </div>
            <div class="field">
              <label>{{ t.postalCode || 'PLZ' }}</label>
              <input [(ngModel)]="sellerForm.plz" name="sellerPlz" />
            </div>
            <div class="field">
              <label>{{ t.city || 'Stadt' }}</label>
              <input [(ngModel)]="sellerForm.stadt" name="sellerStadt" />
            </div>
            <div class="field">
              <label>{{ t.phone || 'Telefon' }}</label>
              <input [(ngModel)]="sellerForm.telefon" name="sellerTelefon" />
            </div>
            <div class="field">
              <label>{{ t.email || 'E-Mail' }}</label>
              <input [(ngModel)]="sellerForm.email" name="sellerEmail" />
            </div>
          </div>
        </div>

        <!-- Right: Purchase Documents (Alış Fotoğrafları) -->
        <div class="edit-card" *ngIf="purchase">
          <h2>📷 {{ t.purchasePhotos }}</h2>
          <p class="doc-hint">{{ t.purchasePhotosHint }}</p>
          <div class="doc-upload">
            <input
              type="file"
              #purchaseFileInput
              (change)="uploadPurchaseFile($event)"
              accept="image/*"
              multiple
              style="display: none"
            />
            <button
              class="btn btn-sm btn-outline"
              (click)="purchaseFileInput.click()"
            >
              + {{ t.addPhotos || 'Fotos hinzufügen' }}
            </button>
          </div>
          <div class="gallery-grid" *ngIf="purchaseDocuments.length > 0">
            <div class="gallery-thumb" *ngFor="let doc of purchaseDocuments">
              <img [src]="getDocumentUrl(doc)" [alt]="doc.fileName" />
              <div class="thumb-actions">
                <button
                  class="btn btn-sm btn-outline"
                  (click)="downloadDoc(doc)"
                >
                  ↓
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  (click)="deleteDoc(doc, 'purchase')"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
          <p *ngIf="purchaseDocuments.length === 0" class="empty">
            {{ t.noPhotos || 'Keine Fotos' }}
          </p>
        </div>

        <!-- Right: Gallery Images (Verkauf Fotos für Website) -->
        <div class="edit-card">
          <h2>📷 {{ t.galleryPhotos || 'Verkauf Fotos' }}</h2>
          <p class="doc-hint">
            {{ t.galleryPhotosHint || 'Fotos für die Website-Galerie' }}
          </p>
          <div class="doc-upload">
            <input
              type="file"
              #galleryFileInput
              (change)="uploadGalleryFile($event)"
              accept="image/*"
              multiple
              style="display: none"
            />
            <button
              class="btn btn-sm btn-outline"
              (click)="galleryFileInput.click()"
            >
              + {{ t.addPhotos || 'Fotos hinzufügen' }}
            </button>
          </div>
          <div class="gallery-grid" *ngIf="galleryImages.length > 0">
            <div class="gallery-thumb" *ngFor="let img of galleryImages">
              <img [src]="getGalleryImageUrl(img)" [alt]="img.filePath" />
              <div class="thumb-actions">
                <button
                  class="btn btn-sm btn-danger"
                  (click)="deleteGalleryImage(img)"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
          <p *ngIf="galleryImages.length === 0" class="empty">
            {{ t.noPhotos || 'Keine Fotos' }}
          </p>
        </div>
      </div>

      <!-- Bottom save bar -->
      <div class="save-bar">
        <a routerLink="/bicycles" class="btn btn-outline">{{ t.cancel }}</a>
        <button
          class="btn btn-primary btn-lg"
          (click)="save()"
          [disabled]="submitting"
        >
          {{ submitting ? '...' : t.save }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 960px;
        margin: 0 auto;
        padding-bottom: 90px;
        animation: fadeIn 0.3s ease;
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
        flex-wrap: wrap;
        gap: 10px;
      }
      .page-header h1 {
        font-size: 1.4rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      .header-actions {
        display: flex;
        gap: 8px;
      }
      .edit-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      .edit-grid > .edit-card:first-child {
        grid-column: 1 / -1;
      }
      @media (max-width: 768px) {
        .edit-grid {
          grid-template-columns: 1fr;
        }
      }
      .edit-card {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 24px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
      }
      .edit-card h2 {
        font-size: 1.05rem;
        font-weight: 700;
        margin-bottom: 16px;
        color: var(--text-primary);
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .field-full {
        grid-column: 1 / -1;
      }
      @media (max-width: 480px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
      .field {
        display: flex;
        flex-direction: column;
      }
      .field label {
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
        box-sizing: border-box;
      }
      .field input:focus,
      .field select:focus,
      .field textarea:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }
      .readonly-field {
        background: var(--table-hover, #f1f5f9) !important;
        cursor: default;
        color: var(--text-secondary, #64748b) !important;
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

      /* Sub heading */
      .sub-heading {
        font-size: 0.95rem;
        font-weight: 700;
        margin-top: 18px;
        margin-bottom: 12px;
        color: var(--text-primary);
        padding-top: 14px;
        border-top: 1.5px solid var(--border-light, #e2e8f0);
      }

      /* Documents */
      .doc-upload {
        margin-bottom: 12px;
      }
      .doc-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
      }
      .doc-name {
        font-size: 0.88rem;
        color: var(--text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 200px;
      }
      .doc-actions {
        display: flex;
        gap: 4px;
      }
      .empty {
        color: var(--text-secondary, #64748b);
        font-style: italic;
        font-size: 0.88rem;
      }

      /* Save bar */
      .save-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--bg-primary, #fff);
        border-top: 1.5px solid var(--border-light, #e2e8f0);
        padding: 14px 24px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        z-index: 100;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
      }

      /* ── Buttons ── */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        font-size: 0.88rem;
        cursor: pointer;
        border: 1.5px solid transparent;
        transition: all 0.15s;
        text-decoration: none;
        color: var(--text-primary);
        background: var(--bg-primary, #fff);
      }
      .btn-outline {
        border-color: var(--border-light, #e2e8f0);
      }
      .btn-outline:hover {
        border-color: var(--accent-primary, #6366f1);
        color: var(--accent-primary, #6366f1);
      }
      .btn-primary {
        background: var(--accent-primary, #6366f1);
        color: #fff;
        border-color: var(--accent-primary, #6366f1);
      }
      .btn-primary:hover {
        opacity: 0.9;
      }
      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn-danger {
        background: var(--accent-danger, #ef4444);
        color: #fff;
        border-color: var(--accent-danger, #ef4444);
      }
      .btn-sm {
        padding: 5px 12px;
        font-size: 0.8rem;
      }
      .btn-lg {
        padding: 12px 28px;
        font-size: 1rem;
      }

      .doc-hint {
        font-size: 0.8rem;
        color: var(--text-secondary, #64748b);
        margin: -4px 0 12px;
      }
      .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 10px;
        margin-top: 8px;
      }
      .gallery-thumb {
        position: relative;
        border-radius: 10px;
        overflow: hidden;
        aspect-ratio: 1;
        border: 1px solid var(--border-light, #e2e8f0);
      }
      .gallery-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .thumb-actions {
        position: absolute;
        bottom: 4px;
        right: 4px;
        display: flex;
        gap: 4px;
      }
      .thumb-actions .btn {
        padding: 2px 6px;
        font-size: 0.7rem;
        border-radius: 6px;
        min-width: 0;
      }
    `,
  ],
})
export class BicycleDetailComponent implements OnInit {
  private translationService = inject(TranslationService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  bicycle: Bicycle | null = null;
  purchase: Purchase | null = null;
  documents: DocModel[] = [];
  purchaseDocuments: DocModel[] = [];
  galleryImages: BicycleImage[] = [];
  submitting = false;
  BikeCondition = BikeCondition;

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

  form: BicycleUpdate = {
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

  purchaseForm = {
    preis: 0,
    verkaufspreisVorschlag: null as number | null,
    zahlungsart: 'Bar' as string,
    kaufdatum: '',
    notizen: '',
    belegNummer: '',
    anzeigeNr: '',
  };

  sellerForm: CustomerUpdate = {
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

  get t() {
    return this.translationService.translations();
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bicycleService: BicycleService,
    private purchaseService: PurchaseService,
    private documentService: DocumentService,
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.bicycleService.getById(id).subscribe((b) => {
      this.bicycle = b;
      this.form = {
        marke: b.marke,
        modell: b.modell,
        rahmennummer: b.rahmennummer,
        rahmengroesse: b.rahmengroesse,
        farbe: b.farbe,
        reifengroesse: b.reifengroesse,
        stokNo: b.stokNo,
        fahrradtyp: b.fahrradtyp,
        art: b.art || '',
        beschreibung: b.beschreibung,
        status: b.status,
        zustand: b.zustand,
        verkaufspreisVorschlag: b.verkaufspreisVorschlag,
      };
    });

    // Load purchase data for this bicycle
    this.purchaseService.getByBicycleId(id).subscribe({
      next: (p) => {
        this.purchase = p;
        this.purchaseForm = {
          preis: p.preis,
          verkaufspreisVorschlag: p.verkaufspreisVorschlag ?? null,
          zahlungsart: p.zahlungsart,
          kaufdatum: p.kaufdatum ? p.kaufdatum.substring(0, 10) : '',
          notizen: p.notizen || '',
          belegNummer: p.belegNummer || '',
          anzeigeNr: p.anzeigeNr || '',
        };
        if (p.seller) {
          this.sellerForm = {
            vorname: p.seller.vorname,
            nachname: p.seller.nachname,
            strasse: p.seller.strasse || '',
            hausnummer: p.seller.hausnummer || '',
            plz: p.seller.plz || '',
            stadt: p.seller.stadt || '',
            telefon: p.seller.telefon || '',
            email: p.seller.email || '',
            steuernummer: p.seller.steuernummer || '',
          };
        }
        // Load purchase documents
        this.documentService
          .getByPurchaseId(p.id)
          .subscribe((docs) => (this.purchaseDocuments = docs));
      },
      error: () => {
        // No purchase found for this bicycle - that's ok
        this.purchase = null;
      },
    });

    this.documentService
      .getByBicycleId(id)
      .subscribe((docs) => (this.documents = docs));

    // Load gallery images for this bicycle
    this.bicycleService.getGallery(id).subscribe({
      next: (images) => {
        this.galleryImages = images;
      },
      error: () => {
        this.galleryImages = [];
      },
    });
  }

  save() {
    if (!this.form.marke?.trim()) {
      this.notificationService.error('Marke ist erforderlich');
      return;
    }
    this.submitting = true;

    // Save bicycle data
    this.bicycleService.update(this.bicycle!.id, this.form).subscribe({
      next: () => {
        // If there's a purchase, save it too
        if (this.purchase) {
          const purchaseUpdate: PurchaseUpdate = {
            bicycle: this.form,
            seller: this.sellerForm,
            preis: this.purchaseForm.preis,
            verkaufspreisVorschlag:
              this.purchaseForm.verkaufspreisVorschlag || undefined,
            zahlungsart: this.purchaseForm.zahlungsart as PaymentMethod,
            kaufdatum: this.purchaseForm.kaufdatum,
            notizen: this.purchaseForm.notizen || undefined,
            belegNummer: this.purchaseForm.belegNummer || undefined,
            anzeigeNr: this.purchaseForm.anzeigeNr || undefined,
          };
          this.purchaseService
            .update(this.purchase.id, purchaseUpdate)
            .subscribe({
              next: () => {
                this.notificationService.success(this.t.saveSuccess);
                this.router.navigate(['/bicycles']);
              },
              error: (err) => {
                this.submitting = false;
                this.notificationService.error(
                  err.error?.error || this.t.saveError,
                );
              },
            });
        } else {
          this.notificationService.success(this.t.saveSuccess);
          this.router.navigate(['/bicycles']);
        }
      },
      error: (err) => {
        this.submitting = false;
        this.notificationService.error(err.error?.error || this.t.saveError);
      },
    });
  }

  uploadFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.documentService
      .upload(file, 'Image', this.bicycle!.id)
      .subscribe(() => {
        this.documentService
          .getByBicycleId(this.bicycle!.id)
          .subscribe((docs) => (this.documents = docs));
      });
  }

  uploadPurchaseFile(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0 || !this.purchase) return;
    let remaining = files.length;
    for (let i = 0; i < files.length; i++) {
      this.documentService
        .upload(files[i], 'Screenshot', undefined, this.purchase.id, undefined)
        .subscribe(() => {
          remaining--;
          if (remaining === 0) {
            this.documentService
              .getByPurchaseId(this.purchase!.id)
              .subscribe((docs) => (this.purchaseDocuments = docs));
          }
        });
    }
  }

  uploadGalleryFile(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0 || !this.bicycle) return;
    let remaining = files.length;
    for (let i = 0; i < files.length; i++) {
      this.bicycleService
        .uploadGalleryImage(this.bicycle.id, files[i])
        .subscribe(() => {
          remaining--;
          if (remaining === 0) {
            this.bicycleService
              .getGallery(this.bicycle!.id)
              .subscribe((images) => (this.galleryImages = images));
          }
        });
    }
  }

  getGalleryImageUrl(img: BicycleImage): string {
    return `${environment.apiUrl}/public/gallery-image/${img.filePath}`;
  }

  deleteGalleryImage(img: BicycleImage) {
    this.dialogService
      .danger(this.t.delete, this.t.deleteConfirmDocument)
      .then((confirmed) => {
        if (confirmed && this.bicycle) {
          this.bicycleService.deleteGalleryImage(this.bicycle.id, img.id).subscribe({
            next: () => {
              this.notificationService.success(this.t.deleteSuccess);
              this.galleryImages = this.galleryImages.filter((i) => i.id !== img.id);
            },
            error: (err) => {
              this.notificationService.error(
                err.error?.error || this.t.deleteError,
              );
            },
          });
        }
      });
  }

  getDocumentUrl(doc: DocModel): string {
    return `${environment.apiUrl}/documents/${doc.id}/download`;
  }

  downloadDoc(doc: DocModel) {
    this.documentService.download(doc.id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  deleteDoc(
    doc: DocModel,
    source: 'bicycle' | 'purchase' = 'bicycle',
  ) {
    this.dialogService
      .danger(this.t.delete, this.t.deleteConfirmDocument)
      .then((confirmed) => {
        if (confirmed) {
          this.documentService.delete(doc.id).subscribe({
            next: () => {
              this.notificationService.success(this.t.deleteSuccess);
              if (source === 'purchase') {
                this.purchaseDocuments = this.purchaseDocuments.filter(
                  (d) => d.id !== doc.id,
                );
              } else {
                this.documents = this.documents.filter((d) => d.id !== doc.id);
              }
            },
            error: (err) => {
              this.notificationService.error(
                err.error?.error || this.t.deleteError,
              );
            },
          });
        }
      });
  }
}
