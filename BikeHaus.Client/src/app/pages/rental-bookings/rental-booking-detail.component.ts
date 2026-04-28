import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RentalBookingService } from '../../services/rental-booking.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { TranslationService } from '../../services/translation.service';
import { RentalBooking, RentalBookingStatus } from '../../models/models';

@Component({
  selector: 'app-rental-booking-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page" *ngIf="booking">
      <div class="page-header">
        <h1>{{ t.rentalBookingDetails }} {{ booking.buchungsNummer }}</h1>
        <div class="header-actions">
          <button
            class="btn btn-primary"
            (click)="approveBooking()"
            *ngIf="booking.status === BookingStatus.Pending"
          >
            {{ t.rentalBookingApprove }}
          </button>
          <button
            class="btn btn-success"
            (click)="convertToContract()"
            *ngIf="booking.status !== BookingStatus.Cancelled"
            title="Mietanfrage als Mietvertrag anlegen"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              style="vertical-align: middle; margin-right: 5px"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            In Mietvertrag umwandeln
          </button>
          <button
            class="btn btn-danger"
            (click)="cancelBooking()"
            *ngIf="booking.status !== BookingStatus.Cancelled"
          >
            {{ t.rentalBookingCancel }}
          </button>
          <a routerLink="/rental-bookings" class="btn btn-outline">
            {{ t.back }}
          </a>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <h3>{{ t.customer }}</h3>
          <div class="info-row">
            <span>{{ t.name }}:</span>
            <strong>{{ booking.vorname }} {{ booking.nachname }}</strong>
          </div>
          <div class="info-row" *ngIf="booking.email">
            <span>{{ t.email }}:</span>
            <span>{{ booking.email }}</span>
          </div>
          <div class="info-row" *ngIf="booking.telefon">
            <span>{{ t.phone }}:</span>
            <span>{{ booking.telefon }}</span>
          </div>
          <div class="info-row" *ngIf="booking.sprache">
            <span>{{ t.language }}:</span>
            <span>{{ booking.sprache }}</span>
          </div>
        </div>

        <div class="info-card">
          <h3>{{ t.bicycle }}</h3>
          <div class="info-row">
            <span>{{ t.brandModel }}:</span>
            <strong
              >{{ booking.bicycle.marke }} {{ booking.bicycle.modell }}</strong
            >
          </div>
          <div class="info-row" *ngIf="booking.bicycle.rahmennummer">
            <span>{{ t.frameNumber }}:</span>
            <span style="text-transform: uppercase">
              {{ booking.bicycle.rahmennummer }}
            </span>
          </div>
          <div class="info-row" *ngIf="booking.bicycle.farbe">
            <span>{{ t.color }}:</span>
            <span>{{ booking.bicycle.farbe }}</span>
          </div>
        </div>

        <div class="info-card">
          <h3>{{ t.rentalBookingDates }}</h3>
          <div class="info-row">
            <span>{{ t.from }}:</span>
            <strong>{{ booking.startDatum | date: 'dd.MM.yyyy' }}</strong>
          </div>
          <div class="info-row">
            <span>{{ t.to }}:</span>
            <strong>{{ booking.endDatum | date: 'dd.MM.yyyy' }}</strong>
          </div>
          <div class="info-row">
            <span>{{ t.total }}:</span>
            <strong>{{ booking.gesamtpreis | number: '1.2-2' }} €</strong>
          </div>
          <div class="info-row">
            <span>{{ t.status }}:</span>
            <span class="status-badge" [class]="getStatusClass(booking.status)">
              {{ getStatusText(booking.status) }}
            </span>
          </div>
          <div class="info-row">
            <span>{{ t.rentalBookingCreatedAt }}:</span>
            <span>{{ booking.createdAt | date: 'dd.MM.yyyy HH:mm' }}</span>
          </div>
          <div class="info-row" *ngIf="booking.approvedAt">
            <span>{{ t.rentalBookingApprovedAt }}:</span>
            <span>{{ booking.approvedAt | date: 'dd.MM.yyyy HH:mm' }}</span>
          </div>
          <div class="info-row" *ngIf="booking.cancelledAt">
            <span>{{ t.rentalBookingCancelledAt }}:</span>
            <span>{{ booking.cancelledAt | date: 'dd.MM.yyyy HH:mm' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1100px;
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
        gap: 10px;
        align-items: center;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 16px;
      }
      .info-card {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 20px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
      }
      .info-card h3 {
        margin-bottom: 12px;
        font-size: 1rem;
        font-weight: 700;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 4px 0;
        font-size: 0.9rem;
      }
      .accessory-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
      }
      .accessory-table th {
        text-align: left;
        padding: 8px 10px;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-secondary, #64748b);
        border-bottom: 1.5px solid var(--border-light, #e2e8f0);
        background: var(--table-stripe, #f8fafc);
      }
      .accessory-table td {
        padding: 8px 10px;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
      }
      textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.9rem;
        resize: vertical;
      }
      textarea:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }
      .empty {
        color: var(--text-secondary, #64748b);
        font-style: italic;
      }
      .status-badge {
        display: inline-block;
        padding: 4px 11px;
        border-radius: 50px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      .status-badge.pending {
        background: rgba(245, 158, 11, 0.08);
        color: #b45309;
      }
      .status-badge.approved {
        background: rgba(16, 185, 129, 0.08);
        color: #10b981;
      }
      .status-badge.cancelled {
        background: rgba(239, 68, 68, 0.08);
        color: #ef4444;
      }
      .btn {
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
      .btn-success {
        background: #10b981;
        color: #fff;
        border-color: #10b981;
      }
      .btn-success:hover {
        background: #059669;
        border-color: #059669;
      }
      .btn-danger {
        background: var(--accent-danger, #ef4444);
        color: #fff;
        border-color: var(--accent-danger, #ef4444);
      }
    `,
  ],
})
export class RentalBookingDetailComponent implements OnInit {
  private service = inject(RentalBookingService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private translationService = inject(TranslationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  booking: RentalBooking | null = null;
  adminNotizen = '';

  BookingStatus = RentalBookingStatus;

  get t() {
    return this.translationService.translations();
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/rental-bookings']);
      return;
    }

    this.service.getById(id).subscribe({
      next: (booking) => {
        this.booking = booking;
        this.adminNotizen = booking.adminNotizen || '';
      },
      error: () => {
        this.notificationService.error(this.t.saveError);
        this.router.navigate(['/rental-bookings']);
      },
    });
  }

  getStatusClass(status: RentalBookingStatus) {
    if (status === RentalBookingStatus.Approved) return 'approved';
    if (status === RentalBookingStatus.Cancelled) return 'cancelled';
    return 'pending';
  }

  getStatusText(status: RentalBookingStatus) {
    if (status === RentalBookingStatus.Approved)
      return this.t.rentalBookingApproved;
    if (status === RentalBookingStatus.Cancelled)
      return this.t.rentalBookingCancelled;
    return this.t.rentalBookingPending;
  }

  approveBooking() {
    if (!this.booking) return;
    this.dialogService
      .confirm({
        title: this.t.confirm,
        message: this.t.rentalBookingApproveConfirm,
      })
      .then((confirmed) => {
        if (!confirmed) return;
        this.service
          .approve(this.booking!.id, {
            adminNotizen: this.adminNotizen || undefined,
          })
          .subscribe({
            next: (updated) => {
              this.booking = updated;
              this.notificationService.success(this.t.saveSuccess);
            },
            error: (err) => {
              this.notificationService.error(
                err.error?.error || this.t.saveError,
              );
            },
          });
      });
  }

  convertToContract() {
    if (!this.booking) return;
    this.router.navigate(['/rentals/new'], {
      queryParams: { bookingId: this.booking.id },
    });
  }

  cancelBooking() {
    if (!this.booking) return;
    this.dialogService
      .danger(this.t.cancel, this.t.rentalBookingCancelConfirm)
      .then((confirmed) => {
        if (!confirmed) return;
        this.service
          .cancel(this.booking!.id, {
            adminNotizen: this.adminNotizen || undefined,
          })
          .subscribe({
            next: (updated) => {
              this.booking = updated;
              this.notificationService.success(this.t.cancelSuccess);
            },
            error: (err) => {
              this.notificationService.error(
                err.error?.error || this.t.saveError,
              );
            },
          });
      });
  }
}
