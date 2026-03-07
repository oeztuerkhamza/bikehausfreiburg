import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BicycleService } from '../../services/bicycle.service';
import { TranslationService } from '../../services/translation.service';

interface LabelBike {
  id: number;
  marke: string;
  modell: string;
  farbe: string;
  reifengroesse: string;
  fahrradtyp: string;
  zustand: string;
  rahmennummer: string;
  rahmengroesse: string;
  beschreibung: string;
  preis: number;
  selected: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-bicycle-labels',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Selection screen -->
    <div class="page" *ngIf="!printMode">
      <div class="page-header">
        <h1>🏷️ {{ t.createLabels }}</h1>
        <div class="header-actions">
          <a routerLink="/bicycles" class="btn btn-outline">← {{ t.back }}</a>
        </div>
      </div>

      <div class="toolbar">
        <div class="search-box">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            [placeholder]="t.labelsSearchPlaceholder"
            (ngModelChange)="filterBikes()"
          />
        </div>
        <div class="selection-info">
          <span class="count-badge"
            >{{ selectedCount }} {{ t.selectedText }}</span
          >
          <button
            class="btn btn-sm btn-outline"
            (click)="selectAll()"
            *ngIf="selectedCount < filteredBikes.length"
          >
            {{ t.selectAllButton }}
          </button>
          <button
            class="btn btn-sm btn-outline"
            (click)="deselectAll()"
            *ngIf="selectedCount > 0"
          >
            {{ t.deselectAllButton }}
          </button>
        </div>
      </div>

      <div class="bike-grid">
        <div
          class="bike-card"
          *ngFor="let bike of filteredBikes"
          [class.selected]="bike.selected"
          (click)="toggleSelection(bike)"
        >
          <div class="card-check">
            <div class="checkbox" [class.checked]="bike.selected">
              <svg
                *ngIf="bike.selected"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                stroke-width="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <div class="card-body">
            <div class="bike-brand">{{ bike.marke }}</div>
            <div class="bike-model">{{ bike.modell }}</div>
            <div class="bike-details">
              <span *ngIf="bike.farbe">{{ bike.farbe }}</span>
              <span>{{ bike.reifengroesse }}"</span>
              <span *ngIf="bike.fahrradtyp">{{ bike.fahrradtyp }}</span>
            </div>
            <div class="bike-meta">
              <span class="bike-price" *ngIf="bike.preis"
                >{{ bike.preis | number: '1.0-0' }} €</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="filteredBikes.length === 0">
        {{ t.noBicyclesFound }}
      </div>

      <!-- Print action -->
      <div class="print-bar" *ngIf="selectedCount > 0">
        <div class="print-bar-info">
          <strong>{{ selectedCount }}</strong> {{ t.bicyclesPlural }}
          {{ t.selectedText }} · {{ pageCount }} {{ t.paginationPage }} ({{
            selectedCount
          }}
          {{ t.labelsWord }})
        </div>
        <button class="btn btn-primary btn-lg" (click)="startPrint()">
          🖨️ {{ t.printButton }}
        </button>
      </div>
    </div>

    <!-- Print view -->
    <div class="print-view" *ngIf="printMode" id="printArea">
      <div class="a4-page" *ngFor="let page of pages">
        <div class="label-cell" *ngFor="let bike of page" [class.empty]="!bike">
          <div class="label-content" *ngIf="bike">
            <div class="label-zustand">{{ bike.zustand }}</div>
            <div class="label-brand">{{ bike.marke }}</div>
            <div class="label-model">{{ bike.modell }}</div>
            <div class="label-specs">
              <div class="spec-row">
                <span class="spec-label">{{ t.wheelsSpec }}</span>
                <span class="spec-value">{{ bike.reifengroesse }}"</span>
              </div>
              <div class="spec-row" *ngIf="bike.rahmengroesse">
                <span class="spec-label">{{ t.frameSize }}</span>
                <span class="spec-value">{{ bike.rahmengroesse }}</span>
              </div>
            </div>
            <div class="label-price-area">
              <div class="label-price">
                {{ bike.preis | number: '1.0-0' }} €
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      <div class="print-controls no-print">
        <button class="btn btn-outline" (click)="printMode = false">
          ← {{ t.backToSelection }}
        </button>
        <button class="btn btn-primary btn-lg" (click)="print()">
          🖨️ {{ t.printNowButton }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      /* ── Selection Screen ── */
      .page {
        max-width: 1100px;
        margin: 0 auto;
        padding-bottom: 100px;
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
        margin-bottom: 20px;
      }
      .page-header h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .search-box input {
        width: 320px;
        padding: 10px 14px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.9rem;
        background: var(--bg-primary, #fff);
        color: var(--text-primary);
        outline: none;
        transition: border-color 0.2s;
      }
      .search-box input:focus {
        border-color: var(--accent-primary, #6366f1);
      }
      .selection-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .count-badge {
        background: var(--accent-primary, #6366f1);
        color: #fff;
        padding: 4px 12px;
        border-radius: 99px;
        font-size: 0.8rem;
        font-weight: 600;
      }
      .bike-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 14px;
      }
      .bike-card {
        display: flex;
        gap: 12px;
        padding: 14px;
        border-radius: var(--radius-md, 10px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        background: var(--bg-primary, #fff);
        cursor: pointer;
        transition: all 0.15s ease;
        user-select: none;
      }
      .bike-card:hover {
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
      }
      .bike-card.selected {
        border-color: var(--accent-primary, #6366f1);
        background: rgba(99, 102, 241, 0.04);
      }
      .card-check {
        flex-shrink: 0;
        padding-top: 2px;
      }
      .checkbox {
        width: 22px;
        height: 22px;
        border-radius: 6px;
        border: 2px solid var(--border-light, #cbd5e1);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
      }
      .checkbox.checked {
        background: var(--accent-primary, #6366f1);
        border-color: var(--accent-primary, #6366f1);
      }
      .checkbox svg {
        width: 14px;
        height: 14px;
      }
      .card-body {
        flex: 1;
        min-width: 0;
      }
      .bike-brand {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--text-primary);
      }
      .bike-model {
        font-size: 0.85rem;
        color: var(--text-secondary, #64748b);
        margin-bottom: 4px;
      }
      .bike-details {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-bottom: 6px;
      }
      .bike-details span {
        background: var(--bg-secondary, #f1f5f9);
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 0.75rem;
        color: var(--text-secondary, #64748b);
      }
      .bike-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .bike-price {
        font-weight: 700;
        font-size: 1rem;
        color: var(--accent-primary, #6366f1);
      }
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--text-secondary, #94a3b8);
        font-size: 1rem;
      }

      /* Print bar */
      .print-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--bg-primary, #fff);
        border-top: 1.5px solid var(--border-light, #e2e8f0);
        padding: 14px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 100;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
      }
      .print-bar-info {
        color: var(--text-primary);
        font-size: 0.9rem;
      }

      /* ── Print View ── */
      .print-view {
        padding: 20px;
      }
      .print-controls {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin: 30px 0;
      }
      .a4-page {
        width: 210mm;
        height: 297mm;
        margin: 0 auto 30px;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
        border: 1px dashed #cbd5e1;
        background: #fff;
        page-break-after: always;
        box-sizing: border-box;
        padding: 10mm;
        gap: 6mm;
      }
      .label-cell {
        border: 0.5px dashed #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 5mm;
        box-sizing: border-box;
        overflow: hidden;
      }
      .label-cell.empty {
        background: #fafafa;
      }
      .label-content {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        text-align: center;
        font-family: 'Segoe UI', Arial, sans-serif;
        padding: 3mm 0;
      }
      .label-zustand {
        font-size: 16pt;
        font-weight: 800;
        color: #fff;
        background: #10b981;
        padding: 2mm 8mm;
        border-radius: 2mm;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 3mm;
      }
      .label-brand {
        font-size: 24pt;
        font-weight: 900;
        color: #0f172a;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
      .label-model {
        font-size: 18pt;
        font-weight: 600;
        color: #475569;
        margin-bottom: 5mm;
      }
      .label-specs {
        width: 100%;
        flex: 1;
        overflow: hidden;
      }
      .spec-row {
        display: flex;
        justify-content: space-between;
        padding: 1.5mm 0;
        border-bottom: 0.4px solid #e2e8f0;
        font-size: 13pt;
      }
      .spec-label {
        color: #64748b;
        font-weight: 600;
      }
      .spec-value {
        color: #1e293b;
        font-weight: 700;
      }
      .label-price-area {
        margin: 5mm 0 3mm;
        padding: 3mm 10mm;
        background: #0f172a;
        border-radius: 3mm;
        display: inline-flex;
      }
      .label-price {
        font-size: 24pt;
        font-weight: 900;
        color: #fff;
        letter-spacing: 0.05em;
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
      .btn-sm {
        padding: 5px 12px;
        font-size: 0.8rem;
      }
      .btn-lg {
        padding: 12px 28px;
        font-size: 1rem;
      }

      /* ── Print media ── */
      @media print {
        /* Hide everything except print area */
        .no-print,
        .page,
        .print-controls,
        nav,
        header,
        footer,
        aside,
        .sidebar,
        .header-bar,
        .app-wrapper,
        .main-content,
        .content-area {
          all: unset !important;
          display: contents !important;
        }

        /* Hide specific navigation elements */
        nav,
        header,
        footer,
        aside,
        .sidebar,
        .header-bar,
        .no-print,
        .print-controls {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
        }

        /* Reset body and html */
        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          width: 210mm !important;
          height: 297mm !important;
        }

        .print-view {
          padding: 0 !important;
          margin: 0 !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 210mm !important;
          z-index: 99999 !important;
          background: white !important;
        }

        .a4-page {
          margin: 0 !important;
          padding: 10mm !important;
          border: none !important;
          page-break-after: always;
          page-break-inside: avoid;
          width: 210mm !important;
          height: 297mm !important;
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          grid-template-rows: repeat(2, 1fr) !important;
          gap: 6mm !important;
        }

        .a4-page:last-child {
          page-break-after: auto;
        }

        .label-cell {
          border: 0.5px dashed #ccc !important;
          page-break-inside: avoid;
          overflow: hidden !important;
        }

        .label-cell.empty {
          visibility: hidden !important;
        }

        .label-price-area {
          background: #0f172a !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .label-price {
          color: #fff !important;
        }

        @page {
          size: A4;
          margin: 5mm;
        }
      }

      @media (max-width: 600px) {
        .toolbar {
          flex-direction: column;
          align-items: stretch;
        }
        .search-box input {
          width: 100%;
        }
        .bike-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class BicycleLabelsComponent implements OnInit {
  private bicycleService = inject(BicycleService);
  private translationService = inject(TranslationService);

  allBikes: LabelBike[] = [];
  filteredBikes: LabelBike[] = [];
  searchTerm = '';
  printMode = false;

  get t() {
    return this.translationService.translations();
  }

  get selectedBikes(): LabelBike[] {
    return this.allBikes.filter((b) => b.selected);
  }

  get selectedCount(): number {
    return this.selectedBikes.length;
  }

  get pageCount(): number {
    return Math.ceil(this.selectedCount / 4);
  }

  get pages(): (LabelBike | null)[][] {
    const selected = this.selectedBikes;
    const result: (LabelBike | null)[][] = [];
    for (let i = 0; i < selected.length; i += 4) {
      const page: (LabelBike | null)[] = selected.slice(i, i + 4);
      while (page.length < 4) page.push(null);
      result.push(page);
    }
    return result;
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.bicycleService.getAll().subscribe((bicycles) => {
      // Map bicycles, sorted newest first
      this.allBikes = bicycles
        .filter((b) => b.status === 'Available')
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .map((b) => ({
          id: b.id,
          marke: b.marke,
          modell: b.modell,
          farbe: b.farbe || '',
          reifengroesse: b.reifengroesse,
          fahrradtyp: b.fahrradtyp || '',
          zustand: b.zustand,
          rahmennummer: b.rahmennummer || '',
          rahmengroesse: b.rahmengroesse || '',
          beschreibung: b.beschreibung || '',
          preis: b.verkaufspreisVorschlag || 0,
          selected: false,
          createdAt: b.createdAt,
        }));

      this.filteredBikes = [...this.allBikes];
    });
  }

  filterBikes() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredBikes = [...this.allBikes];
      return;
    }
    this.filteredBikes = this.allBikes.filter(
      (b) =>
        b.marke.toLowerCase().includes(term) ||
        b.modell.toLowerCase().includes(term) ||
        b.fahrradtyp.toLowerCase().includes(term) ||
        b.farbe.toLowerCase().includes(term),
    );
  }

  toggleSelection(bike: LabelBike) {
    bike.selected = !bike.selected;
  }

  selectAll() {
    this.filteredBikes.forEach((b) => (b.selected = true));
  }

  deselectAll() {
    this.allBikes.forEach((b) => (b.selected = false));
  }

  startPrint() {
    this.printMode = true;
  }

  print() {
    window.print();
  }
}
