import {
  Component,
  OnInit,
  inject,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReturnService } from '../../services/return.service';
import { SaleService } from '../../services/sale.service';
import { NotificationService } from '../../services/notification.service';
import { TranslationService } from '../../services/translation.service';
import {
  ReturnCreate,
  ReturnUpdate,
  SaleList,
  PaymentMethod,
  ReturnReason,
} from '../../models/models';

@Component({
  selector: 'app-return-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ editId ? 'Rückgabe bearbeiten' : t.newReturnTitle }}</h1>
        <a routerLink="/returns" class="btn btn-outline">{{ t.back }}</a>
      </div>

      <form (ngSubmit)="submit()" #f="ngForm">
        <!-- Wizard progress (mobile only) -->
        <div class="wizard-progress" *ngIf="isMobile">
          <div class="wizard-progress-top">
            <span class="wizard-step-count"
              >Schritt {{ currentStep + 1 }} / {{ totalSteps }}</span
            >
            <span class="wizard-step-name">{{ currentStepLabel }}</span>
          </div>
          <div class="wizard-progress-bar">
            <div
              class="wizard-progress-fill"
              [style.width.%]="((currentStep + 1) / totalSteps) * 100"
            ></div>
          </div>
          <div class="wizard-dots">
            <span
              class="wizard-dot"
              *ngFor="let s of wizardSteps; let idx = index"
              [class.active]="idx === currentStep"
              [class.done]="idx < currentStep"
              (click)="goToStep(idx)"
            ></span>
          </div>
        </div>

        <div class="form-sections">
          <!-- STEP 0: Verkauf auswählen -->
          <div
            class="wizard-step"
            [class.wizard-hidden]="isMobile && currentStep !== 0"
          >
          <!-- Sale selection -->
          <div class="form-card">
            <h2>{{ t.selectSale }}</h2>
            <!-- Edit-Modus: Verkauf ist fix und kann nicht geändert werden -->
            <div *ngIf="editId && editInfo" class="sale-preview">
              <div class="sale-preview-badge">🔒 Verkauf (fest)</div>
              <span
                ><strong>{{ editInfo.saleBelegNummer }}</strong></span
              >
              <span>{{ t.bicycle }}: {{ editInfo.bikeInfo }}</span>
              <span>{{ t.buyer }}: {{ editInfo.customerName }}</span>
            </div>
            <div class="field sale-search-wrap" *ngIf="!editId">
              <label>{{ t.saleRequired }}</label>
              <div class="sale-search-box">
                <span class="sale-search-icon">
                  <svg
                    width="15"
                    height="15"
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
                <input
                  type="text"
                  [(ngModel)]="saleSearchText"
                  name="saleSearch"
                  (input)="onSaleSearch()"
                  (focus)="saleDropdownOpen = true"
                  [placeholder]="'Beleg-Nr., Fahrrad oder Kunde suchen...'"
                  class="sale-search-input"
                  autocomplete="off"
                />
                <button
                  *ngIf="saleSearchText"
                  type="button"
                  class="sale-search-clear"
                  (click)="clearSaleSearch()"
                >
                  ✕
                </button>
              </div>
              <div
                *ngIf="saleDropdownOpen && filteredSales.length > 0"
                class="sale-dropdown"
              >
                <div
                  *ngFor="let s of filteredSales"
                  class="sale-option"
                  [class.selected]="selectedSaleId === s.id"
                  (click)="selectSale(s)"
                >
                  <div class="sale-option-header">
                    <span class="sale-beleg">{{ s.belegNummer }}</span>
                    <span class="sale-price"
                      >{{ s.gesamtbetrag | number: '1.2-2' }} €</span
                    >
                  </div>
                  <div class="sale-option-detail">🚲 {{ s.bikeInfo }}</div>
                  <div class="sale-option-detail">
                    👤 {{ s.buyerName }} ·
                    {{ s.verkaufsdatum | date: 'dd.MM.yyyy' }}
                  </div>
                </div>
              </div>
              <div
                *ngIf="
                  saleDropdownOpen &&
                  saleSearchText &&
                  filteredSales.length === 0
                "
                class="sale-dropdown sale-empty"
              >
                {{ t.noSalesFound }}
              </div>
            </div>
            <div *ngIf="selectedSale" class="sale-preview">
              <div class="sale-preview-badge">✓ Ausgewählt</div>
              <span
                ><strong>{{ selectedSale.belegNummer }}</strong></span
              >
              <span>{{ t.bicycle }}: {{ selectedSale.bikeInfo }}</span>
              <span>{{ t.buyer }}: {{ selectedSale.buyerName }}</span>
              <span
                >{{ t.grandTotal }}:
                {{ selectedSale.gesamtbetrag | number: '1.2-2' }} €</span
              >
              <span
                >{{ t.soldOn }}:
                {{ selectedSale.verkaufsdatum | date: 'dd.MM.yyyy' }}</span
              >
            </div>
          </div>
          </div>
          <!-- /STEP 0 -->

          <!-- STEP 1: Rückgabedaten -->
          <div
            class="wizard-step"
            [class.wizard-hidden]="isMobile && currentStep !== 1"
          >
          <!-- Return details -->
          <div class="form-card">
            <h2>{{ t.returnData }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.receiptNo }}</label>
                <input
                  [(ngModel)]="belegNummer"
                  name="belegNummer"
                  placeholder="z.B. RB-20260219-001"
                />
              </div>
              <div class="field">
                <label>{{ t.returnDateRequired }}</label>
                <input
                  type="date"
                  [(ngModel)]="rueckgabedatum"
                  name="rueckgabedatum"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.returnReasonRequired }}</label>
                <select [(ngModel)]="grund" name="grund" required>
                  <option value="" disabled>
                    {{ t.selectReasonPlaceholder }}
                  </option>
                  <option value="Defekt">{{ t.defect }}</option>
                  <option value="NichtWieErwartet">
                    {{ t.notAsExpected }}
                  </option>
                  <option value="Garantie">{{ t.warranty }}</option>
                  <option value="Sonstiges">{{ t.other }}</option>
                </select>
              </div>
              <div
                class="field full"
                *ngIf="grund === 'Sonstiges' || grund === 'NichtWieErwartet'"
              >
                <label>{{ t.reasonDetails }}</label>
                <textarea
                  [(ngModel)]="grundDetails"
                  name="grundDetails"
                  rows="2"
                  [placeholder]="t.reasonDetailsPlaceholder"
                ></textarea>
              </div>
              <div class="field">
                <label>{{ t.refundAmountRequired }}</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="erstattungsbetrag"
                  name="erstattungsbetrag"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.paymentMethodRequired }}</label>
                <select [(ngModel)]="zahlungsart" name="zahlungsart" required>
                  <option value="Bar">{{ t.cash }}</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Karte">{{ t.bankTransfer }}</option>
                  <option value="Überweisung">{{ t.wireTransfer }}</option>
                </select>
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
          </div>
          <!-- /STEP 1 -->
        </div>

        <!-- Wizard nav (mobile only) -->
        <div class="wizard-nav" *ngIf="isMobile">
          <a
            routerLink="/returns"
            class="btn btn-outline wizard-back"
            *ngIf="currentStep === 0"
            >{{ t.back }}</a
          >
          <button
            type="button"
            class="btn btn-outline wizard-back"
            *ngIf="currentStep > 0"
            (click)="prevStep()"
          >
            Zurück
          </button>
          <button
            type="button"
            class="btn btn-primary wizard-next"
            *ngIf="!isLastStep"
            (click)="nextStep()"
          >
            Weiter
          </button>
          <button
            type="submit"
            class="btn btn-primary wizard-next"
            *ngIf="isLastStep"
            [disabled]="!f.valid || (!selectedSaleId && !editId)"
          >
            {{ t.saveReturn }}
          </button>
        </div>

        <div class="form-actions" *ngIf="!isMobile">
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="!f.valid || (!selectedSaleId && !editId)"
          >
            {{ t.saveReturn }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 700px;
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
        padding: 22px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
      }
      .form-card h2 {
        font-size: 1rem;
        font-weight: 700;
        margin: 0 0 16px;
        color: var(--text-primary);
        border-bottom: 1.5px solid var(--border-light, #e2e8f0);
        padding-bottom: 10px;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .field {
        display: flex;
        flex-direction: column;
      }
      .field.full {
        grid-column: 1 / -1;
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
      .field textarea {
        resize: vertical;
        font-family: inherit;
      }
      .sale-preview {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 10px;
        padding: 14px;
        background: var(--accent-success-light, rgba(16, 185, 129, 0.06));
        border-radius: var(--radius-md, 10px);
        border: 1.5px solid var(--accent-success, #10b981);
        font-size: 0.9rem;
        position: relative;
      }
      .sale-preview-badge {
        position: absolute;
        top: -10px;
        right: 12px;
        background: var(--accent-success, #10b981);
        color: #fff;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 2px 10px;
        border-radius: 50px;
        letter-spacing: 0.03em;
      }
      .sale-search-wrap {
        position: relative;
      }
      .sale-search-box {
        position: relative;
        display: flex;
        align-items: center;
      }
      .sale-search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        pointer-events: none;
        display: flex;
      }
      .sale-search-input {
        width: 100%;
        padding: 10px 36px 10px 38px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        transition: var(--transition-fast);
      }
      .sale-search-input:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }
      .sale-search-clear {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-muted);
        font-size: 0.85rem;
        padding: 2px 6px;
        border-radius: 50%;
        transition: var(--transition-fast);
      }
      .sale-search-clear:hover {
        background: var(--border-light, #e2e8f0);
        color: var(--text-primary);
      }
      .sale-dropdown {
        position: absolute;
        left: 0;
        right: 0;
        top: 100%;
        z-index: 100;
        max-height: 260px;
        overflow-y: auto;
        background: var(--bg-card, #fff);
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        box-shadow: var(--shadow-lg);
        margin-top: 4px;
      }
      .sale-empty {
        padding: 18px;
        text-align: center;
        color: var(--text-muted);
        font-size: 0.88rem;
      }
      .sale-option {
        padding: 10px 14px;
        cursor: pointer;
        transition: background 0.12s;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
      }
      .sale-option:last-child {
        border-bottom: none;
      }
      .sale-option:hover {
        background: var(--table-hover, #f1f5f9);
      }
      .sale-option.selected {
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        border-left: 3px solid var(--accent-primary, #6366f1);
      }
      .sale-option-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 3px;
      }
      .sale-beleg {
        font-weight: 700;
        font-size: 0.88rem;
        color: var(--accent-primary, #6366f1);
        font-family: 'SF Mono', 'Consolas', monospace;
      }
      .sale-price {
        font-weight: 700;
        font-size: 0.88rem;
        color: var(--accent-success, #10b981);
      }
      .sale-option-detail {
        font-size: 0.8rem;
        color: var(--text-secondary, #64748b);
        line-height: 1.4;
      }
      .form-actions {
        margin-top: 20px;
        display: flex;
        justify-content: flex-end;
      }
      .btn {
        padding: 10px 20px;
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: var(--transition-fast);
      }
      .btn-primary {
        background: var(--accent-primary, #6366f1);
        color: #fff;
      }
      .btn-primary:hover {
        background: var(--accent-primary-hover, #4f46e5);
        box-shadow: var(--shadow-sm);
      }
      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .btn-outline {
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        border: 1.5px solid var(--border-light, #e2e8f0);
      }
      .btn-outline:hover {
        border-color: var(--accent-primary, #6366f1);
        color: var(--accent-primary, #6366f1);
      }

      /* ── Mobile wizard ── */
      .wizard-progress {
        margin-bottom: 16px;
      }
      .wizard-progress-top {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
        margin-bottom: 8px;
      }
      .wizard-step-count {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        white-space: nowrap;
      }
      .wizard-step-name {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .wizard-progress-bar {
        height: 6px;
        background: var(--border-light);
        border-radius: 99px;
        overflow: hidden;
      }
      .wizard-progress-fill {
        height: 100%;
        background: var(--accent-primary, #6366f1);
        border-radius: 99px;
        transition: width 0.25s ease;
      }
      .wizard-dots {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 12px;
      }
      .wizard-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--border-color);
        cursor: pointer;
        transition: all 0.15s;
      }
      .wizard-dot.active {
        background: var(--accent-primary, #6366f1);
        transform: scale(1.35);
      }
      .wizard-dot.done {
        background: var(--accent-primary, #6366f1);
        opacity: 0.5;
      }
      .wizard-hidden {
        display: none;
      }
      .wizard-nav {
        position: sticky;
        bottom: 0;
        z-index: 50;
        display: flex;
        gap: 12px;
        margin-top: 16px;
        padding: 12px 0 calc(12px + env(safe-area-inset-bottom, 0px));
        background: var(--bg-card);
        border-top: 1px solid var(--border-light);
      }
      .wizard-nav .wizard-next {
        flex: 1;
      }
      .wizard-nav .wizard-back {
        flex: 0 0 auto;
      }
      .wizard-nav .btn {
        padding: 14px 18px;
        font-size: 1rem;
        justify-content: center;
      }

      @media (max-width: 640px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        /* Prevent iOS zoom-on-focus (needs ≥16px) */
        .field input,
        .field select,
        .field textarea,
        .sale-search-input {
          font-size: 16px;
        }
        .form-card {
          padding: 16px;
        }
        .form-sections {
          gap: 16px;
        }
        .page-header {
          margin-bottom: 16px;
        }
        .page-header h1 {
          font-size: 1.25rem;
        }
      }
    `,
  ],
})
export class ReturnFormComponent implements OnInit {
  private translationService = inject(TranslationService);
  private notificationService = inject(NotificationService);
  private elementRef = inject(ElementRef);
  get t() {
    return this.translationService.translations();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.saleDropdownOpen = false;
    }
  }

  // ── Mobile wizard ──
  isMobile = false;
  currentStep = 0;

  get wizardSteps(): string[] {
    return [this.t.selectSale, this.t.returnData];
  }

  get totalSteps(): number {
    return this.wizardSteps.length;
  }

  get isLastStep(): boolean {
    return this.currentStep === this.totalSteps - 1;
  }

  get currentStepLabel(): string {
    return this.wizardSteps[this.currentStep] ?? '';
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.updateIsMobile();
  }

  private updateIsMobile() {
    if (typeof window === 'undefined') return;
    this.isMobile = window.innerWidth <= 640;
  }

  private scrollToTop() {
    if (typeof document !== 'undefined') {
      document
        .querySelector('.content-area')
        ?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextStep() {
    if (!this.validateStep(this.currentStep)) return;
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      this.scrollToTop();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.scrollToTop();
    }
  }

  goToStep(step: number) {
    if (step === this.currentStep) return;
    if (step < this.currentStep) {
      this.currentStep = step;
      this.scrollToTop();
      return;
    }
    for (let s = this.currentStep; s < step; s++) {
      if (!this.validateStep(s)) {
        this.currentStep = s;
        this.scrollToTop();
        return;
      }
    }
    this.currentStep = step;
    this.scrollToTop();
  }

  private validateStep(step: number): boolean {
    if (step === 0 && !this.selectedSaleId && !this.editId) {
      this.notificationService.error('Bitte zuerst einen Verkauf auswählen.');
      return false;
    }
    return true;
  }

  sales: SaleList[] = [];
  filteredSales: SaleList[] = [];
  saleSearchText = '';
  saleDropdownOpen = false;
  selectedSaleId = 0;
  selectedSale: SaleList | null = null;

  rueckgabedatum = '';
  grund: ReturnReason | '' = '';
  grundDetails = '';
  erstattungsbetrag = 0;
  zahlungsart: PaymentMethod = PaymentMethod.Bar;
  notizen = '';
  belegNummer = '';

  editId: number | null = null;
  editInfo: {
    saleBelegNummer: string;
    bikeInfo: string;
    customerName: string;
  } | null = null;

  constructor(
    private returnService: ReturnService,
    private saleService: SaleService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.updateIsMobile();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editId = +idParam;
      this.loadReturnForEdit(this.editId);
      return;
    }

    this.rueckgabedatum = new Date().toISOString().split('T')[0];
    this.loadSales();
    this.returnService.getNextBelegNummer().subscribe({
      next: (res) => {
        this.belegNummer = res.belegNummer;
      },
      error: () => {},
    });
  }

  private loadReturnForEdit(id: number) {
    this.returnService.getById(id).subscribe({
      next: (r) => {
        this.belegNummer = r.belegNummer;
        this.rueckgabedatum = r.rueckgabedatum.substring(0, 10);
        this.grund = r.grund;
        this.grundDetails = r.grundDetails || '';
        this.erstattungsbetrag = r.erstattungsbetrag;
        this.zahlungsart = r.zahlungsart;
        this.notizen = r.notizen || '';
        this.editInfo = {
          saleBelegNummer: r.sale?.belegNummer || '—',
          bikeInfo: r.bicycle
            ? `${r.bicycle.marke} ${r.bicycle.modell}`
            : '—',
          customerName: r.customer
            ? `${r.customer.vorname} ${r.customer.nachname}`
            : '—',
        };
      },
      error: () => {
        this.notificationService.error(this.t.saveError);
        this.router.navigate(['/returns']);
      },
    });
  }

  loadSales() {
    this.saleService.getAll().subscribe((s) => {
      this.sales = s;
      this.filteredSales = s;
    });
  }

  onSaleSearch() {
    this.saleDropdownOpen = true;
    const q = this.saleSearchText.toLowerCase().trim();
    if (!q) {
      this.filteredSales = this.sales;
      return;
    }
    this.filteredSales = this.sales.filter(
      (s) =>
        s.belegNummer.toLowerCase().includes(q) ||
        s.bikeInfo.toLowerCase().includes(q) ||
        s.buyerName.toLowerCase().includes(q),
    );
  }

  selectSale(s: SaleList) {
    this.selectedSaleId = s.id;
    this.selectedSale = s;
    this.erstattungsbetrag = s.gesamtbetrag;
    this.saleSearchText = `${s.belegNummer} – ${s.bikeInfo}`;
    this.saleDropdownOpen = false;
  }

  clearSaleSearch() {
    this.saleSearchText = '';
    this.selectedSaleId = 0;
    this.selectedSale = null;
    this.erstattungsbetrag = 0;
    this.filteredSales = this.sales;
    this.saleDropdownOpen = false;
  }

  submit() {
    if (!this.grund) return;

    if (this.editId) {
      const dto: ReturnUpdate = {
        belegNummer: this.belegNummer || undefined,
        rueckgabedatum: this.rueckgabedatum || undefined,
        grund: this.grund as ReturnReason,
        grundDetails: this.grundDetails || undefined,
        erstattungsbetrag: this.erstattungsbetrag,
        zahlungsart: this.zahlungsart,
        notizen: this.notizen || undefined,
      };
      this.returnService.update(this.editId, dto).subscribe({
        next: () => {
          this.notificationService.success(this.t.saveSuccess);
          this.router.navigate(['/returns']);
        },
        error: (err) =>
          this.notificationService.error(
            err.error?.error || this.t.returnSaveError,
          ),
      });
      return;
    }

    if (!this.selectedSaleId) return;

    const dto: ReturnCreate = {
      saleId: +this.selectedSaleId,
      rueckgabedatum: this.rueckgabedatum || undefined,
      grund: this.grund as ReturnReason,
      grundDetails: this.grundDetails || undefined,
      erstattungsbetrag: this.erstattungsbetrag,
      zahlungsart: this.zahlungsart,
      notizen: this.notizen || undefined,
      belegNummer: this.belegNummer || undefined,
    };

    this.returnService.create(dto).subscribe({
      next: () => this.router.navigate(['/returns']),
      error: (err) => alert(this.t.returnSaveError + ': ' + err.message),
    });
  }
}
