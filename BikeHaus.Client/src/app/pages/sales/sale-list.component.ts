import {
  Component,
  OnInit,
  inject,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SaleService } from '../../services/sale.service';
import { PurchaseService } from '../../services/purchase.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { TranslationService } from '../../services/translation.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import {
  SaleList,
  PaginatedResult,
  PurchaseCreateForExistingBike,
} from '../../models/models';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.sales }}</h1>
        <div class="header-actions">
          <a routerLink="/sales/new" class="btn btn-primary"
            >+ {{ t.newSale }}</a
          >
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filters">
        <div class="search-group">
          <input
            type="text"
            [(ngModel)]="searchText"
            (input)="onSearch()"
            [placeholder]="t.searchPlaceholder"
            class="filter-input search-input"
          />
          <span class="search-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>
        <button
          class="btn btn-outline filter-toggle"
          (click)="showFilters = !showFilters"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <polygon
              points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
            ></polygon>
          </svg>
          {{ t.filters }}
          <span *ngIf="activeFilterCount > 0" class="filter-badge">{{
            activeFilterCount
          }}</span>
        </button>
        <button
          *ngIf="activeFilterCount > 0"
          class="btn btn-outline"
          (click)="clearFilters()"
        >
          ✕ {{ t.clearFilters }}
        </button>
      </div>

      <div class="filter-row" *ngIf="showFilters">
        <div class="filter-item">
          <label>{{ t.paymentMethod }}</label>
          <select
            [(ngModel)]="filterPayment"
            (change)="onFilterChange()"
            class="filter-input"
          >
            <option value="">{{ t.allPaymentMethods }}</option>
            <option value="Bar">{{ t.cash }}</option>
            <option value="Karte">{{ t.bankTransfer }}</option>
            <option value="PayPal">{{ t.paypal }}</option>
            <option value="Überweisung">{{ t.wireTransfer }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label>{{ t.bicycleType }}</label>
          <select
            [(ngModel)]="filterFahrradtyp"
            (change)="onFilterChange()"
            class="filter-input"
          >
            <option value="">{{ t.allBicycleTypes }}</option>
            <option value="E-Bike">E-Bike</option>
            <option value="E-Trekking Pedelec">E-Trekking Pedelec</option>
            <option value="Trekking">Trekking</option>
            <option value="City">City</option>
            <option value="MTB">Mountainbike</option>
            <option value="Rennrad">Rennrad</option>
            <option value="Kinderfahrrad">Kinderfahrrad</option>
            <option value="Lastenrad">Lastenrad</option>
            <option value="Sonstige">Sonstige</option>
          </select>
        </div>
        <div class="filter-item">
          <label>{{ t.brand }}</label>
          <input
            type="text"
            [(ngModel)]="filterMarke"
            (input)="onFilterChange()"
            [placeholder]="t.filterByBrand"
            class="filter-input"
          />
        </div>
        <div class="filter-item">
          <label>{{ t.color }}</label>
          <input
            type="text"
            [(ngModel)]="filterFarbe"
            (input)="onFilterChange()"
            [placeholder]="t.filterByColor"
            class="filter-input"
          />
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t.receiptNo }}</th>
              <th>{{ t.bicycle }}</th>
              <th>{{ t.frameNumber }}</th>
              <th>{{ t.buyer }}</th>
              <th>{{ t.price }}</th>
              <th>{{ t.date }}</th>
              <th style="width: 50px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="paginatedResult?.items?.length === 0">
              <td
                colspan="7"
                style="text-align:center;padding:32px;color:var(--text-muted);"
              >
                {{ t.noSales }}
              </td>
            </tr>
            <tr
              *ngFor="let s of paginatedResult?.items"
              class="clickable-row"
              [class.row-with-purchase]="hasPurchase(s)"
              [class.row-new-bike]="isNewBikeSale(s)"
              [class.row-accessory]="isAccessoryOnlySale(s)"
              (click)="toggleMenu($event, s)"
            >
              <td class="mono">{{ s.belegNummer }}</td>
              <td>{{ s.bikeInfo }}</td>
              <td class="mono" style="text-transform: uppercase">
                {{
                  s.rahmennummer?.startsWith('ACC-')
                    ? '–'
                    : s.rahmennummer || '–'
                }}
              </td>
              <td>{{ s.buyerName }}</td>
              <td>{{ s.gesamtbetrag | number: '1.2-2' }} €</td>
              <td>{{ s.verkaufsdatum | date: 'dd.MM.yyyy' }}</td>
              <td class="actions-cell">
                <span class="action-icon">⋮</span>
                <div
                  *ngIf="activeMenuId === s.id"
                  class="popup-menu"
                  (click)="$event.stopPropagation()"
                >
                  <button class="popup-item" (click)="printPdf(s)">
                    <span class="popup-icon">🖨️</span>
                    {{ t.printDocument }}
                  </button>
                  <button class="popup-item" (click)="goToEdit(s)">
                    <span class="popup-icon">✏️</span>
                    {{ t.editDocument }}
                  </button>
                  <button class="popup-item" (click)="previewPdf(s)">
                    <span class="popup-icon">👁️</span>
                    {{ t.preview }}
                  </button>
                  <button class="popup-item" (click)="downloadPdf(s)">
                    <span class="popup-icon">⬇️</span>
                    {{ t.download }}
                  </button>
                  <button
                    class="popup-item"
                    *ngIf="canAddPurchase(s)"
                    (click)="openAddPurchaseDialog(s)"
                  >
                    <span class="popup-icon">🧾</span>
                    Ankauf detail hinzufügen
                  </button>
                  <div class="popup-divider"></div>
                  <button
                    class="popup-item popup-item-danger"
                    (click)="deleteSale(s)"
                  >
                    <span class="popup-icon">🗑️</span>
                    {{ t.delete }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <app-pagination
          *ngIf="paginatedResult && paginatedResult.totalCount > 0"
          [currentPage]="currentPage"
          [pageSize]="pageSize"
          [totalCount]="paginatedResult.totalCount"
          [totalPages]="paginatedResult.totalPages"
          [hasPrevious]="paginatedResult.hasPrevious"
          [hasNext]="paginatedResult.hasNext"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)"
        ></app-pagination>
      </div>

      <div
        class="purchase-dialog-backdrop"
        *ngIf="showAddPurchaseDialog"
        (click)="closeAddPurchaseDialog()"
      >
        <div class="purchase-dialog" (click)="$event.stopPropagation()">
          <h3>Ankauf detail hinzufügen</h3>
          <div class="form-grid">
            <div class="field">
              <label>Ankauf Beleg-Nr.</label>
              <input [(ngModel)]="purchaseDialog.belegNummer" />
            </div>
            <div class="field">
              <label>Preis (€) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                [(ngModel)]="purchaseDialog.preis"
              />
            </div>
            <div class="field full">
              <label>Datum *</label>
              <input type="date" [(ngModel)]="purchaseDialog.kaufdatum" />
            </div>
          </div>
          <div class="dialog-actions">
            <button class="btn btn-outline" (click)="closeAddPurchaseDialog()">
              Abbrechen
            </button>
            <button
              class="btn btn-primary"
              [disabled]="savingPurchase"
              (click)="savePurchaseDetails()"
            >
              {{ savingPurchase ? 'Speichern...' : 'Speichern' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1280px;
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
        margin-bottom: 24px;
      }
      .header-actions {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .filters {
        display: flex;
        gap: 12px;
        margin-bottom: 18px;
        flex-wrap: wrap;
        align-items: center;
      }
      .search-group {
        position: relative;
        flex: 1;
        min-width: 220px;
      }
      .filter-input {
        padding: 10px 14px;
        border: 1.5px solid var(--border-color);
        border-radius: var(--radius-md, 10px);
        font-size: 0.88rem;
        background: var(--bg-card);
        color: var(--text-primary);
        transition: all 0.2s;
        width: 100%;
      }
      .filter-input:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.08));
      }
      .search-input {
        padding-left: 40px;
      }
      .search-icon {
        position: absolute;
        left: 13px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        pointer-events: none;
        display: flex;
      }
      .filter-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .filter-badge {
        background: var(--accent-primary);
        color: #fff;
        font-size: 0.7rem;
        padding: 2px 7px;
        border-radius: 50px;
        font-weight: 700;
      }
      .filter-row {
        display: flex;
        gap: 16px;
        margin-bottom: 18px;
        flex-wrap: wrap;
        animation: slideDown 0.25s ease;
      }
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .filter-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 160px;
      }
      .filter-item label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .table-wrap {
        background: var(--bg-card);
        border-radius: var(--radius-lg, 14px);
        border: 1px solid var(--border-light);
        overflow-x: auto;
        overflow-y: visible;
        box-shadow: var(--shadow-sm);
        -webkit-overflow-scrolling: touch;
      }
      table {
        width: 100%;
        min-width: 700px;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        padding: 12px 16px;
        background: var(--table-stripe, #f8fafc);
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border-light);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
      }
      td {
        padding: 11px 16px;
        border-bottom: 1px solid var(--border-light);
        font-size: 0.88rem;
        color: var(--text-secondary);
        vertical-align: middle;
        white-space: nowrap;
      }
      tr:hover td {
        background: var(--table-hover, #f1f5f9);
      }
      .mono {
        font-family: 'SF Mono', 'Consolas', monospace;
        font-size: 0.82rem;
        color: var(--accent-primary);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        padding: 2px 8px;
        border-radius: 6px;
        font-weight: 600;
      }
      .clickable-row {
        cursor: pointer;
        transition: background 0.15s;
      }
      .clickable-row:hover td {
        background: var(--table-hover, #f1f5f9);
      }
      .row-with-purchase td {
        background: rgba(16, 185, 129, 0.22);
      }
      .row-with-purchase:hover td {
        background: rgba(16, 185, 129, 0.32);
      }
      .row-new-bike td {
        background: rgba(59, 130, 246, 0.22);
      }
      .row-new-bike:hover td {
        background: rgba(59, 130, 246, 0.32);
      }
      .row-accessory td {
        background: rgba(180, 150, 0, 0.25);
      }
      .row-accessory:hover td {
        background: rgba(180, 150, 0, 0.35);
      }
      .actions-cell {
        position: relative;
        text-align: center;
        overflow: visible !important;
      }
      .action-icon {
        font-size: 1.2rem;
        color: var(--text-secondary);
        cursor: pointer;
      }
      .popup-menu {
        position: absolute;
        top: 100%;
        right: 0;
        z-index: 9999;
        min-width: 170px;
        background: var(--bg-card, #fff);
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-lg, 14px);
        box-shadow: var(--shadow-lg);
        padding: 6px 0;
        animation: fadeIn 0.15s ease;
      }
      .popup-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 9px 14px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 0.88rem;
        font-weight: 500;
        color: var(--text-primary);
        text-align: left;
        transition: var(--transition-fast);
        border-radius: 0;
      }
      .popup-item:hover {
        background: var(--table-hover, #f1f5f9);
      }
      .popup-item-danger {
        color: var(--accent-danger, #ef4444);
      }
      .popup-item-danger:hover {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.08));
      }
      .popup-divider {
        height: 1px;
        background: var(--border-light, #e2e8f0);
        margin: 4px 0;
      }
      .popup-icon {
        font-size: 1rem;
      }
      .purchase-dialog-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 16px;
      }
      .purchase-dialog {
        width: min(560px, 100%);
        background: var(--bg-card, #fff);
        border-radius: 14px;
        border: 1px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-lg);
        padding: 20px;
      }
      .purchase-dialog h3 {
        margin: 0 0 14px;
        color: var(--text-primary);
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .field.full {
        grid-column: 1 / -1;
      }
      .field label {
        display: block;
        margin-bottom: 6px;
        font-size: 0.76rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
      }
      .field input {
        width: 100%;
        padding: 10px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: 10px;
        background: var(--bg-card);
        color: var(--text-primary);
      }
      .dialog-actions {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      .badge {
        display: inline-block;
        padding: 4px 11px;
        border-radius: 50px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      .badge-Bar {
        background: var(--accent-success-light, rgba(16, 185, 129, 0.08));
        color: var(--accent-success, #10b981);
      }
      .badge-Karte {
        background: rgba(59, 130, 246, 0.08);
        color: #3b82f6;
      }
      .badge-PayPal {
        background: var(--accent-warning-light, rgba(245, 158, 11, 0.08));
        color: var(--accent-warning, #f59e0b);
      }
      .badge-Überweisung {
        background: rgba(139, 92, 246, 0.08);
        color: #8b5cf6;
      }
      @media (max-width: 640px) {
        .filters {
          flex-direction: column;
        }
        .search-input {
          min-width: 100%;
        }
      }
    `,
  ],
})
export class SaleListComponent implements OnInit {
  private saleService = inject(SaleService);
  private purchaseService = inject(PurchaseService);
  private excelExportService = inject(ExcelExportService);
  private translationService = inject(TranslationService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.activeMenuId = null;
    }
  }

  paginatedResult: PaginatedResult<SaleList> | null = null;
  searchText = '';
  filterPayment = '';
  filterMarke = '';
  filterFahrradtyp = '';
  filterFarbe = '';
  currentPage = 1;
  pageSize = 20;
  showFilters = false;
  activeMenuId: number | null = null;
  showAddPurchaseDialog = false;
  savingPurchase = false;
  selectedSaleForPurchase: SaleList | null = null;
  purchaseDialog = {
    belegNummer: '',
    preis: null as number | null,
    kaufdatum: '',
  };

  get t() {
    return this.translationService.translations();
  }

  get activeFilterCount(): number {
    let count = 0;
    if (this.filterPayment) count++;
    if (this.filterMarke) count++;
    if (this.filterFahrradtyp) count++;
    if (this.filterFarbe) count++;
    return count;
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.saleService
      .getPaginated(
        this.currentPage,
        this.pageSize,
        this.filterPayment || undefined,
        this.searchText || undefined,
        this.filterMarke || undefined,
        this.filterFahrradtyp || undefined,
        this.filterFarbe || undefined,
      )
      .subscribe((data) => {
        this.paginatedResult = data;
      });
  }

  clearFilters() {
    this.filterPayment = '';
    this.filterMarke = '';
    this.filterFahrradtyp = '';
    this.filterFarbe = '';
    this.currentPage = 1;
    this.load();
  }

  onSearch() {
    this.currentPage = 1;
    this.load();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.load();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.load();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.load();
  }

  getPaymentLabel(method: string): string {
    switch (method) {
      case 'Bar':
        return this.t.cash;
      case 'Karte':
        return this.t.bankTransfer;
      case 'PayPal':
        return this.t.paypal;
      case 'Überweisung':
        return this.t.wireTransfer;
      default:
        return method;
    }
  }

  downloadPdf(s: SaleList) {
    this.closeMenu();
    this.saleService.downloadVerkaufsbeleg(s.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Verkaufsbeleg_${s.belegNummer}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  previewPdf(s: SaleList) {
    this.closeMenu();
    this.saleService.downloadVerkaufsbeleg(s.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }

  printPdf(s: SaleList) {
    this.closeMenu();
    this.saleService.downloadVerkaufsbeleg(s.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    });
  }

  toggleMenu(event: MouseEvent, s: SaleList) {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === s.id ? null : s.id;
  }

  hasPurchase(s: SaleList): boolean {
    return !!s.purchaseId;
  }

  isAccessoryOnlySale(s: SaleList): boolean {
    return !!s.rahmennummer?.startsWith('ACC-');
  }

  isNewBikeSale(s: SaleList): boolean {
    return s.zustand === 'Neu' && !this.isAccessoryOnlySale(s);
  }

  canAddPurchase(s: SaleList): boolean {
    return (
      !this.hasPurchase(s) && !this.isAccessoryOnlySale(s) && !!s.bicycleId
    );
  }

  openAddPurchaseDialog(s: SaleList) {
    this.closeMenu();
    this.selectedSaleForPurchase = s;
    this.purchaseDialog = {
      belegNummer: '',
      preis: null,
      kaufdatum: '',
    };
    this.showAddPurchaseDialog = true;
  }

  closeAddPurchaseDialog() {
    if (this.savingPurchase) return;
    this.showAddPurchaseDialog = false;
    this.selectedSaleForPurchase = null;
  }

  savePurchaseDetails() {
    const sale = this.selectedSaleForPurchase;
    if (!sale) return;
    if (
      !this.purchaseDialog.kaufdatum ||
      !this.purchaseDialog.preis ||
      this.purchaseDialog.preis <= 0
    ) {
      this.notificationService.error(
        'Bitte Ankaufdatum und einen Preis größer als 0 eingeben.',
      );
      return;
    }

    const payload: PurchaseCreateForExistingBike = {
      bicycleId: sale.bicycleId,
      seller: {
        vorname: 'Unbekannt',
        nachname: 'Verkaeufer',
      },
      preis: this.purchaseDialog.preis,
      verkaufspreisVorschlag: sale.preis,
      zahlungsart: 'Bar' as any,
      kaufdatum: this.purchaseDialog.kaufdatum,
      belegNummer: this.purchaseDialog.belegNummer || undefined,
    };

    this.savingPurchase = true;
    this.purchaseService.createForExistingBike(payload).subscribe({
      next: (created) => {
        sale.purchaseId = created.id;
        this.savingPurchase = false;
        this.showAddPurchaseDialog = false;
        this.selectedSaleForPurchase = null;
        this.notificationService.success('Ankauf erfolgreich gespeichert.');
      },
      error: (err) => {
        this.savingPurchase = false;
        this.notificationService.error(
          err?.error?.error || 'Ankauf konnte nicht gespeichert werden.',
        );
      },
    });
  }

  closeMenu() {
    this.activeMenuId = null;
  }

  goToEdit(s: SaleList) {
    this.closeMenu();
    this.router.navigate(['/sales/edit', s.id]);
  }

  exportExcel() {
    this.excelExportService.exportToExcel(
      this.paginatedResult?.items || [],
      'Verkaeufe',
      [
        { key: 'belegNummer', header: 'Beleg-Nr.' },
        { key: 'bikeInfo', header: 'Fahrrad' },
        { key: 'buyerName', header: 'Käufer' },
        { key: 'gesamtbetrag', header: 'Gesamtbetrag (€)' },
        { key: 'zahlungsart', header: 'Zahlungsart' },
        { key: 'verkaufsdatum', header: 'Verkaufsdatum' },
        { key: 'garantie', header: 'Garantie' },
      ],
    );
  }

  deleteSale(s: SaleList) {
    this.closeMenu();
    this.dialogService
      .danger(this.t.delete, this.t.deleteConfirmSale)
      .then((confirmed) => {
        if (confirmed) {
          this.saleService.delete(s.id).subscribe({
            next: () => {
              this.notificationService.success(this.t.deleteSuccess);
              this.load();
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
