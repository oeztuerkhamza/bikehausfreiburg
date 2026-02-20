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
import { ReturnService } from '../../services/return.service';
import { ExcelExportService } from '../../services/excel-export.service';
import { TranslationService } from '../../services/translation.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { ReturnList, ReturnReason, PaginatedResult } from '../../models/models';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-return-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PaginationComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ t.returns }}</h1>
        <div class="header-actions">
          <button class="btn btn-outline" (click)="exportExcel()">
            📥 {{ t.excelExport }}
          </button>
          <a routerLink="/returns/new" class="btn btn-primary"
            >+ {{ t.newReturn }}</a
          >
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-group search-group">
          <input
            type="text"
            [(ngModel)]="searchText"
            (input)="onSearch()"
            [placeholder]="t.searchPlaceholder"
            class="filter-input search-input"
          />
          <span class="search-icon"
            ><svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" /></svg
          ></span>
        </div>
        <div class="filter-group">
          <select
            [(ngModel)]="filterReason"
            (change)="onFilterChange()"
            class="filter-input"
          >
            <option value="">{{ t.allReasons }}</option>
            <option value="Defekt">{{ t.defect }}</option>
            <option value="Garantie">{{ t.warranty }}</option>
            <option value="NichtWieErwartet">{{ t.notAsExpected }}</option>
            <option value="Sonstiges">{{ t.other }}</option>
          </select>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t.receiptNo }}</th>
              <th>{{ t.stockNo }}</th>
              <th>{{ t.originalSale }}</th>
              <th>{{ t.bicycle }}</th>
              <th>{{ t.customer }}</th>
              <th>{{ t.date }}</th>
              <th>{{ t.reason }}</th>
              <th>{{ t.refund }}</th>
              <th style="width: 50px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="paginatedResult?.items?.length === 0">
              <td
                colspan="9"
                style="text-align:center;padding:32px;color:#999;"
              >
                {{ t.noReturnsFound }}
              </td>
            </tr>
            <tr
              *ngFor="let r of paginatedResult?.items"
              class="clickable-row"
              (click)="toggleMenu($event, r)"
            >
              <td class="mono">{{ r.belegNummer }}</td>
              <td class="mono">{{ r.stokNo || '–' }}</td>
              <td>{{ r.originalSaleBelegNummer }}</td>
              <td>{{ r.bikeInfo }}</td>
              <td>{{ r.customerName }}</td>
              <td>{{ r.rueckgabedatum | date: 'dd.MM.yyyy' }}</td>
              <td>
                <span class="badge" [class]="getBadgeClass(r.grund)">{{
                  getReasonLabel(r.grund)
                }}</span>
              </td>
              <td>{{ r.erstattungsbetrag | number: '1.2-2' }} €</td>
              <td class="actions-cell">
                <span class="action-icon">⋮</span>
                <div
                  *ngIf="activeMenuId === r.id"
                  class="popup-menu"
                  (click)="$event.stopPropagation()"
                >
                  <button class="popup-item" (click)="printPdf(r)">
                    <span class="popup-icon">🖨️</span>
                    {{ t.printDocument }}
                  </button>
                  <button class="popup-item" (click)="previewPdf(r)">
                    <span class="popup-icon">👁️</span>
                    {{ t.preview }}
                  </button>
                  <button class="popup-item" (click)="downloadPdf(r)">
                    <span class="popup-icon">⬇️</span>
                    {{ t.download }}
                  </button>
                  <div class="popup-divider"></div>
                  <button
                    class="popup-item popup-item-danger"
                    (click)="deleteReturn(r)"
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
      .filter-bar {
        display: flex;
        gap: 12px;
        margin-bottom: 18px;
        flex-wrap: wrap;
        align-items: center;
      }
      .filter-group {
        position: relative;
      }
      .search-group {
        flex: 1;
        min-width: 200px;
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
      .table-wrap {
        background: var(--bg-card);
        border-radius: var(--radius-lg, 14px);
        border: 1px solid var(--border-light);
        overflow: visible;
        box-shadow: var(--shadow-sm);
      }
      table {
        width: 100%;
        min-width: 1000px;
        border-collapse: collapse;
        table-layout: fixed;
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
      th:nth-child(1) {
        width: 110px;
      }
      th:nth-child(2) {
        width: 70px;
      }
      th:nth-child(3) {
        width: 110px;
      }
      th:nth-child(4) {
        width: 140px;
      }
      th:nth-child(5) {
        width: 140px;
      }
      th:nth-child(6) {
        width: 100px;
      }
      th:nth-child(7) {
        width: 100px;
      }
      th:nth-child(8) {
        width: 90px;
      }
      td {
        padding: 11px 16px;
        border-bottom: 1px solid var(--border-light);
        font-size: 0.88rem;
        color: var(--text-secondary);
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
      .badge {
        display: inline-block;
        padding: 4px 11px;
        border-radius: 50px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      .badge-defekt {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.08));
        color: var(--accent-danger, #ef4444);
      }
      .badge-garantie {
        background: var(--accent-warning-light, rgba(245, 158, 11, 0.08));
        color: var(--accent-warning, #f59e0b);
      }
      .badge-nicht-erwartet {
        background: rgba(59, 130, 246, 0.08);
        color: #3b82f6;
      }
      .badge-sonstiges {
        background: rgba(100, 116, 139, 0.08);
        color: #64748b;
      }
    `,
  ],
})
export class ReturnListComponent implements OnInit {
  private translationService = inject(TranslationService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private returnService = inject(ReturnService);
  private excelExportService = inject(ExcelExportService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.activeMenuId = null;
    }
  }

  get t() {
    return this.translationService.translations();
  }

  paginatedResult: PaginatedResult<ReturnList> | null = null;
  searchText = '';
  filterReason = '';
  currentPage = 1;
  pageSize = 20;
  activeMenuId: number | null = null;

  ngOnInit() {
    this.load();
  }

  load() {
    this.returnService
      .getPaginated(
        this.currentPage,
        this.pageSize,
        this.filterReason || undefined,
        this.searchText || undefined,
      )
      .subscribe((data) => {
        this.paginatedResult = data;
      });
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

  getReasonLabel(reason: ReturnReason): string {
    const labels: Record<ReturnReason, string> = {
      [ReturnReason.Defekt]: this.t.defect,
      [ReturnReason.Garantie]: this.t.warranty,
      [ReturnReason.NichtWieErwartet]: this.t.notAsExpected,
      [ReturnReason.Sonstiges]: this.t.other,
    };
    return labels[reason] || reason;
  }

  getBadgeClass(reason: ReturnReason): string {
    const classes: Record<ReturnReason, string> = {
      [ReturnReason.Defekt]: 'badge-defekt',
      [ReturnReason.Garantie]: 'badge-garantie',
      [ReturnReason.NichtWieErwartet]: 'badge-nicht-erwartet',
      [ReturnReason.Sonstiges]: 'badge-sonstiges',
    };
    return classes[reason] || '';
  }

  toggleMenu(event: MouseEvent, r: ReturnList) {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === r.id ? null : r.id;
  }

  closeMenu() {
    this.activeMenuId = null;
  }

  downloadPdf(r: ReturnList) {
    this.closeMenu();
    this.returnService.downloadRueckgabebeleg(r.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rueckgabebeleg_${r.belegNummer}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  previewPdf(r: ReturnList) {
    this.closeMenu();
    this.returnService.downloadRueckgabebeleg(r.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  }

  printPdf(r: ReturnList) {
    this.closeMenu();
    this.returnService.downloadRueckgabebeleg(r.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    });
  }

  exportExcel() {
    this.excelExportService.exportToExcel(
      this.paginatedResult?.items || [],
      'Rueckgaben',
      [
        { key: 'belegNummer', header: 'Beleg-Nr.' },
        { key: 'originalSaleBelegNummer', header: 'Org. Verkauf' },
        { key: 'bikeInfo', header: 'Fahrrad' },
        { key: 'customerName', header: 'Kunde' },
        { key: 'rueckgabedatum', header: 'Datum' },
        { key: 'grund', header: 'Grund' },
        { key: 'erstattungsbetrag', header: 'Erstattung (€)' },
      ],
    );
  }

  deleteReturn(r: ReturnList) {
    this.closeMenu();
    this.dialogService
      .danger(this.t.delete, `${this.t.deleteConfirmReturn} (${r.belegNummer})`)
      .then((confirmed) => {
        if (confirmed) {
          this.returnService.delete(r.id).subscribe({
            next: () => {
              this.notificationService.success(
                this.t.deleteSuccess || 'Erfolgreich gelöscht',
              );
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
