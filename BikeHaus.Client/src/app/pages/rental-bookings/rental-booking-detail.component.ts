import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RentalBookingService } from '../../services/rental-booking.service';
import { BicycleService } from '../../services/bicycle.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import { TranslationService } from '../../services/translation.service';
import { Bicycle, BikeCondition, RentalBooking, RentalBookingBike, RentalBookingStatus } from '../../models/models';

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
            (click)="goToUmwandeln()"
            *ngIf="booking.status === BookingStatus.Approved"
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
          <div class="info-row" *ngIf="booking.strasse || booking.hausNr">
            <span>Adresse:</span>
            <span>{{ booking.strasse }} {{ booking.hausNr }}</span>
          </div>
          <div class="info-row" *ngIf="booking.plz || booking.ort">
            <span>PLZ / Ort:</span>
            <span>{{ booking.plz }} {{ booking.ort }}</span>
          </div>
          <div class="info-row" *ngIf="booking.sprache">
            <span>{{ t.language }}:</span>
            <span>{{ booking.sprache }}</span>
          </div>
        </div>

        <div
          class="info-card"
          *ngIf="booking.bikes && booking.bikes.length > 0"
        >
          <h3>
            {{ t.bicycle }}
            <span *ngIf="booking.bikes.length > 1" class="bike-count-badge">{{
              booking.bikes.length
            }}</span>
          </h3>
          <div
            *ngFor="let bike of booking.bikes; let i = index"
            [class.bike-item]="booking.bikes.length > 1"
          >
            <div class="bike-item-header">
              <strong *ngIf="booking.bikes.length > 1">{{ i + 1 }}. Fahrrad</strong>
              <button
                class="btn btn-sm btn-change-bike"
                (click)="openBikeDialog(bike)"
              >
                Fahrrad ändern
              </button>
            </div>
            <div class="info-row">
              <span>{{ t.brandModel }}:</span>
              <strong>{{ bike.marke }} {{ bike.modell }}</strong>
            </div>
            <div class="info-row" *ngIf="bike.rahmennummer">
              <span>Rahmennr.:</span>
              <strong>{{ bike.rahmennummer }}</strong>
            </div>
            <div class="info-row" *ngIf="bike.rahmengroesse">
              <span>Rahmengröße:</span>
              <strong>{{ bike.rahmengroesse }}</strong>
            </div>
            <div class="info-row" *ngIf="booking.bikes.length > 1">
              <span>{{ t.from }}:</span>
              <strong>{{ bike.startDatum | date: 'dd.MM.yyyy' }}</strong>
            </div>
            <div class="info-row" *ngIf="booking.bikes.length > 1">
              <span>{{ t.to }}:</span>
              <strong>{{ bike.endDatum | date: 'dd.MM.yyyy' }}</strong>
            </div>
            <div
              class="info-row"
              *ngIf="bike.gesamtpreis && booking.bikes.length > 1"
            >
              <span>{{ t.total }}:</span>
              <strong>{{ bike.gesamtpreis | number: '1.2-2' }} €</strong>
            </div>
          </div>
        </div>

        <!-- Fahrrad-Wechsel Dialog -->
        <div class="modal-overlay" *ngIf="bikeDialogOpen()" (click)="closeBikeDialog()">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>{{ bikeDialogMode() === 'create' ? 'Neues Mietfahrrad anlegen' : 'Fahrrad ändern' }}</h3>
              <button class="modal-close" (click)="closeBikeDialog()">✕</button>
            </div>

            <!-- SELECT MODE -->
            <ng-container *ngIf="bikeDialogMode() === 'select'">
              <div class="modal-search">
                <input
                  type="text"
                  placeholder="Suchen (Marke, Modell)..."
                  [ngModel]="bikeSearch()"
                  (ngModelChange)="bikeSearch.set($event)"
                  class="search-input"
                />
              </div>
              <div class="modal-list">
                <div *ngIf="loadingBikes()" class="modal-loading">Wird geladen...</div>
                <div *ngIf="!loadingBikes() && filteredBikes().length === 0" class="modal-empty">
                  Keine verfügbaren Mietfahrräder für diesen Zeitraum.
                </div>
                <div
                  *ngFor="let b of filteredBikes()"
                  class="bike-option"
                  [class.selected]="selectedNewBicycleId() === b.id"
                  (click)="selectedNewBicycleId.set(b.id)"
                >
                  <div class="bike-option-name">{{ b.marke }} {{ b.modell }}</div>
                  <div class="bike-option-meta">
                    <span *ngIf="b.farbe">{{ b.farbe }}</span>
                    <span *ngIf="b.rahmengroesse"> · {{ b.rahmengroesse }}</span>
                    <span *ngIf="b.rahmennummer"> · {{ b.rahmennummer }}</span>
                  </div>
                </div>
                <div class="new-bike-divider" *ngIf="!loadingBikes()">
                  <button class="btn-new-bike" (click)="startCreateBike()">
                    + Neues Mietfahrrad anlegen
                  </button>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-outline" (click)="closeBikeDialog()">Abbrechen</button>
                <button
                  class="btn btn-primary"
                  [disabled]="!selectedNewBicycleId() || savingBike()"
                  (click)="confirmBikeChange()"
                >
                  {{ savingBike() ? 'Wird gespeichert...' : 'Übernehmen' }}
                </button>
              </div>
            </ng-container>

            <!-- CREATE MODE -->
            <ng-container *ngIf="bikeDialogMode() === 'create'">
              <div class="modal-create-form">
                <div class="form-row">
                  <label>Marke *</label>
                  <input type="text" [(ngModel)]="newBikeForm.marke" class="search-input" placeholder="z.B. Cube" />
                </div>
                <div class="form-row">
                  <label>Modell *</label>
                  <input type="text" [(ngModel)]="newBikeForm.modell" class="search-input" placeholder="z.B. Touring" />
                </div>
                <div class="form-row">
                  <label>Reifengröße *</label>
                  <input type="text" [(ngModel)]="newBikeForm.reifengroesse" class="search-input" placeholder="z.B. 28" />
                </div>
                <div class="form-row">
                  <label>Rahmennummer</label>
                  <input type="text" [(ngModel)]="newBikeForm.rahmennummer" class="search-input" placeholder="Optional" />
                </div>
                <div class="form-row">
                  <label>Farbe</label>
                  <input type="text" [(ngModel)]="newBikeForm.farbe" class="search-input" placeholder="Optional" />
                </div>
                <div class="form-row">
                  <label>Kaution (€)</label>
                  <input type="number" [(ngModel)]="newBikeForm.kaution" class="search-input" placeholder="Optional" min="0" />
                </div>
                <div class="form-section-title">Mietpreise (€)</div>
                <div class="price-grid">
                  <div class="form-row">
                    <label>1 Tag</label>
                    <input type="number" [(ngModel)]="newBikeForm.rentalPriceDay1" class="search-input" placeholder="—" min="0" />
                  </div>
                  <div class="form-row">
                    <label>2 Tage</label>
                    <input type="number" [(ngModel)]="newBikeForm.rentalPriceDay2" class="search-input" placeholder="—" min="0" />
                  </div>
                  <div class="form-row">
                    <label>3 Tage</label>
                    <input type="number" [(ngModel)]="newBikeForm.rentalPriceDay3" class="search-input" placeholder="—" min="0" />
                  </div>
                  <div class="form-row">
                    <label>4 Tage</label>
                    <input type="number" [(ngModel)]="newBikeForm.rentalPriceDay4" class="search-input" placeholder="—" min="0" />
                  </div>
                  <div class="form-row">
                    <label>5 Tage</label>
                    <input type="number" [(ngModel)]="newBikeForm.rentalPriceDay5" class="search-input" placeholder="—" min="0" />
                  </div>
                  <div class="form-row">
                    <label>6 Tage</label>
                    <input type="number" [(ngModel)]="newBikeForm.rentalPriceDay6" class="search-input" placeholder="—" min="0" />
                  </div>
                  <div class="form-row">
                    <label>7 Tage</label>
                    <input type="number" [(ngModel)]="newBikeForm.rentalPriceDay7" class="search-input" placeholder="—" min="0" />
                  </div>
                  <div class="form-row">
                    <label>+1 Tag (ab 8.)</label>
                    <input type="number" [(ngModel)]="newBikeForm.rentalPriceAdditionalDayAfter7" class="search-input" placeholder="—" min="0" />
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-outline" (click)="bikeDialogMode.set('select')">Zurück</button>
                <button
                  class="btn btn-primary"
                  [disabled]="!newBikeForm.marke || !newBikeForm.modell || !newBikeForm.reifengroesse || savingBike()"
                  (click)="createAndSelectBike()"
                >
                  {{ savingBike() ? 'Wird angelegt...' : 'Anlegen & auswählen' }}
                </button>
              </div>
            </ng-container>

          </div>
        </div>

        <div
          class="info-card"
          *ngIf="!booking.bikes || booking.bikes.length === 0"
        >
          <h3>{{ t.bicycle }}</h3>
          <div class="info-row" *ngIf="booking.bicycle">
            <span>{{ t.brandModel }}:</span>
            <strong
              >{{ booking.bicycle.marke }} {{ booking.bicycle.modell }}</strong
            >
          </div>
        </div>

        <!-- Ausweis Upload -->
        <div class="info-card ausweis-card">
          <h3>Ausweis-Foto</h3>
          <div *ngIf="booking.ausweisPhotoPath" class="info-row">
            <span>Status:</span>
            <span class="ausweis-badge has-photo">✓ Foto vorhanden</span>
          </div>
          <div *ngIf="!booking.ausweisPhotoPath" class="info-row">
            <span>Status:</span>
            <span class="ausweis-badge no-photo">Kein Foto</span>
          </div>
          <div class="ausweis-actions">
            <label class="btn btn-outline btn-upload" [class.uploading]="uploadingAusweis()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;margin-right:5px">
                <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
              </svg>
              {{ uploadingAusweis() ? 'Wird hochgeladen...' : (booking.ausweisPhotoPath ? 'Foto ersetzen' : 'Foto hochladen') }}
              <input type="file" accept="image/*,.pdf" style="display:none" (change)="onAusweisFileSelected($event)" [disabled]="uploadingAusweis()" />
            </label>
            <button
              *ngIf="booking.ausweisPhotoPath"
              class="btn btn-outline"
              (click)="downloadAusweis()"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle;margin-right:5px">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Ausweis herunterladen
            </button>
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
      .bike-count-badge {
        display: inline-block;
        background: var(--accent-primary, #6366f1);
        color: #fff;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        text-align: center;
        line-height: 20px;
        vertical-align: middle;
        margin-left: 4px;
      }
      .bike-item {
        border-top: 1px solid var(--border-light, #e2e8f0);
        padding-top: 8px;
        margin-top: 8px;
      }
      .bike-item:first-child {
        border-top: none;
        padding-top: 0;
        margin-top: 0;
      }
      .bike-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }
      .btn-change-bike {
        background: var(--bg-primary, #fff);
        border: 1.5px solid var(--border-light, #e2e8f0);
        color: var(--accent-primary, #6366f1);
        font-size: 0.78rem;
        padding: 3px 9px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.15s;
        margin-left: auto;
      }
      .btn-change-bike:hover {
        border-color: var(--accent-primary, #6366f1);
        background: rgba(99, 102, 241, 0.06);
      }
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .modal-box {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        width: 480px;
        max-width: 95vw;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(0,0,0,0.18);
        overflow: hidden;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 18px 20px 14px;
        border-bottom: 1.5px solid var(--border-light, #e2e8f0);
      }
      .modal-header h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
      }
      .modal-close {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
        color: var(--text-secondary, #64748b);
        line-height: 1;
        padding: 2px 6px;
      }
      .modal-close:hover {
        color: var(--text-primary);
      }
      .modal-search {
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
      }
      .search-input {
        width: 100%;
        padding: 8px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: 8px;
        font-size: 0.88rem;
        box-sizing: border-box;
      }
      .search-input:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
      }
      .modal-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
      }
      .modal-loading,
      .modal-empty {
        padding: 24px 20px;
        text-align: center;
        color: var(--text-secondary, #64748b);
        font-size: 0.88rem;
      }
      .bike-option {
        padding: 10px 20px;
        cursor: pointer;
        border-left: 3px solid transparent;
        transition: background 0.1s, border-color 0.1s;
      }
      .bike-option:hover {
        background: rgba(99, 102, 241, 0.05);
      }
      .bike-option.selected {
        background: rgba(99, 102, 241, 0.08);
        border-left-color: var(--accent-primary, #6366f1);
      }
      .bike-option-name {
        font-weight: 600;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .bike-option-meta {
        font-size: 0.78rem;
        color: var(--text-secondary, #64748b);
        margin-top: 2px;
      }
      .bike-option.busy {
        opacity: 0.7;
      }
      .busy-badge {
        display: inline-block;
        font-size: 0.68rem;
        font-weight: 700;
        padding: 1px 7px;
        border-radius: 50px;
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        letter-spacing: 0.02em;
      }
      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 14px 20px;
        border-top: 1.5px solid var(--border-light, #e2e8f0);
      }
      .new-bike-divider {
        padding: 12px 20px 8px;
        border-top: 1px dashed var(--border-light, #e2e8f0);
        margin-top: 4px;
      }
      .btn-new-bike {
        background: none;
        border: none;
        color: var(--accent-primary, #6366f1);
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        padding: 4px 0;
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      .btn-new-bike:hover {
        opacity: 0.75;
      }
      .modal-create-form {
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
        max-height: 55vh;
      }
      .form-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .form-row label {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-secondary, #64748b);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .form-section-title {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-secondary, #64748b);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding-top: 4px;
        border-top: 1px solid var(--border-light, #e2e8f0);
        margin-top: 2px;
      }
      .price-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .btn-sm {
        padding: 4px 10px;
        font-size: 0.8rem;
      }
      .btn-pdf {
        background: #2c5282;
        color: #fff;
        border-color: #2c5282;
      }
      .btn-pdf:hover {
        background: #2b6cb0;
        border-color: #2b6cb0;
      }
      .btn-pdf-kaution {
        background: #805ad5;
        color: #fff;
        border-color: #805ad5;
      }
      .btn-pdf-kaution:hover {
        background: #6b46c1;
        border-color: #6b46c1;
      }
      .ausweis-card {
        grid-column: 1 / -1;
      }
      .ausweis-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 50px;
        font-size: 0.78rem;
        font-weight: 600;
      }
      .ausweis-badge.has-photo {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }
      .ausweis-badge.no-photo {
        background: rgba(100, 116, 139, 0.1);
        color: #64748b;
      }
      .ausweis-actions {
        display: flex;
        gap: 10px;
        margin-top: 12px;
        flex-wrap: wrap;
      }
      .btn-upload {
        cursor: pointer;
      }
      .btn-upload.uploading {
        opacity: 0.65;
        pointer-events: none;
      }
    `,
  ],
})
export class RentalBookingDetailComponent implements OnInit {
  private service = inject(RentalBookingService);
  private bicycleService = inject(BicycleService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private translationService = inject(TranslationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  booking: RentalBooking | null = null;
  adminNotizen = '';

  BookingStatus = RentalBookingStatus;

  // Ausweis upload state
  uploadingAusweis = signal(false);

  // Bike-change dialog state
  bikeDialogOpen = signal(false);
  bikeDialogMode = signal<'select' | 'create'>('select');
  loadingBikes = signal(false);
  savingBike = signal(false);
  bikeSearch = signal('');
  selectedNewBicycleId = signal<number | null>(null);
  private activeBikeEntry: RentalBookingBike | null = null;
  private allRentableBikes = signal<Bicycle[]>([]);
  private busyBikeIds = signal<Set<number>>(new Set());
  filteredBikes = computed(() => {
    const term = this.bikeSearch().toLowerCase();
    const busy = this.busyBikeIds();
    const bikes = this.allRentableBikes().filter((b) => !busy.has(b.id));
    if (!term) return bikes;
    return bikes.filter(
      (b) =>
        b.marke.toLowerCase().includes(term) ||
        b.modell.toLowerCase().includes(term),
    );
  });

  newBikeForm = {
    marke: '',
    modell: '',
    reifengroesse: '28',
    rahmennummer: '',
    farbe: '',
    kaution: null as number | null,
    rentalPriceDay1: null as number | null,
    rentalPriceDay2: null as number | null,
    rentalPriceDay3: null as number | null,
    rentalPriceDay4: null as number | null,
    rentalPriceDay5: null as number | null,
    rentalPriceDay6: null as number | null,
    rentalPriceDay7: null as number | null,
    rentalPriceAdditionalDayAfter7: null as number | null,
  };

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

  goToUmwandeln() {
    if (!this.booking) return;
    this.router.navigate(['/rentals/new'], { queryParams: { bookingId: this.booking.id } });
  }

  downloadRechnungPdf() {
    if (!this.booking) return;
    this.service.downloadRechnungPdf(this.booking.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Mietrechnung-${this.booking!.buchungsNummer}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.notificationService.error(this.t.saveError),
    });
  }

  downloadKautionPdf() {
    if (!this.booking) return;
    this.service.downloadKautionPdf(this.booking.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Kautionsquittung-${this.booking!.buchungsNummer}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.notificationService.error(this.t.saveError),
    });
  }

  openBikeDialog(bike: RentalBookingBike) {
    this.activeBikeEntry = bike;
    this.bikeSearch.set('');
    this.selectedNewBicycleId.set(null);
    this.allRentableBikes.set([]);
    this.busyBikeIds.set(new Set());
    this.bikeDialogOpen.set(true);

    const start = bike.startDatum.substring(0, 10);
    const end = bike.endDatum.substring(0, 10);

    this.loadingBikes.set(true);
    this.bicycleService.getPaginated(1, 500, undefined, undefined, undefined, undefined, undefined, undefined, true).subscribe({
      next: (result) => {
        this.allRentableBikes.set(result.items);
        this.bicycleService.getAvailableForPeriod(start, end).subscribe({
          next: (available) => {
            const availableIds = new Set(available.map((b) => b.id));
            const busy = new Set(result.items.filter((b) => !availableIds.has(b.id)).map((b) => b.id));
            this.busyBikeIds.set(busy);
            this.loadingBikes.set(false);
          },
          error: () => this.loadingBikes.set(false),
        });
      },
      error: () => {
        this.loadingBikes.set(false);
        this.notificationService.error(this.t.saveError);
      },
    });
  }

  closeBikeDialog() {
    this.bikeDialogOpen.set(false);
    this.bikeDialogMode.set('select');
    this.activeBikeEntry = null;
    this.selectedNewBicycleId.set(null);
    this.allRentableBikes.set([]);
    this.busyBikeIds.set(new Set());
  }

  startCreateBike() {
    Object.assign(this.newBikeForm, {
      marke: '', modell: '', reifengroesse: '28', rahmennummer: '',
      farbe: '', kaution: null, rentalPriceDay1: null, rentalPriceDay2: null,
      rentalPriceDay3: null, rentalPriceDay4: null, rentalPriceDay5: null,
      rentalPriceDay6: null, rentalPriceDay7: null, rentalPriceAdditionalDayAfter7: null,
    });
    this.bikeDialogMode.set('create');
  }

  createAndSelectBike() {
    if (!this.newBikeForm.marke || !this.newBikeForm.modell || !this.newBikeForm.reifengroesse) return;
    this.savingBike.set(true);
    const f = this.newBikeForm;
    this.bicycleService.create({
      marke: f.marke.trim(),
      modell: f.modell.trim(),
      reifengroesse: f.reifengroesse.trim(),
      rahmennummer: f.rahmennummer.trim() || undefined,
      farbe: f.farbe.trim() || undefined,
      kaution: f.kaution ?? undefined,
      rentalPriceDay1: f.rentalPriceDay1 ?? undefined,
      rentalPriceDay2: f.rentalPriceDay2 ?? undefined,
      rentalPriceDay3: f.rentalPriceDay3 ?? undefined,
      rentalPriceDay4: f.rentalPriceDay4 ?? undefined,
      rentalPriceDay5: f.rentalPriceDay5 ?? undefined,
      rentalPriceDay6: f.rentalPriceDay6 ?? undefined,
      rentalPriceDay7: f.rentalPriceDay7 ?? undefined,
      rentalPriceAdditionalDayAfter7: f.rentalPriceAdditionalDayAfter7 ?? undefined,
      zustand: BikeCondition.Gebraucht,
      isRentable: true,
    }).subscribe({
      next: (newBike) => {
        this.allRentableBikes.update((list) => [...list, newBike]);
        this.selectedNewBicycleId.set(newBike.id);
        this.bikeDialogMode.set('select');
        this.savingBike.set(false);
        this.notificationService.success('Mietfahrrad angelegt und ausgewählt');
      },
      error: (err) => {
        this.savingBike.set(false);
        this.notificationService.error(err.error?.error || this.t.saveError);
      },
    });
  }

  confirmBikeChange() {
    if (!this.booking || !this.activeBikeEntry || !this.selectedNewBicycleId()) return;
    this.savingBike.set(true);
    this.service
      .updateBike(this.booking.id, this.activeBikeEntry.id, this.selectedNewBicycleId()!)
      .subscribe({
        next: (updated) => {
          this.booking = updated;
          this.savingBike.set(false);
          this.closeBikeDialog();
          this.notificationService.success(this.t.saveSuccess);
        },
        error: (err) => {
          this.savingBike.set(false);
          this.notificationService.error(err.error?.error || this.t.saveError);
        },
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

  onAusweisFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.booking) return;
    this.uploadingAusweis.set(true);
    this.service.uploadAusweis(this.booking.id, file).subscribe({
      next: (res) => {
        this.booking!.ausweisPhotoPath = res.path;
        this.uploadingAusweis.set(false);
        this.notificationService.success('Ausweis-Foto gespeichert');
        input.value = '';
      },
      error: () => {
        this.uploadingAusweis.set(false);
        this.notificationService.error(this.t.saveError);
        input.value = '';
      },
    });
  }

  downloadAusweis() {
    if (!this.booking) return;
    this.service.downloadAusweis(this.booking.id).subscribe({
      next: (blob) => {
        const ext = this.booking!.ausweisPhotoPath?.split('.').pop() || 'jpg';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Ausweis-${this.booking!.buchungsNummer}.${ext}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.notificationService.error(this.t.saveError),
    });
  }
}
