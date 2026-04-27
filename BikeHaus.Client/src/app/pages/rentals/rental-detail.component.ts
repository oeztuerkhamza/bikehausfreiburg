import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RentalService } from '../../services/rental.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { Rental, RentalUpdate } from '../../models/models';

@Component({
  selector: 'app-rental-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page" *ngIf="rental">
      <div class="page-header">
        <h1>Mietvertrag {{ rental.mietvertragNummer }}</h1>
        <div class="header-actions">
          <a
            [routerLink]="['/rentals/edit', rental.id]"
            class="btn btn-outline"
          >
            ✏️ Bearbeiten
          </a>
          <button class="btn btn-outline" (click)="printMietvertrag()">
            🖨️ Mietvertrag drucken
          </button>
          <button class="btn btn-outline" (click)="printKaution()">
            🖨️ Kautionsquittung drucken
          </button>
          <a routerLink="/rentals" class="btn btn-outline">Zurück</a>
        </div>
      </div>

      <!-- Info cards -->
      <div class="info-grid">
        <div class="info-card">
          <h3>Mieter</h3>
          <div class="info-row">
            <span>Name:</span><strong>{{ rental.customer.fullName }}</strong>
          </div>
          <div class="info-row" *ngIf="rental.customer.fullAddress">
            <span>Adresse:</span><span>{{ rental.customer.fullAddress }}</span>
          </div>
          <div class="info-row" *ngIf="rental.customer.telefon">
            <span>Telefon:</span><span>{{ rental.customer.telefon }}</span>
          </div>
          <div class="info-row" *ngIf="rental.customer.email">
            <span>E-Mail:</span><span>{{ rental.customer.email }}</span>
          </div>
          <div class="info-row" *ngIf="rental.ausweisnNr">
            <span>Ausweis-Nr.:</span><span>{{ rental.ausweisnNr }}</span>
          </div>
        </div>

        <div class="info-card">
          <h3>Fahrrad</h3>
          <div class="info-row">
            <span>Marke/Modell:</span
            ><strong
              >{{ rental.bicycle.marke }} {{ rental.bicycle.modell }}</strong
            >
          </div>
          <div class="info-row" *ngIf="rental.bicycle.rahmennummer">
            <span>Rahmennummer:</span
            ><span>{{ rental.bicycle.rahmennummer }}</span>
          </div>
          <div class="info-row" *ngIf="rental.bicycle.farbe">
            <span>Farbe:</span><span>{{ rental.bicycle.farbe }}</span>
          </div>
          <div class="info-row" *ngIf="rental.bicycle.reifengroesse">
            <span>Reifengröße:</span
            ><span>{{ rental.bicycle.reifengroesse }}</span>
          </div>
        </div>

        <div class="info-card">
          <h3>Mietdetails</h3>
          <div class="info-row">
            <span>Von:</span
            ><strong>{{ rental.startDatum | date: 'dd.MM.yyyy' }}</strong>
          </div>
          <div class="info-row">
            <span>Bis:</span
            ><strong>{{ rental.endDatum | date: 'dd.MM.yyyy' }}</strong>
          </div>
          <div class="info-row">
            <span>Gesamtmiete:</span
            ><strong>{{ rental.gesamtmiete | number: '1.2-2' }} €</strong>
          </div>
          <div class="info-row" *ngIf="rental.rabatt > 0">
            <span>Rabatt:</span
            ><strong style="color: var(--accent-success, #10b981)"
              >- {{ rental.rabatt | number: '1.2-2' }} €</strong
            >
          </div>
          <div class="info-row">
            <span>Kaution:</span
            ><strong>{{ rental.kaution | number: '1.2-2' }} €</strong>
          </div>
          <div class="info-row">
            <span>Zahlungsart:</span
            ><span>{{ getZahlungsartText(rental.zahlungsart) }}</span>
          </div>
          <div class="info-row">
            <span>Kaution zurück:</span>
            <span
              [class.text-success]="rental.kautionZurueckgegeben"
              [class.text-danger]="!rental.kautionZurueckgegeben"
            >
              {{ rental.kautionZurueckgegeben ? 'Ja' : 'Nein' }}
            </span>
          </div>
          <div class="info-row">
            <span>Zustand:</span
            ><span>{{ getZustandText(rental.zustandBeiUebergabe) }}</span>
          </div>
          <div class="info-row">
            <span>Status:</span>
            <span
              class="status-badge"
              [class]="getStatusClass(rental.status)"
              >{{ getStatusText(rental.status) }}</span
            >
          </div>
        </div>
      </div>

      <!-- Actions for active rentals -->
      <div class="action-bar" *ngIf="rental.status === 'Active'">
        <button class="btn btn-success" (click)="returnBicycle()">
          ✅ Fahrrad zurückgeben
        </button>
        <button
          class="btn btn-warning"
          (click)="markKautionReturned()"
          *ngIf="!rental.kautionZurueckgegeben"
        >
          💰 Kaution zurückgeben
        </button>
        <button class="btn btn-danger" (click)="cancelRental()">
          ✖ Stornieren
        </button>
      </div>
      <div
        class="action-bar"
        *ngIf="rental.status === 'Returned' && !rental.kautionZurueckgegeben"
      >
        <button class="btn btn-success" (click)="markKautionReturned()">
          💰 Kaution zurückgeben
        </button>
      </div>

      <!-- Notes -->
      <div class="info-card" *ngIf="rental.notizen" style="margin-top: 20px;">
        <h3>Notizen</h3>
        <p>{{ rental.notizen }}</p>
      </div>

      <!-- Delete -->
      <div class="action-bar" style="margin-top: 20px;">
        <button class="btn btn-danger" (click)="deleteRental()">
          🗑 Löschen
        </button>
      </div>
    </div>

    <!-- Signature Modal for Kaution Return -->
    <div
      class="modal-backdrop"
      *ngIf="showSignatureModal"
      (click)="closeSignatureModal()"
    >
      <div class="modal modal-sig" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>💰 Kaution zurückgeben</h3>
          <button class="modal-close" (click)="closeSignatureModal()">✕</button>
        </div>
        <div class="modal-body sig-body">
          <p class="sig-info">
            Kaution:
            <strong>{{ rental?.kaution | number: '1.2-2' }} €</strong> wird an
            <strong>{{ rental?.customer?.fullName }}</strong>
            zurückgegeben.<br />
            Bitte Unterschrift des Mieters zur Bestätigung.
          </p>
          <div class="sig-canvas-wrap">
            <canvas
              id="kautionSignatureCanvas"
              width="460"
              height="160"
              (mousedown)="onSigMouseDown($event)"
              (mousemove)="onSigMouseMove($event)"
              (mouseup)="onSigEnd()"
              (mouseleave)="onSigEnd()"
              (touchstart)="onSigTouchStart($event)"
              (touchmove)="onSigTouchMove($event)"
              (touchend)="onSigEnd()"
            >
            </canvas>
            <span class="sig-placeholder" *ngIf="sigIsEmpty"
              >Hier unterschreiben ...</span
            >
          </div>
          <div class="sig-actions">
            <button class="btn btn-outline" (click)="clearSignature()">
              🗑 Löschen
            </button>
            <button
              class="btn btn-success"
              (click)="confirmKautionReturn()"
              [disabled]="sigIsEmpty"
            >
              ✅ Kaution bestätigt
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- PDF Preview Modal -->
    <div
      class="modal-backdrop"
      *ngIf="showPdfPreview"
      (click)="closePdfPreview()"
    >
      <div class="modal modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ pdfPreviewTitle }}</h3>
          <div class="modal-header-actions">
            <button class="btn btn-sm" (click)="downloadCurrentPdf()">
              📥 Download
            </button>
            <button class="btn btn-sm" (click)="printCurrentPdf()">
              🖨️ Drucken
            </button>
            <button class="modal-close" (click)="closePdfPreview()">✕</button>
          </div>
        </div>
        <div class="modal-body pdf-preview-body">
          <iframe
            *ngIf="pdfPreviewUrl"
            [src]="pdfPreviewUrl"
            class="pdf-iframe"
          ></iframe>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1000px;
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
        flex-wrap: wrap;
        gap: 12px;
      }
      .header-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }
      .info-card {
        background: var(--bg-card);
        border-radius: var(--radius-lg, 14px);
        border: 1px solid var(--border-light);
        box-shadow: var(--shadow-sm);
        padding: 20px;
      }
      .info-card h3 {
        margin: 0 0 14px 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--accent-primary);
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid var(--border-light);
        font-size: 0.88rem;
      }
      .info-row:last-child {
        border-bottom: none;
      }
      .info-row span:first-child {
        color: var(--text-muted);
      }
      .text-success {
        color: var(--accent-success, #10b981);
        font-weight: 600;
      }
      .text-danger {
        color: var(--accent-danger, #ef4444);
        font-weight: 600;
      }
      .status-badge {
        display: inline-block;
        padding: 4px 11px;
        border-radius: 50px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .status-active {
        background: rgba(16, 185, 129, 0.08);
        color: #10b981;
      }
      .status-returned {
        background: rgba(59, 130, 246, 0.08);
        color: #3b82f6;
      }
      .status-cancelled {
        background: rgba(100, 116, 139, 0.08);
        color: #64748b;
      }
      .action-bar {
        display: flex;
        gap: 12px;
        margin-top: 20px;
        flex-wrap: wrap;
      }
      .btn {
        padding: 10px 20px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        font-size: 0.88rem;
        cursor: pointer;
        border: none;
        transition: var(--transition-fast);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
      }
      .btn-outline {
        background: transparent;
        border: 1.5px solid var(--border-color);
        color: var(--text-primary);
      }
      .btn-outline:hover {
        background: var(--bg-secondary);
      }
      .btn-sm {
        padding: 6px 12px;
        font-size: 0.82rem;
      }
      .btn-success {
        background: var(--accent-success, #10b981);
        color: white;
      }
      .btn-success:hover {
        background: #059669;
      }
      .btn-warning {
        background: #f59e0b;
        color: white;
      }
      .btn-warning:hover {
        background: #d97706;
      }
      .btn-danger {
        background: var(--accent-danger, #ef4444);
        color: white;
      }
      .btn-danger:hover {
        background: #dc2626;
      }
      /* Modal */
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-xl, 20px);
        width: 90%;
        max-width: 420px;
        overflow: hidden;
        box-shadow: var(--shadow-xl);
      }
      .modal-lg {
        max-width: 900px;
        height: 85vh;
        display: flex;
        flex-direction: column;
      }
      .modal-header {
        padding: 16px 22px;
        border-bottom: 1px solid var(--border-light);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-header h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
      }
      .modal-header-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .modal-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: var(--text-muted);
        padding: 4px 8px;
      }
      .modal-close:hover {
        background: var(--bg-secondary);
        border-radius: 6px;
      }
      .pdf-preview-body {
        flex: 1;
        padding: 0;
        overflow: hidden;
      }
      .pdf-iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
      .modal-sig {
        max-width: 540px;
      }
      .sig-body {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .sig-info {
        font-size: 0.9rem;
        color: var(--text-secondary);
        line-height: 1.7;
        margin: 0;
      }
      .sig-canvas-wrap {
        position: relative;
        border: 2px dashed var(--border-color);
        border-radius: var(--radius-md, 10px);
        background: #fff;
        cursor: crosshair;
        overflow: hidden;
      }
      #kautionSignatureCanvas {
        display: block;
        width: 100%;
        height: 160px;
        touch-action: none;
      }
      .sig-placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        color: #94a3b8;
        pointer-events: none;
      }
      .sig-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
    `,
  ],
})
export class RentalDetailComponent implements OnInit {
  private rentalService = inject(RentalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);

  rental: Rental | null = null;
  showPdfPreview = false;
  pdfPreviewUrl: any = null;
  pdfPreviewTitle = '';
  private currentPdfBlob: Blob | null = null;
  private currentPdfFilename = '';

  // Signature modal
  showSignatureModal = false;
  sigIsEmpty = true;
  private sigDrawing = false;

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadRental(id);
  }

  loadRental(id: number) {
    this.rentalService.getById(id).subscribe({
      next: (rental) => (this.rental = rental),
      error: () => {
        this.notificationService.error('Mietvertrag nicht gefunden');
        this.router.navigate(['/rentals']);
      },
    });
  }

  getZustandText(z: string): string {
    const map: Record<string, string> = {
      SehrGut: 'Sehr gut',
      Gut: 'Gut',
      Gebrauchsspuren: 'Gebrauchsspuren',
    };
    return map[z] || z;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Active: 'status-active',
      Returned: 'status-returned',
      Cancelled: 'status-cancelled',
    };
    return map[status] || '';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Active: 'Aktiv',
      Returned: 'Zurückgegeben',
      Cancelled: 'Storniert',
    };
    return map[status] || status;
  }

  getZahlungsartText(z: string): string {
    const map: Record<string, string> = {
      Bar: 'Bar',
      PayPal: 'PayPal',
      Karte: 'Karte',
      Überweisung: 'Überweisung',
    };
    return map[z] || z;
  }

  returnBicycle() {
    if (!this.rental) return;
    this.dialogService
      .confirm({
        title: 'Fahrrad zurückgeben',
        message: 'Möchten Sie das Fahrrad als zurückgegeben markieren?',
        type: 'confirm',
        confirmText: 'Zurückgeben',
      })
      .then((ok) => {
        if (ok) {
          this.rentalService.returnBicycle(this.rental!.id).subscribe({
            next: (r) => {
              this.rental = r;
              this.notificationService.success('Fahrrad zurückgegeben');
            },
            error: (err) =>
              this.notificationService.error(err.error?.error || 'Fehler'),
          });
        }
      });
  }

  markKautionReturned() {
    if (!this.rental) return;
    this.showSignatureModal = true;
    this.sigIsEmpty = true;
    setTimeout(() => this.clearSignature());
  }

  closeSignatureModal() {
    this.showSignatureModal = false;
  }

  private getSigCanvas(): HTMLCanvasElement {
    return document.getElementById(
      'kautionSignatureCanvas',
    ) as HTMLCanvasElement;
  }

  clearSignature() {
    const c = this.getSigCanvas();
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    this.sigIsEmpty = true;
    this.sigDrawing = false;
  }

  onSigMouseDown(e: MouseEvent) {
    this.sigDrawing = true;
    this.sigIsEmpty = false;
    const c = this.getSigCanvas();
    const ctx = c.getContext('2d')!;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
    const r = c.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - r.left, e.clientY - r.top);
  }

  onSigMouseMove(e: MouseEvent) {
    if (!this.sigDrawing) return;
    const c = this.getSigCanvas();
    const ctx = c.getContext('2d')!;
    const r = c.getBoundingClientRect();
    ctx.lineTo(e.clientX - r.left, e.clientY - r.top);
    ctx.stroke();
  }

  onSigEnd() {
    this.sigDrawing = false;
  }

  onSigTouchStart(e: TouchEvent) {
    e.preventDefault();
    const t = e.touches[0];
    this.onSigMouseDown({
      clientX: t.clientX,
      clientY: t.clientY,
    } as MouseEvent);
  }

  onSigTouchMove(e: TouchEvent) {
    e.preventDefault();
    const t = e.touches[0];
    this.onSigMouseMove({
      clientX: t.clientX,
      clientY: t.clientY,
    } as MouseEvent);
  }

  confirmKautionReturn() {
    if (this.sigIsEmpty || !this.rental) return;
    const signatureData = this.getSigCanvas().toDataURL('image/png');
    this.closeSignatureModal();
    const update: RentalUpdate = {
      kautionZurueckgegeben: true,
      kautionRueckgabeUnterschrift: signatureData,
    };
    this.rentalService.update(this.rental.id, update).subscribe({
      next: (r) => {
        this.rental = r;
        this.notificationService.success(
          'Kaution zurückgegeben – Unterschrift erfasst',
        );
      },
      error: (err) =>
        this.notificationService.error(err.error?.error || 'Fehler'),
    });
  }

  cancelRental() {
    if (!this.rental) return;
    this.dialogService
      .confirm({
        title: 'Stornieren',
        message: 'Möchten Sie diese Vermietung wirklich stornieren?',
        type: 'danger',
        confirmText: 'Stornieren',
      })
      .then((ok) => {
        if (ok) {
          this.rentalService.cancel(this.rental!.id).subscribe({
            next: (r) => {
              this.rental = r;
              this.notificationService.success('Vermietung storniert');
            },
            error: (err) =>
              this.notificationService.error(err.error?.error || 'Fehler'),
          });
        }
      });
  }

  // ── PDF ──
  printMietvertrag() {
    if (!this.rental) return;
    this.rentalService.downloadMietvertragPdf(this.rental.id).subscribe({
      next: (blob) => this.printBlob(blob),
      error: () => this.notificationService.error('Fehler beim Drucken'),
    });
  }

  printKaution() {
    if (!this.rental) return;
    this.rentalService.downloadKautionsquittungPdf(this.rental.id).subscribe({
      next: (blob) => this.printBlob(blob),
      error: () => this.notificationService.error('Fehler beim Drucken'),
    });
  }

  previewMietvertrag() {
    if (!this.rental) return;
    this.rentalService.downloadMietvertragPdf(this.rental.id).subscribe({
      next: (blob) => {
        this.currentPdfBlob = blob;
        this.currentPdfFilename = `Mietvertrag-${this.rental!.mietvertragNummer}.pdf`;
        this.pdfPreviewUrl = URL.createObjectURL(blob);
        this.pdfPreviewTitle = 'Mietvertrag';
        this.showPdfPreview = true;
      },
      error: () => this.notificationService.error('Fehler beim Laden des PDF'),
    });
  }

  previewKaution() {
    if (!this.rental) return;
    this.rentalService.downloadKautionsquittungPdf(this.rental.id).subscribe({
      next: (blob) => {
        this.currentPdfBlob = blob;
        this.currentPdfFilename = `Kautionsquittung-${this.rental!.mietvertragNummer}.pdf`;
        this.pdfPreviewUrl = URL.createObjectURL(blob);
        this.pdfPreviewTitle = 'Kautionsquittung';
        this.showPdfPreview = true;
      },
      error: () => this.notificationService.error('Fehler beim Laden des PDF'),
    });
  }

  downloadCurrentPdf() {
    if (!this.currentPdfBlob) return;
    const url = URL.createObjectURL(this.currentPdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.currentPdfFilename;
    a.click();
    URL.revokeObjectURL(url);
  }

  printCurrentPdf() {
    if (!this.currentPdfBlob) return;
    const url = URL.createObjectURL(this.currentPdfBlob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 1000);
    };
  }

  closePdfPreview() {
    if (this.pdfPreviewUrl) URL.revokeObjectURL(this.pdfPreviewUrl);
    this.pdfPreviewUrl = null;
    this.showPdfPreview = false;
    this.currentPdfBlob = null;
  }

  deleteRental() {
    if (!this.rental) return;
    this.dialogService
      .danger(
        'Löschen',
        `Möchten Sie die Vermietung "${this.rental.mietvertragNummer}" wirklich löschen?`,
      )
      .then((ok) => {
        if (ok) {
          this.rentalService.delete(this.rental!.id).subscribe({
            next: () => {
              this.notificationService.success('Vermietung gelöscht');
              this.router.navigate(['/rentals']);
            },
            error: (err) =>
              this.notificationService.error(
                err.error?.error || 'Fehler beim Löschen',
              ),
          });
        }
      });
  }

  private printBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 1000);
    };
  }
}
