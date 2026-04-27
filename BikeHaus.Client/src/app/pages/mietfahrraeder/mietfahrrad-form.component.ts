import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BicycleService } from '../../services/bicycle.service';
import { NotificationService } from '../../services/notification.service';
import { TranslationService } from '../../services/translation.service';
import { Bicycle, BicycleImage } from '../../models/models';
import { environment } from '../../../environments/environment';

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
  rentalPriceDay3: number | null;
  rentalPriceDay7: number | null;
  rentalPriceDay14: number | null;
  rentalPriceDay30: number | null;
  rentalPricePerDayFrom10: number | null;
}

@Component({
  selector: 'app-mietfahrrad-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>{{ isEdit ? t.mietfahrradEdit : t.mietfahrradNew }}</h1>
          <p class="page-subtitle" *ngIf="isEdit && bike()">{{ bike()!.marke }} {{ bike()!.modell }}</p>
        </div>
        <a routerLink="/mietfahrraeder" class="btn btn-outline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          {{ t.back }}
        </a>
      </div>

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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
                  <path d="M15 6a1 1 0 100-2 1 1 0 000 2zM12 17.5V14l-3-3 4-3 2 3h2"/>
                </svg>
                {{ t.mietfahrradBasicInfo }}
              </h2>
              <div class="form-grid">
                <div class="field">
                  <label>{{ t.mietfahrradBrand }} *</label>
                  <input [(ngModel)]="form.marke" name="marke" required placeholder="z.B. Cube" />
                </div>
                <div class="field">
                  <label>{{ t.mietfahrradModel }}</label>
                  <input [(ngModel)]="form.modell" name="modell" placeholder="z.B. Cross Pro" />
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
                    <option>Kinderrad</option>
                    <option>Hollandrad</option>
                    <option>Lastenrad</option>
                    <option>Sonstiges</option>
                  </select>
                </div>
                <div class="field">
                  <label>{{ t.mietfahrradSize }}</label>
                  <input [(ngModel)]="form.reifengroesse" name="reifengroesse" placeholder="z.B. 28" />
                </div>
                <div class="field">
                  <label>{{ t.mietfahrradFrameSize }}</label>
                  <input [(ngModel)]="form.rahmengroesse" name="rahmengroesse" placeholder="z.B. 54cm / M" />
                </div>
                <div class="field">
                  <label>{{ t.mietfahrradColor }}</label>
                  <input [(ngModel)]="form.farbe" name="farbe" placeholder="z.B. Silber" />
                </div>
                <div class="field full">
                  <label>{{ t.mietfahrradDescription }}</label>
                  <textarea [(ngModel)]="form.beschreibung" name="beschreibung" rows="3"
                    placeholder="Ausstattung, Besonderheiten..."></textarea>
                </div>
              </div>

              <!-- Rentable toggle -->
              <div class="rentable-toggle">
                <label class="toggle-label">
                  <div class="toggle-switch" [class.on]="form.isRentable" (click)="form.isRentable = !form.isRentable">
                    <div class="toggle-knob"></div>
                  </div>
                  <div>
                    <strong>{{ t.mietfahrradIsRentable }}</strong>
                    <span>Dieses Fahrrad auf der Website für Mietanfragen anzeigen</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Rental Prices -->
            <div class="card">
              <h2 class="card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
                {{ t.mietfahrradRentalPrices }}
              </h2>
              <p class="card-hint">Preise in € pro Zeitraum. Leere Felder werden nicht angezeigt.</p>
              <div class="price-grid">
                <div class="price-field">
                  <label>{{ t.mietfahrradPriceDay1 }}</label>
                  <div class="price-input-wrap">
                    <input type="number" step="0.01" min="0" [(ngModel)]="form.rentalPriceDay1" name="priceDay1" placeholder="–" />
                    <span class="currency">€</span>
                  </div>
                </div>
                <div class="price-field">
                  <label>{{ t.mietfahrradPriceDay3 }}</label>
                  <div class="price-input-wrap">
                    <input type="number" step="0.01" min="0" [(ngModel)]="form.rentalPriceDay3" name="priceDay3" placeholder="–" />
                    <span class="currency">€</span>
                  </div>
                </div>
                <div class="price-field featured">
                  <label>{{ t.mietfahrradPriceDay7 }} ⭐</label>
                  <div class="price-input-wrap">
                    <input type="number" step="0.01" min="0" [(ngModel)]="form.rentalPriceDay7" name="priceDay7" placeholder="–" />
                    <span class="currency">€</span>
                  </div>
                </div>
                <div class="price-field">
                  <label>{{ t.mietfahrradPriceDay14 }}</label>
                  <div class="price-input-wrap">
                    <input type="number" step="0.01" min="0" [(ngModel)]="form.rentalPriceDay14" name="priceDay14" placeholder="–" />
                    <span class="currency">€</span>
                  </div>
                </div>
                <div class="price-field">
                  <label>{{ t.mietfahrradPriceDay30 }}</label>
                  <div class="price-input-wrap">
                    <input type="number" step="0.01" min="0" [(ngModel)]="form.rentalPriceDay30" name="priceDay30" placeholder="–" />
                    <span class="currency">€</span>
                  </div>
                </div>
                <div class="price-field">
                  <label>{{ t.mietfahrradPricePerDay }}</label>
                  <div class="price-input-wrap">
                    <input type="number" step="0.01" min="0" [(ngModel)]="form.rentalPricePerDayFrom10" name="pricePerDay" placeholder="–" />
                    <span class="currency">€/Tag</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit -->
            <div class="form-actions">
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                <svg *ngIf="!saving()" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <svg *ngIf="saving()" class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                {{ saving() ? t.saving : t.save }}
              </button>
              <a routerLink="/mietfahrraeder" class="btn btn-outline">{{ t.cancel }}</a>
            </div>
          </div>

          <!-- RIGHT: Fotos -->
          <div class="form-column">
            <div class="card" *ngIf="isEdit">
              <h2 class="card-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                {{ t.mietfahrradPhotos }}
                <span class="photo-count-badge">{{ images().length }}</span>
              </h2>

              <!-- Upload area -->
              <div class="upload-area" (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
                <input #fileInput type="file" accept="image/*" multiple (change)="onFilesSelected($event)" style="display:none" />
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p>Fotos hochladen</p>
                <span>Klicken oder Dateien hierher ziehen</span>
                <div class="upload-progress" *ngIf="uploadingCount() > 0">
                  {{ uploadingCount() }} Bild(er) werden hochgeladen...
                </div>
              </div>

              <!-- Photo grid -->
              <div class="photo-grid" *ngIf="images().length > 0">
                <div class="photo-item" *ngFor="let img of images()">
                  <img [src]="getImageUrl(img.filePath)" [alt]="'Foto'" />
                  <button class="photo-delete" type="button" (click)="deleteImage(img)" title="Löschen">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                  <div class="photo-order">{{ img.sortOrder + 1 }}</div>
                </div>
              </div>

              <p class="photo-hint" *ngIf="images().length === 0">Noch keine Fotos vorhanden.</p>
            </div>

            <div class="card info-card" *ngIf="!isEdit">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <p>Fotos können nach dem Speichern hochgeladen werden.</p>
            </div>
          </div>

        </div>
      </form>
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; margin: 0 auto; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
    }
    .page-header h1 { margin: 0 0 4px; font-size: 1.5rem; font-weight: 800; }
    .page-subtitle { margin: 0; color: var(--text-secondary); font-size: 0.88rem; }

    .loading-wrap { display: flex; justify-content: center; padding: 4rem; }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--border-light); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .form-layout { display: grid; grid-template-columns: 1fr 400px; gap: 24px; }
    .form-column { display: flex; flex-direction: column; gap: 20px; }

    .card {
      background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 16px; padding: 24px;
    }
    .card-title {
      display: flex; align-items: center; gap: 8px; margin: 0 0 20px;
      font-size: 0.92rem; font-weight: 700; color: var(--text-primary);
      text-transform: uppercase; letter-spacing: 0.06em;
    }
    .card-title svg { color: var(--accent-primary); flex-shrink: 0; }
    .card-hint { font-size: 0.82rem; color: var(--text-muted); margin: -12px 0 16px; }

    .photo-count-badge {
      margin-left: auto; background: var(--accent-primary); color: #fff;
      border-radius: 20px; padding: 1px 8px; font-size: 0.75rem; font-weight: 700;
    }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field.full { grid-column: 1 / -1; }
    .field label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    .field input, .field select, .field textarea {
      padding: 10px 12px; border: 1.5px solid var(--border-color); border-radius: 10px;
      background: var(--bg-primary); color: var(--text-primary); font-size: 0.9rem;
      transition: border-color 0.2s; resize: vertical;
    }
    .field input:focus, .field select:focus, .field textarea:focus {
      outline: none; border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px var(--accent-primary-light, rgba(99,102,241,0.08));
    }

    .rentable-toggle {
      margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-light);
    }
    .toggle-label {
      display: flex; align-items: center; gap: 14px; cursor: pointer;
    }
    .toggle-label > div { display: flex; flex-direction: column; gap: 3px; }
    .toggle-label strong { font-size: 0.88rem; font-weight: 700; color: var(--text-primary); }
    .toggle-label span { font-size: 0.8rem; color: var(--text-muted); }
    .toggle-switch {
      width: 48px; height: 26px; border-radius: 13px; background: var(--border-color);
      position: relative; transition: background 0.25s; flex-shrink: 0; cursor: pointer;
    }
    .toggle-switch.on { background: var(--accent-primary); }
    .toggle-knob {
      position: absolute; top: 3px; left: 3px; width: 20px; height: 20px;
      border-radius: 50%; background: #fff; transition: left 0.25s;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    }
    .toggle-switch.on .toggle-knob { left: 25px; }

    .price-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .price-field { display: flex; flex-direction: column; gap: 6px; }
    .price-field label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
    .price-field.featured label { color: var(--accent-primary); }
    .price-input-wrap { position: relative; }
    .price-input-wrap input {
      width: 100%; padding: 9px 48px 9px 12px; border: 1.5px solid var(--border-color);
      border-radius: 10px; background: var(--bg-primary); color: var(--text-primary);
      font-size: 0.92rem; font-weight: 600; transition: border-color 0.2s;
    }
    .price-field.featured .price-input-wrap input { border-color: var(--accent-primary); }
    .price-input-wrap input:focus { outline: none; border-color: var(--accent-primary); box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
    .currency {
      position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
      font-size: 0.78rem; font-weight: 600; color: var(--text-muted); pointer-events: none;
    }

    .form-actions { display: flex; gap: 12px; flex-wrap: wrap; }

    .upload-area {
      border: 2px dashed var(--border-color); border-radius: 12px; padding: 2rem;
      text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s;
      margin-bottom: 16px;
    }
    .upload-area:hover { border-color: var(--accent-primary); background: rgba(99,102,241,0.03); }
    .upload-area svg { color: var(--text-muted); margin-bottom: 8px; }
    .upload-area p { margin: 0 0 4px; font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
    .upload-area span { font-size: 0.8rem; color: var(--text-muted); }
    .upload-progress { margin-top: 10px; font-size: 0.82rem; color: var(--accent-primary); font-weight: 600; }

    .photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .photo-item { position: relative; border-radius: 10px; overflow: hidden; aspect-ratio: 4/3; background: var(--bg-primary); }
    .photo-item img { width: 100%; height: 100%; object-fit: cover; }
    .photo-delete {
      position: absolute; top: 5px; right: 5px; width: 22px; height: 22px;
      border-radius: 50%; background: rgba(239,68,68,0.9); border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; color: #fff;
      opacity: 0; transition: opacity 0.15s; padding: 0;
    }
    .photo-item:hover .photo-delete { opacity: 1; }
    .photo-order {
      position: absolute; bottom: 5px; left: 5px; width: 20px; height: 20px;
      border-radius: 50%; background: rgba(0,0,0,0.6); color: #fff;
      font-size: 0.65rem; font-weight: 700; display: flex; align-items: center; justify-content: center;
    }
    .photo-hint { font-size: 0.82rem; color: var(--text-muted); text-align: center; margin: 8px 0 0; }

    .info-card { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; padding: 2rem; }
    .info-card svg { color: var(--text-muted); opacity: 0.5; }
    .info-card p { color: var(--text-secondary); font-size: 0.88rem; margin: 0; }

    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 10px 18px; border-radius: 10px; font-size: 0.88rem; font-weight: 600;
      cursor: pointer; border: 1.5px solid transparent; transition: all 0.15s; text-decoration: none;
    }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-primary { background: var(--accent-primary); color: #fff; border-color: var(--accent-primary); }
    .btn-primary:hover:not(:disabled) { opacity: 0.88; }
    .btn-outline { background: transparent; border-color: var(--border-color); color: var(--text-primary); }
    .btn-outline:hover { border-color: var(--accent-primary); color: var(--accent-primary); text-decoration: none; }
    .spin { animation: spin 0.7s linear infinite; }

    @media (max-width: 900px) {
      .form-layout { grid-template-columns: 1fr; }
      .form-grid { grid-template-columns: 1fr; }
      .price-grid { grid-template-columns: 1fr 1fr 1fr; }
    }
  `]
})
export class MietfahrradFormComponent implements OnInit {
  private bicycleService = inject(BicycleService);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  bikeId: number | null = null;
  bike = signal<Bicycle | null>(null);
  images = signal<BicycleImage[]>([]);
  pageLoading = signal(true);
  saving = signal(false);
  uploadingCount = signal(0);

  form: RentalForm = {
    marke: '', modell: '', rahmennummer: '', rahmengroesse: '',
    farbe: '', reifengroesse: '', fahrradtyp: '', art: '', beschreibung: '',
    isRentable: true,
    rentalPriceDay1: null, rentalPriceDay3: null, rentalPriceDay7: null,
    rentalPriceDay14: null, rentalPriceDay30: null, rentalPricePerDayFrom10: null,
  };

  get t() { return this.translationService.translations(); }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.bikeId = +idParam;
      this.loadBike();
    } else {
      this.pageLoading.set(false);
    }
  }

  loadBike() {
    this.bicycleService.getById(this.bikeId!).subscribe({
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
          rentalPriceDay3: bike.rentalPriceDay3 ?? null,
          rentalPriceDay7: bike.rentalPriceDay7 ?? null,
          rentalPriceDay14: bike.rentalPriceDay14 ?? null,
          rentalPriceDay30: bike.rentalPriceDay30 ?? null,
          rentalPricePerDayFrom10: bike.rentalPricePerDayFrom10 ?? null,
        };
        this.images.set(bike.images ?? []);
        this.pageLoading.set(false);
      },
      error: () => {
        this.notificationService.error(this.t.saveError);
        this.pageLoading.set(false);
      }
    });
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
      rentalPriceDay3: this.form.rentalPriceDay3 || null,
      rentalPriceDay7: this.form.rentalPriceDay7 || null,
      rentalPriceDay14: this.form.rentalPriceDay14 || null,
      rentalPriceDay30: this.form.rentalPriceDay30 || null,
      rentalPricePerDayFrom10: this.form.rentalPricePerDayFrom10 || null,
    };

    if (this.isEdit) {
      this.bicycleService.update(this.bikeId!, dto as any).subscribe({
        next: () => {
          this.notificationService.success(this.t.mietfahrradSaveSuccess);
          this.saving.set(false);
          this.loadBike();
        },
        error: () => { this.notificationService.error(this.t.saveError); this.saving.set(false); }
      });
    } else {
      const createDto = { ...dto, isPublishedOnWebsite: false };
      this.bicycleService.create(createDto as any).subscribe({
        next: (created) => {
          this.notificationService.success(this.t.mietfahrradSaveSuccess);
          this.saving.set(false);
          this.router.navigate(['/mietfahrraeder/edit', created.id]);
        },
        error: () => { this.notificationService.error(this.t.saveError); this.saving.set(false); }
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
    const files = Array.from(event.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'));
    if (files.length) this.uploadFiles(files);
  }

  uploadFiles(files: File[]) {
    if (!this.bikeId) return;
    this.uploadingCount.set(files.length);
    let done = 0;
    for (const file of files) {
      this.bicycleService.uploadGalleryImage(this.bikeId, file).subscribe({
        next: (img) => {
          this.images.update(imgs => [...imgs, img]);
          done++;
          if (done >= files.length) this.uploadingCount.set(0);
        },
        error: () => {
          done++;
          if (done >= files.length) this.uploadingCount.set(0);
          this.notificationService.error('Foto konnte nicht hochgeladen werden.');
        }
      });
    }
  }

  deleteImage(img: BicycleImage) {
    if (!this.bikeId) return;
    this.bicycleService.deleteGalleryImage(this.bikeId, img.id).subscribe({
      next: () => this.images.update(imgs => imgs.filter(i => i.id !== img.id)),
      error: () => this.notificationService.error(this.t.saveError),
    });
  }

  getImageUrl(path: string): string {
    return `${environment.apiUrl.replace('/api', '')}/${path}`;
  }
}
