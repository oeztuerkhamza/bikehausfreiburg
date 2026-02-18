import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SaleService } from '../../services/sale.service';
import {
  Sale,
  SaleUpdate,
  PaymentMethod,
  SaleAccessoryCreate,
  AccessoryCatalogList,
} from '../../models/models';
import { AddressAutocompleteComponent } from '../../components/address-autocomplete/address-autocomplete.component';
import { AccessoryAutocompleteComponent } from '../../components/accessory-autocomplete/accessory-autocomplete.component';
import { AddressSuggestion } from '../../services/address.service';

@Component({
  selector: 'app-sale-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AddressAutocompleteComponent,
    AccessoryAutocompleteComponent,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Verkauf bearbeiten</h1>
        <a routerLink="/sales" class="btn btn-outline">Zurück</a>
      </div>

      <div *ngIf="loading" class="loading">Laden...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <form *ngIf="sale && !loading" (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Bicycle info (read-only) -->
          <div class="form-card">
            <h2>Fahrrad</h2>
            <div class="bike-info" *ngIf="sale.bicycle">
              <div class="info-row">
                <span class="label">Marke/Modell:</span>
                <span>{{ sale.bicycle.marke }} {{ sale.bicycle.modell }}</span>
              </div>
              <div class="info-row">
                <span class="label">Rahmennummer:</span>
                <span>{{ sale.bicycle.rahmennummer }}</span>
              </div>
              <div class="info-row">
                <span class="label">Farbe:</span>
                <span>{{ sale.bicycle.farbe }}</span>
              </div>
              <div class="info-row" *ngIf="sale.bicycle.zustand">
                <span class="label">Zustand:</span>
                <span
                  class="badge"
                  [class.badge-new]="sale.bicycle.zustand === 'Neu'"
                >
                  {{ sale.bicycle.zustand }}
                </span>
              </div>
            </div>
            <p class="hint">Das Fahrrad kann nicht geändert werden.</p>
          </div>

          <!-- Buyer info -->
          <div class="form-card">
            <h2>Käufer</h2>
            <div class="form-grid">
              <div class="field">
                <label>Vorname *</label>
                <input
                  [(ngModel)]="buyer.vorname"
                  name="buyerVorname"
                  required
                />
              </div>
              <div class="field">
                <label>Nachname *</label>
                <input
                  [(ngModel)]="buyer.nachname"
                  name="buyerNachname"
                  required
                />
              </div>
              <div class="field full">
                <label>Adresse suchen</label>
                <app-address-autocomplete
                  placeholder="z.B. Bissierstraße 16, Freiburg"
                  (addressSelected)="onBuyerAddressSelected($event)"
                ></app-address-autocomplete>
                <small class="hint"
                  >Tippen Sie eine Adresse ein für Vorschläge</small
                >
              </div>
              <div class="field">
                <label>Straße</label>
                <input [(ngModel)]="buyer.strasse" name="buyerStrasse" />
              </div>
              <div class="field">
                <label>Hausnummer</label>
                <input [(ngModel)]="buyer.hausnummer" name="buyerHausnr" />
              </div>
              <div class="field">
                <label>PLZ</label>
                <input [(ngModel)]="buyer.plz" name="buyerPlz" />
              </div>
              <div class="field">
                <label>Stadt</label>
                <input [(ngModel)]="buyer.stadt" name="buyerStadt" />
              </div>
              <div class="field">
                <label>Telefon</label>
                <input [(ngModel)]="buyer.telefon" name="buyerTel" />
              </div>
              <div class="field">
                <label>E-Mail</label>
                <input
                  type="email"
                  [(ngModel)]="buyer.email"
                  name="buyerEmail"
                />
              </div>
            </div>
          </div>

          <!-- Sale details -->
          <div class="form-card">
            <h2>Verkaufsdaten</h2>
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
                <label>Zahlungsart *</label>
                <select [(ngModel)]="zahlungsart" name="zahlungsart" required>
                  <option value="Bar">Bar</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Ueberweisung">Überweisung</option>
                </select>
              </div>
              <div class="field">
                <label>Verkaufsdatum *</label>
                <input
                  type="date"
                  [(ngModel)]="verkaufsdatum"
                  name="verkaufsdatum"
                  required
                />
              </div>
              <div class="field">
                <label>Garantie</label>
                <div class="warranty-display">
                  {{ garantieBedingungen }}
                </div>
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

          <!-- Accessories -->
          <div class="form-card">
            <h2>Zubehör</h2>

            <!-- Autocomplete to add from catalog -->
            <div class="field" style="margin-bottom: 16px;">
              <label>Zubehör aus Katalog hinzufügen</label>
              <app-accessory-autocomplete
                placeholder="Zubehör suchen..."
                (itemSelected)="addAccessoryFromCatalog($event)"
              ></app-accessory-autocomplete>
            </div>

            <div class="accessories-list" *ngIf="accessories.length > 0">
              <div
                class="accessory-item"
                *ngFor="let acc of accessories; let i = index"
              >
                <div class="accessory-fields">
                  <div class="field">
                    <label>Bezeichnung</label>
                    <input
                      [(ngModel)]="acc.bezeichnung"
                      [name]="'accBez' + i"
                      placeholder="z.B. Fahrradschloss"
                      required
                    />
                  </div>
                  <div class="field">
                    <label>Preis (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      [(ngModel)]="acc.preis"
                      [name]="'accPreis' + i"
                      required
                    />
                  </div>
                  <div class="field">
                    <label>Menge</label>
                    <input
                      type="number"
                      min="1"
                      [(ngModel)]="acc.menge"
                      [name]="'accMenge' + i"
                      required
                    />
                  </div>
                  <div class="field accessory-total">
                    <label>Gesamt</label>
                    <span class="total-value"
                      >{{ acc.preis * acc.menge | number: '1.2-2' }} €</span
                    >
                  </div>
                  <button
                    type="button"
                    class="btn btn-icon btn-danger"
                    (click)="removeAccessory(i)"
                    title="Entfernen"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            <div class="accessory-summary" *ngIf="accessories.length > 0">
              <span>Zubehör Summe:</span>
              <strong>{{ accessoriesTotal | number: '1.2-2' }} €</strong>
            </div>

            <button
              type="button"
              class="btn btn-outline btn-sm"
              (click)="addAccessory()"
            >
              + Manuell hinzufügen
            </button>

            <div class="grand-total" *ngIf="preis > 0">
              <div class="total-row">
                <span>Fahrradpreis:</span>
                <span>{{ preis | number: '1.2-2' }} €</span>
              </div>
              <div class="total-row" *ngIf="accessories.length > 0">
                <span>Zubehör:</span>
                <span>{{ accessoriesTotal | number: '1.2-2' }} €</span>
              </div>
              <div class="total-row grand">
                <span>Gesamtbetrag:</span>
                <strong
                  >{{ preis + accessoriesTotal | number: '1.2-2' }} €</strong
                >
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
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .loading,
      .error {
        text-align: center;
        padding: 40px;
        font-size: 1.1rem;
      }
      .error {
        color: #dc3545;
      }
      .form-sections {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .form-card {
        background: #fff;
        border-radius: 10px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
      .form-card h2 {
        font-size: 1.1rem;
        margin-bottom: 16px;
        color: #1a1a2e;
      }
      .bike-info {
        background: #f8f9fa;
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 12px;
      }
      .info-row {
        display: flex;
        gap: 12px;
        padding: 4px 0;
      }
      .info-row .label {
        font-weight: 500;
        color: #666;
        min-width: 140px;
      }
      .badge {
        display: inline-block;
        padding: 2px 8px;
        background: #d4edda;
        color: #155724;
        border-radius: 4px;
        font-size: 0.85rem;
      }
      .badge.badge-new {
        background: #cce5ff;
        color: #004085;
      }
      .hint {
        font-size: 0.85rem;
        color: #666;
        font-style: italic;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      @media (max-width: 600px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
      .field label {
        display: block;
        font-size: 0.8rem;
        color: #777;
        margin-bottom: 4px;
      }
      .field input,
      .field select,
      .field textarea {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.95rem;
      }
      .field.full {
        grid-column: 1 / -1;
      }
      .warranty-display {
        padding: 8px 10px;
        background: #f0f4f8;
        border-radius: 6px;
        font-size: 0.9rem;
        color: #333;
      }
      .form-actions {
        margin-top: 24px;
        text-align: right;
      }
      .btn-lg {
        padding: 12px 32px;
        font-size: 1.05rem;
      }
      .accessories-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
      }
      .accessory-item {
        background: #f8f9fa;
        padding: 12px;
        border-radius: 8px;
      }
      .accessory-fields {
        display: flex;
        gap: 10px;
        align-items: flex-end;
        flex-wrap: wrap;
      }
      .accessory-fields .field {
        flex: 1;
        min-width: 100px;
      }
      .accessory-fields .field input {
        padding: 6px 8px;
      }
      .accessory-total {
        display: flex;
        align-items: center;
      }
      .total-value {
        font-weight: 600;
        color: #1a1a2e;
        padding: 6px 8px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 6px;
      }
      .btn-icon {
        width: 32px;
        height: 32px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        font-size: 14px;
        flex-shrink: 0;
      }
      .btn-danger {
        background: #dc3545;
        color: white;
        border: none;
      }
      .btn-sm {
        padding: 8px 16px;
        font-size: 0.85rem;
      }
      .accessory-summary {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        background: #e9ecef;
        border-radius: 6px;
        margin-bottom: 16px;
      }
      .grand-total {
        margin-top: 16px;
        padding: 16px;
        background: #f0f4f8;
        border-radius: 8px;
        border: 2px solid #e2e8f0;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
      }
      .total-row.grand {
        border-top: 1px solid #ccc;
        padding-top: 8px;
        margin-top: 8px;
        font-size: 1.1rem;
      }
    `,
  ],
})
export class SaleEditComponent implements OnInit {
  sale: Sale | null = null;
  loading = true;
  error = '';
  submitting = false;

  buyer = {
    vorname: '',
    nachname: '',
    strasse: '',
    hausnummer: '',
    plz: '',
    stadt: '',
    telefon: '',
    email: '',
  };

  preis = 0;
  zahlungsart: PaymentMethod = PaymentMethod.Bar;
  verkaufsdatum = '';
  notizen = '';
  garantie = true;
  garantieBedingungen = '';
  accessories: SaleAccessoryCreate[] = [];

  get accessoriesTotal(): number {
    return this.accessories.reduce(
      (sum, acc) => sum + acc.preis * acc.menge,
      0,
    );
  }

  constructor(
    private saleService: SaleService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Ungültige Verkauf-ID';
      this.loading = false;
      return;
    }

    this.saleService.getById(+id).subscribe({
      next: (sale) => {
        this.sale = sale;
        this.loadFormData(sale);
        this.loading = false;
      },
      error: () => {
        this.error = 'Verkauf nicht gefunden';
        this.loading = false;
      },
    });
  }

  private loadFormData(sale: Sale) {
    // Load buyer data
    if (sale.buyer) {
      this.buyer = {
        vorname: sale.buyer.vorname || '',
        nachname: sale.buyer.nachname || '',
        strasse: sale.buyer.strasse || '',
        hausnummer: sale.buyer.hausnummer || '',
        plz: sale.buyer.plz || '',
        stadt: sale.buyer.stadt || '',
        telefon: sale.buyer.telefon || '',
        email: sale.buyer.email || '',
      };
    }

    // Load sale data
    this.preis = sale.preis;
    this.zahlungsart = sale.zahlungsart as PaymentMethod;
    this.verkaufsdatum = sale.verkaufsdatum
      ? new Date(sale.verkaufsdatum).toISOString().split('T')[0]
      : '';
    this.notizen = sale.notizen || '';
    this.garantie = sale.garantie;
    this.garantieBedingungen = sale.garantieBedingungen || '';

    // Load accessories
    if (sale.accessories && sale.accessories.length > 0) {
      this.accessories = sale.accessories.map((acc) => ({
        bezeichnung: acc.bezeichnung,
        preis: acc.preis,
        menge: acc.menge,
      }));
    }
  }

  onBuyerAddressSelected(address: AddressSuggestion) {
    this.buyer.strasse = address.strasse;
    this.buyer.hausnummer = address.hausnummer;
    this.buyer.plz = address.plz;
    this.buyer.stadt = address.stadt;
  }

  addAccessory() {
    this.accessories.push({
      bezeichnung: '',
      preis: 0,
      menge: 1,
    });
  }

  addAccessoryFromCatalog(item: AccessoryCatalogList) {
    this.accessories.push({
      bezeichnung: item.bezeichnung,
      preis: item.standardpreis,
      menge: 1,
    });
  }

  removeAccessory(index: number) {
    this.accessories.splice(index, 1);
  }

  submit() {
    if (!this.sale) return;
    this.submitting = true;

    const update: SaleUpdate = {
      buyer: this.buyer,
      preis: this.preis,
      zahlungsart: this.zahlungsart,
      verkaufsdatum: this.verkaufsdatum,
      garantie: this.garantie,
      garantieBedingungen: this.garantieBedingungen || undefined,
      notizen: this.notizen || undefined,
      accessories:
        this.accessories.length > 0
          ? this.accessories.filter((a) => a.bezeichnung && a.preis > 0)
          : undefined,
    };

    this.saleService.update(this.sale.id, update).subscribe({
      next: () => {
        this.router.navigate(['/sales']);
      },
      error: () => {
        this.submitting = false;
        alert('Fehler beim Speichern der Änderungen');
      },
    });
  }
}
