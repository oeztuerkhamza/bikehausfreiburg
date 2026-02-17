import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Customer, CustomerCreate, CustomerUpdate } from '../../models/models';
import { AddressAutocompleteComponent } from '../../components/address-autocomplete/address-autocomplete.component';
import { AddressSuggestion } from '../../services/address.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AddressAutocompleteComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Kundenverwaltung</h1>
        <button class="btn btn-primary" (click)="showForm = !showForm">
          {{ showForm ? 'Abbrechen' : '+ Neuer Kunde' }}
        </button>
      </div>

      <!-- Create / Edit form -->
      <div class="form-card" *ngIf="showForm">
        <h2>{{ editId ? 'Kunde bearbeiten' : 'Neuer Kunde' }}</h2>
        <div class="form-grid">
          <div class="field">
            <label>Vorname *</label>
            <input [(ngModel)]="form.vorname" required />
          </div>
          <div class="field">
            <label>Nachname *</label>
            <input [(ngModel)]="form.nachname" required />
          </div>
          <div class="field full">
            <label>Adresse suchen</label>
            <app-address-autocomplete
              placeholder="z.B. Bissierstraße 16, Freiburg"
              [initialValue]="getAddressInitialValue()"
              (addressSelected)="onAddressSelected($event)"
            ></app-address-autocomplete>
            <small class="hint"
              >Tippen Sie eine Adresse ein für Vorschläge</small
            >
          </div>
          <div class="field">
            <label>Straße</label>
            <input [(ngModel)]="form.strasse" />
          </div>
          <div class="field">
            <label>Hausnummer</label>
            <input [(ngModel)]="form.hausnummer" />
          </div>
          <div class="field">
            <label>PLZ</label>
            <input [(ngModel)]="form.plz" />
          </div>
          <div class="field">
            <label>Stadt</label>
            <input [(ngModel)]="form.stadt" />
          </div>
          <div class="field">
            <label>Telefon</label>
            <input [(ngModel)]="form.telefon" />
          </div>
          <div class="field">
            <label>E-Mail</label>
            <input type="email" [(ngModel)]="form.email" />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" (click)="saveCustomer()">
            {{ editId ? 'Aktualisieren' : 'Anlegen' }}
          </button>
        </div>
      </div>

      <div class="filters">
        <input
          type="text"
          placeholder="Suche nach Name, E-Mail, Telefon..."
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
          class="search-input"
        />
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Adresse</th>
              <th>Telefon</th>
              <th>E-Mail</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of customers">
              <td>{{ c.fullName }}</td>
              <td>{{ c.fullAddress || '–' }}</td>
              <td>{{ c.telefon || '–' }}</td>
              <td>{{ c.email || '–' }}</td>
              <td class="actions">
                <button
                  class="btn btn-sm btn-outline"
                  (click)="editCustomer(c)"
                >
                  ✎
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  (click)="deleteCustomer(c)"
                >
                  ×
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="customers.length === 0" class="empty">
          Keine Kunden gefunden
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1200px;
        margin: 0 auto;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .form-card {
        background: #fff;
        border-radius: 10px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
      .form-card h2 {
        margin-bottom: 16px;
        font-size: 1.1rem;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .field label {
        display: block;
        font-size: 0.8rem;
        color: #777;
        margin-bottom: 4px;
      }
      .field input {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.95rem;
      }
      .field.full {
        grid-column: 1 / -1;
      }
      .field .hint {
        display: block;
        font-size: 0.75rem;
        color: #888;
        margin-top: 4px;
      }
      .form-actions {
        margin-top: 16px;
      }
      .filters {
        margin-bottom: 16px;
      }
      .search-input {
        width: 100%;
        max-width: 400px;
        padding: 10px 14px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.95rem;
      }
      .table-container {
        background: #fff;
        border-radius: 10px;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        padding: 10px 8px;
        border-bottom: 2px solid #eee;
        font-size: 0.85rem;
        color: #555;
      }
      td {
        padding: 10px 8px;
        border-bottom: 1px solid #f0f0f0;
      }
      .mono {
        font-family: monospace;
      }
      .actions {
        display: flex;
        gap: 6px;
      }
      .empty {
        text-align: center;
        color: #999;
        padding: 40px;
      }
    `,
  ],
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  showForm = false;
  editId: number | null = null;
  searchTerm = '';
  form: CustomerCreate = { vorname: '', nachname: '' };

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.customerService.getAll().subscribe((data) => (this.customers = data));
  }

  onSearch() {
    if (this.searchTerm.length >= 2) {
      this.customerService
        .search(this.searchTerm)
        .subscribe((data) => (this.customers = data));
    } else if (this.searchTerm.length === 0) {
      this.load();
    }
  }

  editCustomer(c: Customer) {
    this.editId = c.id;
    this.form = {
      vorname: c.vorname,
      nachname: c.nachname,
      strasse: c.strasse,
      hausnummer: c.hausnummer,
      plz: c.plz,
      stadt: c.stadt,
      telefon: c.telefon,
      email: c.email,
    };
    this.showForm = true;
  }

  onAddressSelected(address: AddressSuggestion) {
    this.form.strasse = address.strasse;
    this.form.hausnummer = address.hausnummer;
    this.form.plz = address.plz;
    this.form.stadt = address.stadt;
  }

  getAddressInitialValue(): string {
    if (this.form.strasse) {
      return `${this.form.strasse} ${this.form.hausnummer || ''}`.trim();
    }
    return '';
  }

  saveCustomer() {
    if (!this.form.vorname || !this.form.nachname) return;
    if (this.editId) {
      this.customerService
        .update(this.editId, this.form as CustomerUpdate)
        .subscribe(() => {
          this.resetForm();
          this.load();
        });
    } else {
      this.customerService.create(this.form).subscribe(() => {
        this.resetForm();
        this.load();
      });
    }
  }

  deleteCustomer(c: Customer) {
    if (confirm(`Kunde "${c.fullName}" wirklich löschen?`)) {
      this.customerService.delete(c.id).subscribe({
        next: () => this.load(),
        error: (err) =>
          alert(err.error?.error || 'Fehler beim Löschen des Kunden'),
      });
    }
  }

  private resetForm() {
    this.form = { vorname: '', nachname: '' };
    this.editId = null;
    this.showForm = false;
  }
}
