import {
  Component,
  OnInit,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { BicycleService } from '../../services/bicycle.service';
import { NotificationService } from '../../services/notification.service';
import { TranslationService } from '../../services/translation.service';
import { DialogService } from '../../services/dialog.service';
import { FormDraftService } from '../../services/form-draft.service';
import { Bicycle, BicycleImage } from '../../models/models';
import { environment } from '../../../environments/environment';
import { getConfiguredRentalPriceLines } from '../../utils/rental-pricing';
import {
  FRAME_HEIGHT_OPTIONS,
  isPlainFrameHeight,
  parseFrameHeightCm,
  riderHeightForFrameValue,
  RiderHeightRange,
} from '../../utils/frame-height';
import { DraftRestoredBannerComponent } from '../../components/draft-restored-banner/draft-restored-banner.component';

interface RentalForm {
  marke: string;
  modell: string;
  rahmennummer: string;
  rahmengroesse: string;
  farbe: string;
  reifengroesse: string;
  fahrradtyp: string;
  art: string;
  beschreibung: string;
  isRentable: boolean;
  rentalPriceDay1: number | null;
  rentalPriceDay2: number | null;
  rentalPriceDay3: number | null;
  rentalPriceDay4: number | null;
  rentalPriceDay5: number | null;
  rentalPriceDay6: number | null;
  rentalPriceDay7: number | null;
  rentalPriceAdditionalDayAfter7: number | null;
  kaution: number | null;
  /** Interne Nummer am Rahmen — nur im System, nie auf der Website. */
  fahrradnummer: string;
  koerpergroesseVonCm: number | null;
  koerpergroesseBisCm: number | null;
}

/** `form` besteht komplett aus getippten Werten — Fotos gehen erst nach dem
 * ersten Speichern (Bild-Upload braucht eine bikeId), das Neu-Formular kennt
 * also gar keine Dateien; kein Hinweis auf verlorene Fotos nötig. */
const DRAFT_KEY = 'bikehaus-draft-mietfahrrad-form';
const DRAFT_MAX_AGE_MS = 8 * 60 * 60 * 1000;

@Component({
  selector: 'app-mietfahrrad-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DraftRestoredBannerComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>{{ isEdit ? t.mietfahrradEdit : t.mietfahrradNew }}</h1>
          <p class="page-subtitle" *ngIf="isEdit && bike()">
            {{ bike()!.marke }} {{ bike()!.modell }}
          </p>
        </div>
        <div class="header-actions">
          <!-- Räder werden meist in Serie gepflegt (Preise, Körpergröße). Ohne
               diese Pfeile geht es für jedes Rad über die Liste zurück. -->
          <div class="bike-nav" *ngIf="isEdit && navBikes().length > 1">
            <button
              type="button"
              class="btn btn-outline btn-nav"
              [disabled]="!prevBike()"
              [title]="
                prevBike()
                  ? t.mietfahrradPrev + ': ' + bikeLabel(prevBike()!)
                  : t.mietfahrradPrev
              "
              [attr.aria-label]="t.mietfahrradPrev"
              (click)="goToNeighbour(prevBike())"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span class="bike-nav-position">
              <ng-container *ngIf="navIndex() >= 0">
                {{ navIndex() + 1 }} / {{ navBikes().length }}
              </ng-container>
              <ng-container *ngIf="navIndex() < 0">
                – / {{ navBikes().length }}
              </ng-container>
            </span>
            <button
              type="button"
              class="btn btn-outline btn-nav"
              [disabled]="!nextBike()"
              [title]="
                nextBike()
                  ? t.mietfahrradNext + ': ' + bikeLabel(nextBike()!)
                  : t.mietfahrradNext
              "
              [attr.aria-label]="t.mietfahrradNext"
              (click)="goToNeighbour(nextBike())"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
          <a routerLink="/mietfahrraeder" class="btn btn-outline">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {{ t.back }}
          </a>
        </div>
      </div>

      <p
        class="nav-inactive-hint"
        *ngIf="isEdit && navBikes().length > 1 && navIndex() < 0 && !pageLoading()"
      >
        {{ t.mietfahrradNavInactive }}
      </p>

      <app-draft-restored-banner
        *ngIf="draftRestored"
        (discard)="discardDraft()"
      ></app-draft-restored-banner>

      <div class="loading-wrap" *ngIf="pageLoading()">
        <div class="spinner"></div>
      </div>

      <form *ngIf="!pageLoading()" (ngSubmit)="submit()" #f="ngForm">
        <div class="form-layout">
          <!-- LEFT: Grundinfos + Preise -->
          <div class="form-column">
            <!-- Basic Info -->
            <div class="card">
              <h2 class="card-title">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  <path
                    d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h2"
                  />
                </svg>
                {{ t.mietfahrradBasicInfo }}
              </h2>
              <div class="form-grid">
                <div class="field">
                  <label>{{ t.mietfahrradBrand }} *</label>
                  <input
                    [(ngModel)]="form.marke"
                    name="marke"
                    required
                    placeholder="z.B. Cube"
                  />
                </div>
                <div class="field">
                  <label>{{ t.mietfahrradModel }}</label>
                  <input
                    [(ngModel)]="form.modell"
                    name="modell"
                    placeholder="z.B. Cross Pro"
                  />
                </div>
                <div class="field">
                  <label>{{ t.frameNumber }}</label>
                  <input
                    [(ngModel)]="form.rahmennummer"
                    name="rahmennummer"
                    placeholder="z.B. BHF-2026-001"
                  />
                </div>
                <div class="field">
                  <label>Fahrradnummer</label>
                  <input
                    [(ngModel)]="form.fahrradnummer"
                    name="fahrradnummer"
                    placeholder="z.B. E7"
                  />
                  <small class="field-hint">Nur intern — steht nie auf der Website.</small>
                </div>
                <div class="field">
                  <label>Körpergröße von (cm)</label>
                  <input
                    type="number"
                    min="80"
                    max="230"
                    [(ngModel)]="form.koerpergroesseVonCm"
                    name="koerpergroesseVonCm"
                    placeholder="z.B. 165"
                  />
                </div>
                <div class="field">
                  <label>Körpergröße bis (cm)</label>
                  <input
                    type="number"
                    min="80"
                    max="230"
                    [(ngModel)]="form.koerpergroesseBisCm"
                    name="koerpergroesseBisCm"
                    placeholder="z.B. 180"
                  />
                  <small class="field-hint">Wird Kunden bei der Fahrradauswahl angezeigt.</small>
                  <!-- Eigene Werte werden nie überschrieben; weicht der
                       Vorschlag ab, ist er einen Klick entfernt. -->
                  <small class="field-hint" *ngIf="suggestionDiffers()">
                    {{ t.mietfahrradSuggestion }}:
                    {{ frameSuggestion()!.von }}–{{ frameSuggestion()!.bis }} cm
                    <button type="button" class="link-button" (click)="applySuggestion()">
                      {{ t.mietfahrradApplySuggestion }}
                    </button>
                  </small>
                </div>
                <div class="field">
                  <label>{{ t.mietfahrradType }}</label>
                  <select [(ngModel)]="form.fahrradtyp" name="fahrradtyp">
                    <option value="">Bitte wählen</option>
                    <option>Cityrad</option>
                    <option>Trekkingrad</option>
                    <option>MTB</option>
                    <option>E-Bike</option>
                    <option>Rennrad</option>
                    <option>Gravelbike</option>
                    <option>Kinderrad</option>
                    <option>Hollandrad</option>
                    <option>Lastenrad</option>
                    <option>Sonstiges</option>
                  </select>
                </div>
                <div class="field">
                  <label>{{ t.mietfahrradSize }}</label>
                  <input
                    [(ngModel)]="form.reifengroesse"
                    name="reifengroesse"
                    placeholder="z.B. 28"
                  />
                </div>
                <div class="field">
                  <label>{{ t.mietfahrradFrameHeight }}</label>
                  <select
                    [(ngModel)]="form.rahmengroesse"
                    (ngModelChange)="onFrameHeightChange()"
                    name="rahmengroesse"
                  >
                    <option value="">Bitte wählen</option>
                    <!-- Altwerte wie "54cm / M" gehen nicht verloren: sie
                         bleiben als eigene Option stehen, bis jemand eine
                         Höhe auswählt. -->
                    <option *ngIf="legacyFrameValue()" [value]="legacyFrameValue()">
                      {{ legacyFrameValue() }}
                    </option>
                    <option *ngFor="let option of frameHeightOptions" [value]="option">
                      {{ option }}
                    </option>
                  </select>
                  <small class="field-hint" *ngIf="frameSuggestion()">
                    {{ t.mietfahrradFrameHeightHint }}
                    {{ frameSuggestion()!.von }}–{{ frameSuggestion()!.bis }} cm
                  </small>
                </div>
                <div class="field">
                  <label>{{ t.mietfahrradColor }}</label>
                  <div class="color-chips">
                    <button
                      type="button"
                      *ngFor="let c of colorOptions"
                      class="color-chip"
                      [class.selected]="isColorSelected(form.farbe, c.value)"
                      [style.--chip-color]="c.hex"
                      (click)="form.farbe = toggleColor(form.farbe, c.value)"
                    >
                      <span class="chip-dot"></span>
                      <span>{{ c.value }}</span>
                    </button>
                  </div>
                </div>
                <div class="field full">
                  <label>{{ t.mietfahrradDescription }}</label>
                  <textarea
                    [(ngModel)]="form.beschreibung"
                    name="beschreibung"
                    rows="3"
                    placeholder="Ausstattung, Besonderheiten..."
                  ></textarea>
                </div>
              </div>

              <!-- Rentable toggle -->
              <div class="rentable-toggle">
                <label class="toggle-label">
                  <div
                    class="toggle-switch"
                    [class.on]="form.isRentable"
                    (click)="form.isRentable = !form.isRentable"
                  >
                    <div class="toggle-knob"></div>
                  </div>
                  <div>
                    <strong>{{ t.mietfahrradIsRentable }}</strong>
                    <span
                      >Dieses Fahrrad auf der Website für Mietanfragen
                      anzeigen</span
                    >
                  </div>
                </label>
              </div>
            </div>

            <!-- Rental Prices -->
            <div class="card">
              <h2 class="card-title">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
                {{ t.mietfahrradRentalPrices }}
              </h2>
              <p class="card-hint">
                Preise in € pro Tag für 1 bis 7 Tage. Danach wird der
                Zusatzpreis pro weiterem Tag verwendet.
              </p>
              <div class="price-field" style="margin-bottom: 14px;">
                <label>Kaution (€)</label>
                <div class="price-input-wrap">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    [(ngModel)]="form.kaution"
                    name="kaution"
                    placeholder="z.B. 300"
                  />
                  <span class="currency">€</span>
                </div>
              </div>
              <div class="price-grid">
                <div class="price-field">
                  <label>{{ t.mietfahrradPriceDay1 }}</label>
                  <div class="price-input-wrap">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      [(ngModel)]="form.rentalPriceDay1"
                      name="priceDay1"
                      placeholder="–"
                    />
                    <span class="currency">€</span>
                  </div>
                </div>
                <div class="price-field">
                  <label>{{ t.mietfahrradPriceDay2 }}</label>
                  <div class="price-input-wrap">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      [(ngModel)]="form.rentalPriceDay2"
                      name="priceDay2"
                      placeholder="–"
                    />
                    <span class="currency">€</span>
                  </div>
                </div>
                <div class="price-field">
                  <label>{{ t.mietfahrradPriceDay3 }}</label>
                  <div class="price-input-wrap">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      [(ngModel)]="form.rentalPriceDay3"
                      name="priceDay3"
                      placeholder="–"
                    />
                    <span class="currency">€</span>
                  </div>
                </div>
                <div class="price-field">
                  <label>{{ t.mietfahrradPriceDay4 }}</label>
                  <div class="price-input-wrap">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      [(ngModel)]="form.rentalPriceDay4"
                      name="priceDay4"
                      placeholder="–"
                    />
                    <span class="currency">€</span>
                  </div>
                </div>
                <div class="price-field">
                  <label>{{ t.mietfahrradPriceDay5 }}</label>
                  <div class="price-input-wrap">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      [(ngModel)]="form.rentalPriceDay5"
                      name="priceDay5"
                      placeholder="–"
                    />
                    <span class="currency">€</span>
                  </div>
                </div>
                <div class="price-field">
                  <label>{{ t.mietfahrradPriceDay6 }}</label>
                  <div class="price-input-wrap">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      [(ngModel)]="form.rentalPriceDay6"
                      name="priceDay6"
                      placeholder="–"
                    />
                    <span class="currency">€</span>
                  </div>
                </div>
                <div class="price-field featured">
                  <label>{{ t.mietfahrradPriceDay7 }} ⭐</label>
                  <div class="price-input-wrap">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      [(ngModel)]="form.rentalPriceDay7"
                      name="priceDay7"
                      placeholder="–"
                    />
                    <span class="currency">€</span>
                  </div>
                </div>
                <div class="price-field">
                  <label>{{ t.mietfahrradPriceAdditionalDayAfter7 }}</label>
                  <div class="price-input-wrap">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      [(ngModel)]="form.rentalPriceAdditionalDayAfter7"
                      name="priceAdditionalDayAfter7"
                      placeholder="–"
                    />
                    <span class="currency">€/Tag</span>
                  </div>
                </div>
              </div>
              <div class="price-preview" *ngIf="getPricePreview().length > 0">
                <span class="preview-label">Vorschau:</span>
                <span
                  class="preview-pill"
                  *ngFor="let item of getPricePreview()"
                >
                  {{ item.shortLabel }} {{ item.price | number: '1.0-0' }}€
                </span>
                <span
                  class="preview-pill preview-pill-accent"
                  *ngIf="form.rentalPriceAdditionalDayAfter7 != null"
                >
                  +1T
                  {{ form.rentalPriceAdditionalDayAfter7 | number: '1.0-0' }}€
                </span>
              </div>
            </div>

            <!-- Submit -->
            <div class="form-actions">
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="saving()"
              >
                <svg
                  *ngIf="!saving()"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <svg
                  *ngIf="saving()"
                  class="spin"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                {{ saving() ? t.saving : t.save }}
              </button>
              <a routerLink="/mietfahrraeder" class="btn btn-outline">{{
                t.cancel
              }}</a>
            </div>
          </div>

          <!-- RIGHT: Fotos -->
          <div class="form-column">
            <div class="card" *ngIf="isEdit">
              <h2 class="card-title">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                {{ t.mietfahrradPhotos }}
                <span class="photo-count-badge">{{ images().length }}</span>
              </h2>

              <!-- Upload area -->
              <div
                class="upload-area"
                (click)="fileInput.click()"
                (dragover)="$event.preventDefault()"
                (drop)="onDrop($event)"
              >
                <input
                  #fileInput
                  type="file"
                  accept="image/*"
                  multiple
                  (change)="onFilesSelected($event)"
                  style="display:none"
                />
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p>Fotos hochladen</p>
                <span>Klicken oder Dateien hierher ziehen</span>
                <div class="upload-progress" *ngIf="uploadingCount() > 0">
                  {{ uploadingCount() }} Bild(er) werden hochgeladen...
                </div>
              </div>

              <p class="photo-order-hint" *ngIf="images().length > 1">
                {{ t.mietfahrradPhotoOrderHint }}
              </p>

              <!-- Photo grid -->
              <div class="photo-grid" *ngIf="images().length > 0">
                <div
                  class="photo-item"
                  *ngFor="let img of images(); let i = index"
                  [class.is-cover]="i === 0"
                  [class.dragging]="draggingIndex() === i"
                  [class.drag-over]="dragOverIndex() === i"
                  draggable="true"
                  (dragstart)="onPhotoDragStart(i)"
                  (dragover)="onPhotoDragOver($event, i)"
                  (dragleave)="onPhotoDragLeave(i)"
                  (drop)="onPhotoDrop(i)"
                  (dragend)="onPhotoDragEnd()"
                >
                  <img [src]="getImageUrl(img.filePath)" [alt]="'Foto'" />

                  <div class="cover-badge" *ngIf="i === 0">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"
                      />
                    </svg>
                    {{ t.mietfahrradTitelbild }}
                  </div>
                  <div class="photo-order" *ngIf="i !== 0">{{ i + 1 }}</div>

                  <button
                    class="photo-delete"
                    type="button"
                    (click)="deleteImage(img)"
                    title="Löschen"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>

                  <div class="photo-controls">
                    <button
                      type="button"
                      class="ctrl"
                      [disabled]="i === 0"
                      (click)="moveImage(i, i - 1)"
                      [title]="t.mietfahrradMoveLeft"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                      >
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="ctrl ctrl-cover"
                      *ngIf="i !== 0"
                      (click)="setAsCover(i)"
                      [title]="t.mietfahrradSetAsTitelbild"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.2"
                      >
                        <path
                          d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="ctrl"
                      [disabled]="i === images().length - 1"
                      (click)="moveImage(i, i + 1)"
                      [title]="t.mietfahrradMoveRight"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <p class="photo-hint" *ngIf="images().length === 0">
                Noch keine Fotos vorhanden.
              </p>
            </div>

            <div class="card info-card" *ngIf="!isEdit">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <p>Fotos können nach dem Speichern hochgeladen werden.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1200px;
        margin: 0 auto;
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
        align-items: flex-start;
        margin-bottom: 28px;
        flex-wrap: wrap;
        gap: 12px;
      }
      .page-header h1 {
        margin: 0 0 4px;
        font-size: 1.5rem;
        font-weight: 800;
      }
      .page-subtitle {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.88rem;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .bike-nav {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .btn-nav {
        padding: 10px 12px;
      }
      .bike-nav-position {
        min-width: 62px;
        text-align: center;
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--text-secondary);
        font-variant-numeric: tabular-nums;
      }
      .nav-inactive-hint {
        margin: -18px 0 22px;
        font-size: 0.82rem;
        color: var(--text-secondary);
      }

      .loading-wrap {
        display: flex;
        justify-content: center;
        padding: 4rem;
      }
      .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid var(--border-light);
        border-top-color: var(--accent-primary);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .form-layout {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: 24px;
      }
      .form-column {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .card {
        background: var(--bg-card);
        border: 1px solid var(--border-light);
        border-radius: 16px;
        padding: 24px;
      }
      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 20px;
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .card-title svg {
        color: var(--accent-primary);
        flex-shrink: 0;
      }
      .card-hint {
        font-size: 0.82rem;
        color: var(--text-muted);
        margin: -12px 0 16px;
      }

      .photo-count-badge {
        margin-left: auto;
        background: var(--accent-primary);
        color: #fff;
        border-radius: 20px;
        padding: 1px 8px;
        font-size: 0.75rem;
        font-weight: 700;
      }

      .field-hint {
        display: block;
        margin-top: 4px;
        font-size: 0.72rem;
        color: var(--text-secondary, #64748b);
      }
      .link-button {
        background: none;
        border: none;
        padding: 0;
        margin-left: 4px;
        font: inherit;
        color: var(--accent-primary);
        font-weight: 600;
        text-decoration: underline;
        cursor: pointer;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .field.full {
        grid-column: 1 / -1;
      }
      .field label {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .field input,
      .field select,
      .field textarea {
        padding: 10px 12px;
        border: 1.5px solid var(--border-color);
        border-radius: 10px;
        background: var(--bg-primary);
        color: var(--text-primary);
        font-size: 0.9rem;
        transition: border-color 0.2s;
        resize: vertical;
      }
      .field input:focus,
      .field select:focus,
      .field textarea:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.08));
      }

      .color-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .color-chip {
        border: 1px solid var(--border-color);
        background: var(--bg-primary);
        border-radius: 999px;
        padding: 6px 10px;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        cursor: pointer;
        color: var(--text-primary);
        font-size: 0.8rem;
        transition: border-color 0.2s ease;
      }
      .color-chip:hover {
        border-color: var(--accent-primary);
      }
      .color-chip.selected {
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 2px
          var(--accent-primary-light, rgba(99, 102, 241, 0.08));
      }
      .chip-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--chip-color, #ccc);
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      .rentable-toggle {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid var(--border-light);
      }
      .toggle-label {
        display: flex;
        align-items: center;
        gap: 14px;
        cursor: pointer;
      }
      .toggle-label > div {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .toggle-label strong {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .toggle-label span {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      .toggle-switch {
        width: 48px;
        height: 26px;
        border-radius: 13px;
        background: var(--border-color);
        position: relative;
        transition: background 0.25s;
        flex-shrink: 0;
        cursor: pointer;
      }
      .toggle-switch.on {
        background: var(--accent-primary);
      }
      .toggle-knob {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #fff;
        transition: left 0.25s;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
      }
      .toggle-switch.on .toggle-knob {
        left: 25px;
      }

      .price-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .price-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .price-field label {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .price-field.featured label {
        color: var(--accent-primary);
      }
      .price-input-wrap {
        position: relative;
      }
      .price-input-wrap input {
        width: 100%;
        padding: 9px 48px 9px 12px;
        border: 1.5px solid var(--border-color);
        border-radius: 10px;
        background: var(--bg-primary);
        color: var(--text-primary);
        font-size: 0.92rem;
        font-weight: 600;
        transition: border-color 0.2s;
      }
      .price-field.featured .price-input-wrap input {
        border-color: var(--accent-primary);
      }
      .price-input-wrap input:focus {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
      }
      .currency {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-muted);
        pointer-events: none;
      }
      .price-preview {
        margin-top: 14px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .preview-label {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-secondary);
      }
      .preview-pill {
        display: inline-flex;
        align-items: center;
        padding: 5px 10px;
        border-radius: 999px;
        background: var(--bg-primary);
        border: 1px solid var(--border-light);
        font-size: 0.78rem;
        font-weight: 700;
      }
      .preview-pill-accent {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
      }

      .form-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .upload-area {
        border: 2px dashed var(--border-color);
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition:
          border-color 0.2s,
          background 0.2s;
        margin-bottom: 16px;
      }
      .upload-area:hover {
        border-color: var(--accent-primary);
        background: rgba(99, 102, 241, 0.03);
      }
      .upload-area svg {
        color: var(--text-muted);
        margin-bottom: 8px;
      }
      .upload-area p {
        margin: 0 0 4px;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      .upload-area span {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      .upload-progress {
        margin-top: 10px;
        font-size: 0.82rem;
        color: var(--accent-primary);
        font-weight: 600;
      }

      .photo-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }
      .photo-item {
        position: relative;
        border-radius: 10px;
        overflow: hidden;
        aspect-ratio: 4/3;
        background: var(--bg-primary);
      }
      .photo-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .photo-delete {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: rgba(239, 68, 68, 0.9);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        opacity: 0;
        transition: opacity 0.15s;
        padding: 0;
      }
      .photo-item:hover .photo-delete {
        opacity: 1;
      }
      .photo-order {
        position: absolute;
        bottom: 5px;
        left: 5px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        font-size: 0.65rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .photo-hint {
        font-size: 0.82rem;
        color: var(--text-muted);
        text-align: center;
        margin: 8px 0 0;
      }
      .photo-order-hint {
        font-size: 0.78rem;
        color: var(--text-muted);
        margin: 0 0 12px;
      }

      .photo-item {
        cursor: grab;
        border: 2px solid transparent;
      }
      .photo-item.is-cover {
        border-color: var(--accent-primary);
      }
      .photo-item.dragging {
        opacity: 0.4;
      }
      .photo-item.drag-over {
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.2));
      }
      .cover-badge {
        position: absolute;
        top: 5px;
        left: 5px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 7px 2px 5px;
        border-radius: 999px;
        background: var(--accent-primary);
        color: #fff;
        font-size: 0.62rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        z-index: 2;
      }
      .photo-controls {
        position: absolute;
        bottom: 6px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 5px;
        opacity: 0;
        transition: opacity 0.15s;
        z-index: 2;
      }
      .photo-item:hover .photo-controls {
        opacity: 1;
      }
      .photo-controls .ctrl {
        width: 24px;
        height: 24px;
        border-radius: 7px;
        border: none;
        background: rgba(17, 24, 39, 0.78);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        transition:
          background 0.15s,
          opacity 0.15s;
      }
      .photo-controls .ctrl:hover:not(:disabled) {
        background: var(--accent-primary);
      }
      .photo-controls .ctrl:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
      .photo-controls .ctrl-cover:hover {
        background: #f59e0b;
      }

      .info-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        text-align: center;
        padding: 2rem;
      }
      .info-card svg {
        color: var(--text-muted);
        opacity: 0.5;
      }
      .info-card p {
        color: var(--text-secondary);
        font-size: 0.88rem;
        margin: 0;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 18px;
        border-radius: 10px;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        border: 1.5px solid transparent;
        transition: all 0.15s;
        text-decoration: none;
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn-primary {
        background: var(--accent-primary);
        color: #fff;
        border-color: var(--accent-primary);
      }
      .btn-primary:hover:not(:disabled) {
        opacity: 0.88;
      }
      .btn-outline {
        background: transparent;
        border-color: var(--border-color);
        color: var(--text-primary);
      }
      .btn-outline:hover {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
        text-decoration: none;
      }
      .spin {
        animation: spin 0.7s linear infinite;
      }

      @media (max-width: 900px) {
        .form-layout {
          grid-template-columns: 1fr;
        }
        .form-grid {
          grid-template-columns: 1fr;
        }
        .price-grid {
          grid-template-columns: 1fr 1fr 1fr;
        }
      }
    `,
  ],
})
export class MietfahrradFormComponent implements OnInit, OnDestroy {
  private bicycleService = inject(BicycleService);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);
  private dialogService = inject(DialogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private formDraftService = inject(FormDraftService);
  draftRestored = false;
  private draftAutosaveHandle: ReturnType<typeof setInterval> | undefined;

  isEdit = false;
  bikeId = signal<number | null>(null);
  bike = signal<Bicycle | null>(null);
  images = signal<BicycleImage[]>([]);
  /** Aktive Mietfahrräder für die Vor/Zurück-Pfeile (Reihenfolge wie in der Liste). */
  navBikes = signal<Bicycle[]>([]);
  /** Formularstand nach dem Laden — Vergleichsbasis für "ungespeichert". */
  private pristineForm = '';
  private readonly navCollator = new Intl.Collator('de', {
    sensitivity: 'base',
    numeric: true,
  });

  frameHeightOptions = FRAME_HEIGHT_OPTIONS;
  /** Gespeicherter Freitext, der keine Rahmenhöhe ist — bleibt wählbar. */
  legacyFrameValue = signal<string>('');
  /** Rahmenhöhe vor der letzten Auswahl: daran hängt, ob ein Vorschlag noch "unberührt" ist. */
  private frameHeightBefore = '';

  /** Position des offenen Rads in der aktiven Liste; -1 wenn es nicht aktiv ist. */
  navIndex = computed(() => {
    const id = this.bikeId();
    if (id === null) return -1;
    return this.navBikes().findIndex((b) => b.id === id);
  });

  /**
   * Stelle, an der das offene Rad in der aktiven Liste stünde. Gebraucht für
   * inaktive Räder: die Pfeile sollen dann zum alphabetischen Nachbarn führen
   * statt gar nichts zu tun.
   */
  private navInsertionIndex = computed(() => {
    const current = this.bike();
    const bikes = this.navBikes();
    if (!current) return bikes.length;
    const label = this.bikeLabel(current);
    const idx = bikes.findIndex(
      (b) => this.navCollator.compare(this.bikeLabel(b), label) > 0,
    );
    return idx < 0 ? bikes.length : idx;
  });

  prevBike = computed(() => {
    const bikes = this.navBikes();
    const i = this.navIndex();
    if (i >= 0) return i > 0 ? bikes[i - 1] : null;
    const at = this.navInsertionIndex();
    return at > 0 ? bikes[at - 1] : null;
  });

  nextBike = computed(() => {
    const bikes = this.navBikes();
    const i = this.navIndex();
    if (i >= 0) return i < bikes.length - 1 ? bikes[i + 1] : null;
    const at = this.navInsertionIndex();
    return at < bikes.length ? bikes[at] : null;
  });
  pageLoading = signal(true);
  saving = signal(false);
  uploadingCount = signal(0);
  draggingIndex = signal<number | null>(null);
  dragOverIndex = signal<number | null>(null);

  form: RentalForm = {
    marke: '',
    modell: '',
    rahmennummer: '',
    rahmengroesse: '',
    farbe: '',
    reifengroesse: '',
    fahrradtyp: '',
    art: '',
    beschreibung: '',
    isRentable: true,
    rentalPriceDay1: null,
    rentalPriceDay2: null,
    rentalPriceDay3: null,
    rentalPriceDay4: null,
    rentalPriceDay5: null,
    rentalPriceDay6: null,
    rentalPriceDay7: null,
    rentalPriceAdditionalDayAfter7: null,
    kaution: null,
    fahrradnummer: '',
    koerpergroesseVonCm: null,
    koerpergroesseBisCm: null,
  };

  colorOptions = [
    { value: 'Schwarz', hex: '#111827' },
    { value: 'Weiß', hex: '#f9fafb' },
    { value: 'Silber', hex: '#9ca3af' },
    { value: 'Grau', hex: '#6b7280' },
    { value: 'Blau', hex: '#2563eb' },
    { value: 'Rot', hex: '#dc2626' },
    { value: 'Grün', hex: '#16a34a' },
    { value: 'Gelb', hex: '#facc15' },
    { value: 'Orange', hex: '#f97316' },
    { value: 'Braun', hex: '#92400e' },
  ];

  get t() {
    return this.translationService.translations();
  }

  ngOnInit() {
    // Beim Sprung von Rad zu Rad bleibt die Route dieselbe, Angular verwendet
    // die Komponente also wieder — mit route.snapshot stünden beim zweiten Rad
    // noch die Daten des ersten im Formular.
    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      this.isEdit = !!idParam;
      this.bikeId.set(idParam ? +idParam : null);
      if (this.bikeId()) {
        this.pageLoading.set(true);
        this.loadBike();
        if (!this.navBikes().length) this.loadNavBikes();
        window.scrollTo({ top: 0 });
      } else {
        this.pageLoading.set(false);
        this.restoreDraftIfAny();
        if (!this.draftAutosaveHandle) {
          this.draftAutosaveHandle = setInterval(
            () => this.saveDraftSnapshot(),
            3000,
          );
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.draftAutosaveHandle) clearInterval(this.draftAutosaveHandle);
  }

  private restoreDraftIfAny() {
    const draft = this.formDraftService.load<RentalForm>(
      DRAFT_KEY,
      DRAFT_MAX_AGE_MS,
    );
    if (!draft) return;

    this.form.marke = draft.marke ?? '';
    this.form.modell = draft.modell ?? '';
    this.form.rahmennummer = draft.rahmennummer ?? '';
    this.form.rahmengroesse = draft.rahmengroesse ?? '';
    this.form.farbe = draft.farbe ?? '';
    this.form.reifengroesse = draft.reifengroesse ?? '';
    this.form.fahrradtyp = draft.fahrradtyp ?? '';
    this.form.art = draft.art ?? '';
    this.form.beschreibung = draft.beschreibung ?? '';
    this.form.isRentable = draft.isRentable ?? true;
    this.form.rentalPriceDay1 = draft.rentalPriceDay1 ?? null;
    this.form.rentalPriceDay2 = draft.rentalPriceDay2 ?? null;
    this.form.rentalPriceDay3 = draft.rentalPriceDay3 ?? null;
    this.form.rentalPriceDay4 = draft.rentalPriceDay4 ?? null;
    this.form.rentalPriceDay5 = draft.rentalPriceDay5 ?? null;
    this.form.rentalPriceDay6 = draft.rentalPriceDay6 ?? null;
    this.form.rentalPriceDay7 = draft.rentalPriceDay7 ?? null;
    this.form.rentalPriceAdditionalDayAfter7 =
      draft.rentalPriceAdditionalDayAfter7 ?? null;
    this.form.kaution = draft.kaution ?? null;
    this.form.fahrradnummer = draft.fahrradnummer ?? '';
    this.form.koerpergroesseVonCm = draft.koerpergroesseVonCm ?? null;
    this.form.koerpergroesseBisCm = draft.koerpergroesseBisCm ?? null;

    this.draftRestored = true;
  }

  private saveDraftSnapshot() {
    const draft: RentalForm = {
      marke: this.form.marke,
      modell: this.form.modell,
      rahmennummer: this.form.rahmennummer,
      rahmengroesse: this.form.rahmengroesse,
      farbe: this.form.farbe,
      reifengroesse: this.form.reifengroesse,
      fahrradtyp: this.form.fahrradtyp,
      art: this.form.art,
      beschreibung: this.form.beschreibung,
      isRentable: this.form.isRentable,
      rentalPriceDay1: this.form.rentalPriceDay1,
      rentalPriceDay2: this.form.rentalPriceDay2,
      rentalPriceDay3: this.form.rentalPriceDay3,
      rentalPriceDay4: this.form.rentalPriceDay4,
      rentalPriceDay5: this.form.rentalPriceDay5,
      rentalPriceDay6: this.form.rentalPriceDay6,
      rentalPriceDay7: this.form.rentalPriceDay7,
      rentalPriceAdditionalDayAfter7: this.form.rentalPriceAdditionalDayAfter7,
      kaution: this.form.kaution,
      fahrradnummer: this.form.fahrradnummer,
      koerpergroesseVonCm: this.form.koerpergroesseVonCm,
      koerpergroesseBisCm: this.form.koerpergroesseBisCm,
    };
    this.formDraftService.save(DRAFT_KEY, draft);
  }

  discardDraft() {
    this.formDraftService.clear(DRAFT_KEY);
    if (typeof window !== 'undefined') window.location.reload();
  }

  /**
   * Aktive Mietfahrräder in genau der Reihenfolge der Übersichtsliste, damit
   * die Pfeile dieselbe Nachbarschaft haben wie die Karten davor.
   */
  private loadNavBikes() {
    this.bicycleService
      .getPaginated(
        1,
        1000,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true,
      )
      .subscribe({
        // Die Navigation ist Komfort: scheitert der Aufruf, verschwinden nur
        // die Pfeile, das Formular bleibt benutzbar.
        next: (result) => this.navBikes.set(this.sortNavBikes(result.items)),
        error: () => this.navBikes.set([]),
      });
  }

  private sortNavBikes(bikes: Bicycle[]): Bicycle[] {
    return [...bikes].sort(
      (a, b) =>
        this.navCollator.compare(a.marke ?? '', b.marke ?? '') ||
        this.navCollator.compare(a.modell ?? '', b.modell ?? ''),
    );
  }

  bikeLabel(bike: Bicycle): string {
    return `${bike.marke ?? ''} ${bike.modell ?? ''}`.trim();
  }

  /**
   * Wechselt zum Nachbarrad. Nicht gespeicherte Eingaben gehen dabei verloren,
   * also vorher nachfragen — sonst ist eine halbe Preistabelle weg.
   */
  async goToNeighbour(bike: Bicycle | null) {
    if (!bike) return;
    if (this.isDirty()) {
      const proceed = await this.dialogService.confirm({
        title: this.t.mietfahrradUnsavedTitle,
        message: this.t.mietfahrradUnsavedMessage,
        type: 'danger',
        confirmText: this.t.mietfahrradUnsavedDiscard,
      });
      if (!proceed) return;
    }
    this.router.navigate(['/mietfahrraeder/edit', bike.id]);
  }

  private isDirty(): boolean {
    return this.pristineForm !== JSON.stringify(this.form);
  }

  loadBike() {
    this.bicycleService.getById(this.bikeId()!).subscribe({
      next: (bike) => {
        this.bike.set(bike);
        this.form = {
          marke: bike.marke,
          modell: bike.modell ?? '',
          rahmennummer: bike.rahmennummer ?? '',
          rahmengroesse: bike.rahmengroesse ?? '',
          farbe: bike.farbe ?? '',
          reifengroesse: bike.reifengroesse ?? '',
          fahrradtyp: bike.fahrradtyp ?? '',
          art: bike.art ?? '',
          beschreibung: bike.beschreibung ?? '',
          isRentable: bike.isRentable,
          rentalPriceDay1: bike.rentalPriceDay1 ?? null,
          rentalPriceDay2: bike.rentalPriceDay2 ?? null,
          rentalPriceDay3: bike.rentalPriceDay3 ?? null,
          rentalPriceDay4: bike.rentalPriceDay4 ?? null,
          rentalPriceDay5: bike.rentalPriceDay5 ?? null,
          rentalPriceDay6: bike.rentalPriceDay6 ?? null,
          rentalPriceDay7: bike.rentalPriceDay7 ?? null,
          rentalPriceAdditionalDayAfter7:
            bike.rentalPriceAdditionalDayAfter7 ?? null,
          kaution: bike.kaution ?? null,
          fahrradnummer: bike.fahrradnummer ?? '',
          koerpergroesseVonCm: bike.koerpergroesseVonCm ?? null,
          koerpergroesseBisCm: bike.koerpergroesseBisCm ?? null,
        };
        this.images.set(bike.images ?? []);
        // "54" und "54 cm" tragen dieselbe Information wie die Option "54 cm" —
        // das darf normalisiert werden. Ein ganzer Satz nicht: der bleibt
        // sichtbar, sonst verschwände er beim nächsten Speichern unbemerkt.
        const rawFrame = this.form.rahmengroesse;
        const frameCm = parseFrameHeightCm(rawFrame);
        if (frameCm !== null && isPlainFrameHeight(rawFrame)) {
          this.form.rahmengroesse = `${frameCm} cm`;
          this.legacyFrameValue.set('');
        } else {
          this.legacyFrameValue.set(rawFrame.trim());
        }
        this.frameHeightBefore = this.form.rahmengroesse;
        // Snapshot erst nach der Normalisierung, damit das Formular nicht
        // schon beim Öffnen als geändert gilt.
        this.pristineForm = JSON.stringify(this.form);
        this.pageLoading.set(false);
      },
      error: () => {
        this.notificationService.error(this.t.saveError);
        this.pageLoading.set(false);
      },
    });
  }

  /** Empfohlene Körpergröße zur gewählten Rahmenhöhe. */
  frameSuggestion(): RiderHeightRange | null {
    return riderHeightForFrameValue(this.form.rahmengroesse);
  }

  /** True, wenn der Vorschlag von den eingetragenen Werten abweicht. */
  suggestionDiffers(): boolean {
    const suggestion = this.frameSuggestion();
    if (!suggestion) return false;
    return (
      this.form.koerpergroesseVonCm !== suggestion.von ||
      this.form.koerpergroesseBisCm !== suggestion.bis
    );
  }

  applySuggestion() {
    const suggestion = this.frameSuggestion();
    if (!suggestion) return;
    this.form.koerpergroesseVonCm = suggestion.von;
    this.form.koerpergroesseBisCm = suggestion.bis;
  }

  /**
   * Füllt die Körpergröße aus der Rahmenhöhe — aber nur, solange dort nichts
   * Eigenes steht: leere Felder oder der Vorschlag der vorherigen Rahmenhöhe.
   * Von Hand eingetragene Werte bleiben, dafür gibt es den Übernehmen-Knopf.
   */
  onFrameHeightChange() {
    const previous = this.frameHeightBefore;
    this.frameHeightBefore = this.form.rahmengroesse;

    // Sobald eine echte Höhe gewählt ist, hat der alte Freitext keinen Zweck mehr.
    if (parseFrameHeightCm(this.form.rahmengroesse) !== null) {
      this.legacyFrameValue.set('');
    }

    const suggestion = this.frameSuggestion();
    if (!suggestion) return;

    const previousSuggestion = riderHeightForFrameValue(previous);
    const untouched =
      (this.form.koerpergroesseVonCm === null &&
        this.form.koerpergroesseBisCm === null) ||
      (previousSuggestion !== null &&
        this.form.koerpergroesseVonCm === previousSuggestion.von &&
        this.form.koerpergroesseBisCm === previousSuggestion.bis);
    if (!untouched) return;

    this.applySuggestion();
  }

  submit() {
    if (!this.form.marke.trim()) {
      this.notificationService.error('Marke ist ein Pflichtfeld.');
      return;
    }
    this.saving.set(true);
    const dto = {
      marke: this.form.marke,
      modell: this.form.modell || '',
      rahmennummer: this.form.rahmennummer || null,
      rahmengroesse: this.form.rahmengroesse || null,
      farbe: this.form.farbe || null,
      reifengroesse: this.form.reifengroesse || '',
      fahrradtyp: this.form.fahrradtyp || null,
      art: this.form.art || null,
      beschreibung: this.form.beschreibung || null,
      status: this.bike()?.status ?? 'Available',
      zustand: this.bike()?.zustand ?? 'Gebraucht',
      isRentable: this.form.isRentable,
      rentalPriceDay1: this.form.rentalPriceDay1 || null,
      rentalPriceDay2: this.form.rentalPriceDay2 || null,
      rentalPriceDay3: this.form.rentalPriceDay3 || null,
      rentalPriceDay4: this.form.rentalPriceDay4 || null,
      rentalPriceDay5: this.form.rentalPriceDay5 || null,
      rentalPriceDay6: this.form.rentalPriceDay6 || null,
      rentalPriceDay7: this.form.rentalPriceDay7 || null,
      rentalPriceAdditionalDayAfter7:
        this.form.rentalPriceAdditionalDayAfter7 || null,
      // Leerer String statt null: null hieße serverseitig "behalten", die
      // Nummer ließe sich sonst nicht mehr entfernen. Gleiches gilt für die
      // Körpergröße, dort steht 0 für "nicht gepflegt".
      fahrradnummer: this.form.fahrradnummer?.trim() ?? '',
      koerpergroesseVonCm: this.form.koerpergroesseVonCm ?? 0,
      koerpergroesseBisCm: this.form.koerpergroesseBisCm ?? 0,
    };

    if (this.isEdit) {
      // Die Kaution läuft über ihren eigenen Endpunkt — sie ist bewusst kein
      // Feld des allgemeinen Fahrrad-Updates mehr, damit kein anderes Formular
      // sie überschreiben kann. Diese Seite ist der einzige Ort, an dem sie
      // geändert werden darf. Leeres Feld = keine Kaution (null).
      this.bicycleService
        .update(this.bikeId()!, dto as any)
        .pipe(
          switchMap(() =>
            this.bicycleService.setKaution(this.bikeId()!, this.form.kaution ?? null),
          ),
        )
        .subscribe({
          next: () => {
            this.notificationService.success(this.t.mietfahrradSaveSuccess);
            this.saving.set(false);
            this.loadBike();
            // "Für Verleih aktiv" kann gerade umgeschaltet worden sein — dann
            // stimmt die Nachbarschaft der Pfeile nicht mehr.
            this.loadNavBikes();
          },
          error: () => {
            this.notificationService.error(this.t.saveError);
            this.saving.set(false);
          },
        });
    } else {
      const createDto = {
        ...dto,
        kaution: this.form.kaution ?? null,
        isPublishedOnWebsite: false,
      };
      this.bicycleService.create(createDto as any).subscribe({
        next: (created) => {
          this.notificationService.success(this.t.mietfahrradSaveSuccess);
          this.saving.set(false);
          this.formDraftService.clear(DRAFT_KEY);
          this.router.navigate(['/mietfahrraeder/edit', created.id]);
        },
        error: () => {
          this.notificationService.error(this.t.saveError);
          this.saving.set(false);
        },
      });
    }
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.uploadFiles(Array.from(input.files));
    input.value = '';
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
      f.type.startsWith('image/'),
    );
    if (files.length) this.uploadFiles(files);
  }

  uploadFiles(files: File[]) {
    if (!this.bikeId()) return;
    this.uploadingCount.set(files.length);
    let done = 0;
    for (const file of files) {
      this.bicycleService.uploadGalleryImage(this.bikeId()!, file).subscribe({
        next: (img) => {
          this.images.update((imgs) => [...imgs, img]);
          done++;
          if (done >= files.length) this.uploadingCount.set(0);
        },
        error: () => {
          done++;
          if (done >= files.length) this.uploadingCount.set(0);
          this.notificationService.error(
            'Foto konnte nicht hochgeladen werden.',
          );
        },
      });
    }
  }

  deleteImage(img: BicycleImage) {
    if (!this.bikeId()) return;
    this.dialogService
      .danger(this.t.delete, this.t.confirmDelete)
      .then((confirmed) => {
        if (!confirmed) return;
        this.bicycleService
          .deleteGalleryImage(this.bikeId()!, img.id)
          .subscribe({
            next: () =>
              this.images.update((imgs) => imgs.filter((i) => i.id !== img.id)),
            error: () => this.notificationService.error(this.t.saveError),
          });
      });
  }

  // ── Reordering / Titelbild ──
  moveImage(from: number, to: number) {
    const imgs = [...this.images()];
    if (to < 0 || to >= imgs.length || from === to) return;
    const [moved] = imgs.splice(from, 1);
    imgs.splice(to, 0, moved);
    this.images.set(imgs);
    this.persistOrder();
  }

  setAsCover(index: number) {
    this.moveImage(index, 0);
  }

  onPhotoDragStart(index: number) {
    this.draggingIndex.set(index);
  }

  onPhotoDragOver(event: DragEvent, index: number) {
    if (this.draggingIndex() === null) return;
    event.preventDefault();
    this.dragOverIndex.set(index);
  }

  onPhotoDragLeave(index: number) {
    if (this.dragOverIndex() === index) this.dragOverIndex.set(null);
  }

  onPhotoDrop(index: number) {
    const from = this.draggingIndex();
    this.dragOverIndex.set(null);
    this.draggingIndex.set(null);
    if (from === null) return;
    this.moveImage(from, index);
  }

  onPhotoDragEnd() {
    this.draggingIndex.set(null);
    this.dragOverIndex.set(null);
  }

  private persistOrder() {
    if (!this.bikeId()) return;
    const ids = this.images().map((i) => i.id);
    this.bicycleService.reorderGalleryImages(this.bikeId()!, ids).subscribe({
      next: (imgs) => this.images.set(imgs),
      error: () => {
        this.notificationService.error(this.t.mietfahrradOrderSaveError);
        this.loadBike();
      },
    });
  }

  getImageUrl(path: string): string {
    return `${environment.apiUrl}/public/gallery-image/${path}`;
  }

  getPricePreview() {
    return getConfiguredRentalPriceLines(this.form);
  }

  isColorSelected(farbe: string, color: string): boolean {
    if (!farbe) return false;
    return farbe.split(/[,/]\s*/).includes(color);
  }

  toggleColor(farbe: string, color: string): string {
    const colors = farbe ? farbe.split(/[,/]\s*/).filter(Boolean) : [];
    const idx = colors.indexOf(color);
    if (idx >= 0) colors.splice(idx, 1);
    else colors.push(color);
    return colors.join(', ');
  }
}
