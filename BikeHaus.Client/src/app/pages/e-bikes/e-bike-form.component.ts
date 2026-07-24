import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { EBikeService } from '../../services/e-bike.service';
import { TranslationService } from '../../services/translation.service';
import { DialogService } from '../../services/dialog.service';
import { EBike, EBikeCreate, EBikeUpdate } from '../../models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-e-bike-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ isEdit ? t.eBikeEdit : t.eBikeNew }}</h1>
        <a routerLink="/e-bikes" class="btn btn-outline">{{ t.back }}</a>
      </div>

      <div *ngIf="loading" class="loading">{{ t.loading }}</div>

      <form *ngIf="!loading" (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <!-- Basic Info -->
          <div class="form-card">
            <h2>{{ t.eBikeTitle }}</h2>
            <div class="form-grid">
              <div class="field full">
                <label>{{ t.eBikeTitle }} *</label>
                <input
                  [(ngModel)]="form.titel"
                  name="titel"
                  required
                  placeholder="z.B. E-Trekkingrad 28 Zoll"
                />
              </div>
              <div class="field">
                <label>{{ t.eBikeBrand }}</label>
                <input
                  [(ngModel)]="form.marke"
                  name="marke"
                  placeholder="z.B. Cube"
                />
              </div>
              <div class="field">
                <label>{{ t.eBikeModel }}</label>
                <input
                  [(ngModel)]="form.modell"
                  name="modell"
                  placeholder="z.B. Touring Hybrid"
                />
              </div>
              <div class="field">
                <label>{{ t.eBikePrice }} *</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="form.preis"
                  name="preis"
                  required
                />
              </div>
              <div class="field">
                <label>Angebot / Rabatt (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  [(ngModel)]="form.angebot"
                  name="angebot"
                  placeholder="z.B. 50"
                />
                <small *ngIf="form.angebot && form.angebot > 0" class="angebot-preview">
                  Verkaufspreis: {{ form.preis - form.angebot | number: '1.0-0' }} €
                  <span class="angebot-original">(statt {{ form.preis | number: '1.0-0' }} €)</span>
                </small>
              </div>
              <div class="field">
                <label>{{ t.eBikeCategory }}</label>
                <select [(ngModel)]="form.kategorie" name="kategorie">
                  <option value="">{{ t.eBikeSelectCategory }}</option>
                  <option value="E-City">E-City</option>
                  <option value="E-Trekking">E-Trekking</option>
                  <option value="E-MTB">E-MTB</option>
                  <option value="E-Lastenrad">E-Lastenrad</option>
                  <option value="E-Falt">E-Falt</option>
                  <option value="Sonstige">Sonstige</option>
                </select>
              </div>
              <div class="field">
                <label>{{ t.eBikeColor }}</label>
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
                    {{ c.label }}
                  </button>
                </div>
              </div>
              <div class="field">
                <label>{{ t.eBikeFrameSize }}</label>
                <input
                  [(ngModel)]="form.rahmengroesse"
                  name="rahmengroesse"
                  placeholder="z.B. 50cm"
                />
              </div>
              <div class="field">
                <label>{{ t.eBikeWheelSize }}</label>
                <input
                  [(ngModel)]="form.reifengroesse"
                  name="reifengroesse"
                  placeholder="z.B. 28 Zoll"
                />
              </div>
              <div class="field">
                <label>{{ t.eBikeGears }}</label>
                <input
                  [(ngModel)]="form.gangschaltung"
                  name="gangschaltung"
                  placeholder="z.B. 10-Gang Shimano Deore"
                />
              </div>
              <div class="field">
                <label>{{ t.eBikeCondition }}</label>
                <select [(ngModel)]="form.zustand" name="zustand">
                  <option value="Neu">Neu</option>
                  <option value="Gebraucht">Gebraucht</option>
                </select>
              </div>
              <div class="field full">
                <label>{{ t.eBikeDescription }}</label>
                <textarea
                  [(ngModel)]="form.beschreibung"
                  name="beschreibung"
                  rows="4"
                  placeholder="Detaillierte Beschreibung..."
                ></textarea>
              </div>
              <div class="field" *ngIf="isEdit">
                <label>
                  <input
                    type="checkbox"
                    [(ngModel)]="isActive"
                    name="isActive"
                  />
                  {{ t.eBikeActive }}
                </label>
              </div>
            </div>
          </div>

          <!-- Drive / Motor & Battery -->
          <div class="form-card">
            <h2>{{ t.eBikeMotorSection }}</h2>
            <div class="form-grid">
              <div class="field">
                <label>{{ t.eBikeMotorBrand }}</label>
                <input
                  [(ngModel)]="form.motorMarke"
                  name="motorMarke"
                  placeholder="z.B. Bosch"
                />
              </div>
              <div class="field">
                <label>{{ t.eBikeMotorPosition }}</label>
                <select [(ngModel)]="form.motorPosition" name="motorPosition">
                  <option value="">{{ t.eBikeSelectMotorPosition }}</option>
                  <option value="Mittelmotor">Mittelmotor</option>
                  <option value="Heckmotor">Heckmotor</option>
                  <option value="Frontmotor">Frontmotor</option>
                </select>
              </div>
              <div class="field">
                <label>{{ t.eBikeAkkuKapazitaet }}</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  [(ngModel)]="form.akkuKapazitaetWh"
                  name="akkuKapazitaetWh"
                  placeholder="z.B. 625"
                />
              </div>
              <div class="field">
                <label>{{ t.eBikeReichweite }}</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  [(ngModel)]="form.reichweiteKm"
                  name="reichweiteKm"
                  placeholder="z.B. 120"
                />
              </div>
              <div class="field">
                <label>{{ t.eBikeMotorLeistung }}</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  [(ngModel)]="form.motorLeistungNm"
                  name="motorLeistungNm"
                  placeholder="z.B. 85"
                />
              </div>
            </div>
          </div>

          <!-- Photos -->
          <div class="form-card" *ngIf="isEdit && existingItem">
            <h2>{{ t.eBikePhotos }}</h2>

            <div class="photo-grid" *ngIf="existingItem.images.length > 0">
              <div class="photo-item" *ngFor="let img of existingItem.images">
                <img
                  [src]="getImageUrl(img.filePath)"
                  [alt]="existingItem.titel"
                />
                <button
                  type="button"
                  class="photo-delete"
                  (click)="deleteImage(img.id)"
                  [title]="t.delete"
                >
                  ✕
                </button>
              </div>
            </div>

            <div class="upload-area">
              <label class="upload-btn">
                📷 {{ t.eBikeUploadPhotos }}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  (change)="onFilesSelected($event)"
                  style="display: none"
                />
              </label>
              <span *ngIf="uploading" class="uploading">{{ t.uploading }}</span>
            </div>
          </div>

          <!-- Photo upload hint for new items -->
          <div class="form-card hint-card" *ngIf="!isEdit">
            <p class="hint">
              💡 {{ t.eBikePhotos }}: Erstelle zuerst das E-Bike, dann kannst du
              Fotos hochladen.
            </p>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary btn-lg"
            [disabled]="submitting"
          >
            {{ submitting ? t.saving : t.save }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 800px;
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
      .loading {
        text-align: center;
        padding: 48px;
        color: var(--text-secondary, #64748b);
      }
      .form-sections {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .form-card {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 24px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
      }
      .form-card h2 {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 16px;
        color: var(--text-primary);
      }
      .hint-card {
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.04));
      }
      .hint {
        font-size: 0.9rem;
        color: var(--text-secondary, #64748b);
        margin: 0;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      @media (max-width: 600px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
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
      .field input,
      .field select,
      .field textarea {
        width: 100%;
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
      .field.full {
        grid-column: 1 / -1;
      }
      .field input[type='checkbox'] {
        width: auto;
        margin-right: 8px;
      }
      .photo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }
      .photo-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: var(--radius-md, 10px);
        overflow: hidden;
        border: 1.5px solid var(--border-light, #e2e8f0);
      }
      .photo-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .photo-delete {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(239, 68, 68, 0.9);
        color: #fff;
        border: none;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .upload-area {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .drop-zone {
        border: 2px dashed var(--border-light, #e2e8f0);
        border-radius: var(--radius-lg, 14px);
        padding: 32px 24px;
        text-align: center;
        background: var(--bg-secondary, #f8fafc);
        transition: all 0.2s ease;
        cursor: pointer;
      }
      .drop-zone:hover {
        border-color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.04));
      }
      .drop-zone.drag-over {
        border-color: var(--accent-primary, #6366f1);
        background: rgba(99, 102, 241, 0.1);
        transform: scale(1.01);
      }
      .drop-zone-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      .drop-icon {
        font-size: 2.5rem;
        opacity: 0.7;
      }
      .drop-text {
        font-size: 0.95rem;
        color: var(--text-secondary, #64748b);
        margin: 0;
      }
      .upload-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 18px;
        background: var(--bg-secondary, #f8fafc);
        border: 1.5px dashed var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        cursor: pointer;
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--text-primary);
        transition: all 0.15s;
      }
      .upload-btn:hover {
        border-color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.04));
      }
      .uploading {
        font-size: 0.85rem;
        color: var(--text-secondary, #64748b);
      }
      .form-actions {
        margin-top: 24px;
        text-align: right;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border-radius: var(--radius-md, 10px);
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.15s;
        text-decoration: none;
      }
      .btn-primary {
        background: var(--accent-primary, #6366f1);
        color: #fff;
      }
      .btn-primary:hover {
        background: var(--accent-primary-hover, #4f46e5);
      }
      .btn-outline {
        background: transparent;
        border: 1.5px solid var(--border-light, #e2e8f0);
        color: var(--text-primary);
      }
      .btn-lg {
        padding: 12px 32px;
        font-size: 1.05rem;
      }
      .color-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .color-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: 20px;
        background: var(--bg-card, #fff);
        font-size: 0.82rem;
        font-weight: 500;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .color-chip:hover {
        border-color: var(--accent-primary, #6366f1);
        background: var(--table-hover, #f1f5f9);
      }
      .color-chip.selected {
        border-color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        font-weight: 600;
      }
      .chip-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--chip-color, #ccc);
        border: 1px solid rgba(0, 0, 0, 0.12);
        flex-shrink: 0;
      }
      .angebot-preview {
        display: block;
        margin-top: 4px;
        font-size: 0.82rem;
        font-weight: 600;
        color: #10b981;
      }
      .angebot-original {
        color: var(--text-secondary, #94a3b8);
        font-weight: 400;
        text-decoration: line-through;
      }
    `,
  ],
})
export class EBikeFormComponent implements OnInit {
  private translationService = inject(TranslationService);
  private service = inject(EBikeService);
  private dialogService = inject(DialogService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  loading = false;
  submitting = false;
  uploading = false;
  isActive = true;
  isDragging = false;
  existingItem: EBike | null = null;

  form: EBikeCreate = {
    titel: '',
    beschreibung: '',
    preis: 0,
    preisText: '',
    kategorie: '',
    marke: '',
    modell: '',
    farbe: '',
    rahmengroesse: '',
    reifengroesse: '',
    gangschaltung: '',
    zustand: 'Neu',
    angebot: undefined,
    motorMarke: '',
    motorPosition: '',
    akkuKapazitaetWh: undefined,
    reichweiteKm: undefined,
    motorLeistungNm: undefined,
  };

  get t() {
    return this.translationService.translations();
  }

  get colorOptions() {
    return [
      { value: 'Schwarz', label: this.t.colorBlack, hex: '#1a1a1a' },
      { value: 'Weiß', label: this.t.colorWhite, hex: '#f5f5f5' },
      { value: 'Rot', label: this.t.colorRed, hex: '#ef4444' },
      { value: 'Blau', label: this.t.colorBlue, hex: '#3b82f6' },
      { value: 'Grün', label: this.t.colorGreen, hex: '#22c55e' },
      { value: 'Gelb', label: this.t.colorYellow, hex: '#eab308' },
      { value: 'Orange', label: this.t.colorOrange, hex: '#f97316' },
      { value: 'Braun', label: this.t.colorBraun, hex: '#92400e' },
      { value: 'Grau', label: this.t.colorGray, hex: '#9ca3af' },
      { value: 'Silber', label: this.t.colorSilver, hex: '#c0c0c0' },
      { value: 'Pink', label: this.t.colorPink, hex: '#ec4899' },
      { value: 'Türkis', label: this.t.colorTurkis, hex: '#06b6d4' },
      { value: 'Lila', label: this.t.colorLila, hex: '#a855f7' },
      { value: 'Dunkelblau', label: this.t.colorDunkelblau, hex: '#1e3a5f' },
    ];
  }

  isColorSelected(farbe: string | undefined, color: string): boolean {
    if (!farbe) return false;
    return farbe.split(/[,\/]\s*/).includes(color);
  }

  toggleColor(farbe: string | undefined, color: string): string {
    const colors = farbe ? farbe.split(/[,\/]\s*/).filter(Boolean) : [];
    const idx = colors.indexOf(color);
    if (idx >= 0) colors.splice(idx, 1);
    else colors.push(color);
    return colors.join('/');
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.loading = true;
      this.service.getById(+id).subscribe({
        next: (item) => {
          this.existingItem = item;
          this.isActive = item.isActive;
          this.form = {
            titel: item.titel,
            beschreibung: item.beschreibung || '',
            preis: item.preis,
            preisText: item.preisText || '',
            kategorie: item.kategorie || '',
            marke: item.marke || '',
            modell: item.modell || '',
            farbe: item.farbe || '',
            rahmengroesse: item.rahmengroesse || '',
            reifengroesse: item.reifengroesse || '',
            gangschaltung: item.gangschaltung || '',
            zustand: item.zustand,
            angebot: item.angebot || undefined,
            motorMarke: item.motorMarke || '',
            motorPosition: item.motorPosition || '',
            akkuKapazitaetWh: item.akkuKapazitaetWh ?? undefined,
            reichweiteKm: item.reichweiteKm ?? undefined,
            motorLeistungNm: item.motorLeistungNm ?? undefined,
          };
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }

  getImageUrl(path: string): string {
    if (environment.production) {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      return `${environment.apiUrl}/public/gallery-image/${cleanPath}`;
    }
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (!event.dataTransfer?.files || !this.existingItem) return;

    const files = Array.from(event.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/'),
    );

    if (files.length === 0) return;

    this.uploadFiles(files);
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !this.existingItem) return;

    const files = Array.from(input.files);
    this.uploadFiles(files);
    input.value = '';
  }

  private uploadFiles(files: File[]) {
    if (!this.existingItem || files.length === 0) return;

    this.uploading = true;

    this.service.uploadImages(this.existingItem.id, files).subscribe({
      next: (images) => {
        if (this.existingItem) {
          this.existingItem.images.push(...images);
        }
        this.uploading = false;
      },
      error: () => {
        this.uploading = false;
      },
    });
  }

  deleteImage(imageId: number) {
    this.dialogService
      .danger(this.t.delete, this.t.confirmDelete)
      .then((confirmed) => {
        if (!confirmed) return;
        this.service.deleteImage(imageId).subscribe({
          next: () => {
            if (this.existingItem) {
              this.existingItem.images = this.existingItem.images.filter(
                (i) => i.id !== imageId,
              );
            }
          },
        });
      });
  }

  submit() {
    if (!this.form.titel || this.form.preis <= 0) return;
    this.submitting = true;

    if (this.isEdit && this.existingItem) {
      const update: EBikeUpdate = {
        ...this.form,
        angebot:
          this.form.angebot && this.form.angebot > 0
            ? this.form.angebot
            : undefined,
        isActive: this.isActive,
      };
      this.service.update(this.existingItem.id, update).subscribe({
        next: () => {
          this.router.navigate(['/e-bikes']);
        },
        error: () => {
          this.submitting = false;
        },
      });
    } else {
      const createDto = {
        ...this.form,
        angebot:
          this.form.angebot && this.form.angebot > 0
            ? this.form.angebot
            : undefined,
      };
      this.service.create(createDto).subscribe({
        next: (created) => {
          // Navigate to edit page so user can upload photos
          this.router.navigate(['/e-bikes/edit', created.id]);
        },
        error: () => {
          this.submitting = false;
        },
      });
    }
  }
}
