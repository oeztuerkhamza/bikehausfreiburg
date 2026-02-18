import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { ExcelExportService } from '../../services/excel-export.service';
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
        <div class="header-actions">
          <button class="btn btn-outline" (click)="exportExcel()">
            📥 Excel Export
          </button>
          <button class="btn btn-primary" (click)="showForm = !showForm">
            {{ showForm ? 'Abbrechen' : '+ Neuer Kunde' }}
          </button>
        </div>
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
      .header-actions {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .form-card {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 24px;
        margin-bottom: 20px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
      }
      .form-card h2 {
        margin-bottom: 16px;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
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
      .field input {
        width: 100%;
        padding: 9px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        transition: var(--transition-fast);
      }
      .field input:focus {
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
        margin-top: 18px;
      }
      .filters {
        margin-bottom: 18px;
      }
      .search-input {
        width: 100%;
        max-width: 400px;
        padding: 10px 14px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        transition: var(--transition-fast);
      }
      .search-input:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }
      .table-container {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        padding: 10px 12px;
        background: var(--table-stripe, #f8fafc);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-secondary, #64748b);
        border-bottom: 1.5px solid var(--border-light, #e2e8f0);
      }
      td {
        padding: 10px 12px;
        font-size: 0.9rem;
        color: var(--text-primary);
        border-bottom: 1px solid var(--border-light, #e2e8f0);
      }
      tr:hover td {
        background: var(--table-hover, #f1f5f9);
      }
      .mono {
        font-family: 'SF Mono', 'Consolas', monospace;
        font-size: 0.82rem;
        color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        padding: 2px 8px;
        border-radius: 6px;
        font-weight: 600;
      }
      .actions {
        display: flex;
        gap: 6px;
      }
      .empty {
        text-align: center;
        color: var(--text-secondary, #64748b);
        padding: 48px 20px;
        font-size: 0.95rem;
      }
      .btn {
        padding: 8px 16px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        border: none;
        transition: var(--transition-fast);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
      }
      .btn-primary {
        background: var(--accent-primary, #6366f1);
        color: white;
      }
      .btn-primary:hover {
        background: var(--accent-primary-hover, #4f46e5);
        box-shadow: var(--shadow-sm);
      }
      .btn-outline {
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        border: 1.5px solid var(--border-light, #e2e8f0);
      }
      .btn-outline:hover {
        border-color: var(--accent-primary, #6366f1);
        color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.06));
      }
      .btn-sm {
        padding: 5px 10px;
        font-size: 0.82rem;
        border-radius: var(--radius-sm, 6px);
      }
      .btn-danger {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.08));
        color: var(--accent-danger, #ef4444);
        border: none;
      }
      .btn-danger:hover {
        background: rgba(239, 68, 68, 0.15);
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

  constructor(
    private customerService: CustomerService,
    private excelExportService: ExcelExportService,
  ) {}

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

  exportExcel() {
    this.excelExportService.exportToExcel(this.customers, 'Kunden', [
      { key: 'fullName', header: 'Name' },
      { key: 'strasse', header: 'Straße' },
      { key: 'hausnummer', header: 'Hausnummer' },
      { key: 'plz', header: 'PLZ' },
      { key: 'stadt', header: 'Stadt' },
      { key: 'telefon', header: 'Telefon' },
      { key: 'email', header: 'E-Mail' },
    ]);
  }

  private resetForm() {
    this.form = { vorname: '', nachname: '' };
    this.editId = null;
    this.showForm = false;
  }
}
