import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PurchaseService } from '../../services/purchase.service';
import {
  Purchase,
  PurchaseUpdate,
  PaymentMethod,
  BikeCondition,
  BikeStatus,
} from '../../models/models';
import { AddressAutocompleteComponent } from '../../components/address-autocomplete/address-autocomplete.component';
import { AddressSuggestion } from '../../services/address.service';

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
        <h1>Ankauf bearbeiten</h1>
        <a routerLink="/purchases" class="btn btn-outline">Zurück</a>
      </div>

      <div *ngIf="loading" class="loading">Laden...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <form *ngIf="purchase && !loading" (ngSubmit)="submit()" #f="ngForm">
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
                />
              </div>
              <div class="field">
                <label>Nachname *</label>
                <input
                  [(ngModel)]="seller.nachname"
                  name="sellerNachname"
                  required
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
                <label>Farbe *</label>
                <input [(ngModel)]="bicycle.farbe" name="bikeFarbe" required />
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
                <label>Stok Nr.</label>
                <input
                  [(ngModel)]="bicycle.stokNo"
                  name="bikeStokNo"
                  placeholder="optional"
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
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            [disabled]="submitting"
          >
            {{ submitting ? 'Wird gespeichert...' : 'Änderungen speichern' }}
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
      .form-actions {
        margin-top: 24px;
        text-align: right;
      }
      .btn-lg {
        padding: 12px 32px;
        font-size: 1.05rem;
      }
    `,
  ],
})
export class PurchaseEditComponent implements OnInit {
  purchase: Purchase | null = null;
  loading = true;
  error = '';
  submitting = false;

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
    status: BikeStatus.Available,
    zustand: BikeCondition.Gebraucht,
  };

  preis = 0;
  verkaufspreisVorschlag: number | null = null;
  zahlungsart: PaymentMethod = PaymentMethod.Bar;
  kaufdatum = '';
  notizen = '';

  constructor(
    private purchaseService: PurchaseService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Ungültige Ankauf-ID';
      this.loading = false;
      return;
    }

    this.purchaseService.getById(+id).subscribe({
      next: (purchase) => {
        this.purchase = purchase;
        this.loadFormData(purchase);
        this.loading = false;
      },
      error: () => {
        this.error = 'Ankauf nicht gefunden';
        this.loading = false;
      },
    });
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
      };
    }

    // Load bicycle data
    if (purchase.bicycle) {
      this.bicycle = {
        marke: purchase.bicycle.marke || '',
        modell: purchase.bicycle.modell || '',
        rahmennummer: purchase.bicycle.rahmennummer || '',
        farbe: purchase.bicycle.farbe || '',
        reifengroesse: purchase.bicycle.reifengroesse || '',
        stokNo: purchase.bicycle.stokNo || '',
        fahrradtyp: purchase.bicycle.fahrradtyp || '',
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
    };

    this.purchaseService.update(this.purchase.id, update).subscribe({
      next: () => {
        this.router.navigate(['/purchases']);
      },
      error: () => {
        this.submitting = false;
        alert('Fehler beim Speichern der Änderungen');
      },
    });
  }
}
