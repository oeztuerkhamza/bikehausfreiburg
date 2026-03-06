import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HomepageAccessoryService } from '../../services/homepage-accessory.service';
import { TranslationService } from '../../services/translation.service';
import {
  HomepageAccessory,
  HomepageAccessoryCreate,
  HomepageAccessoryUpdate,
} from '../../models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-homepage-accessory-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>{{ isEdit ? t.homepageAccessoryEdit : t.homepageAccessoryNew }}</h1>
        <a routerLink="/homepage-accessories" class="btn btn-outline">{{
          t.back
        }}</a>
      </div>

      <div *ngIf="loading" class="loading">{{ t.loading }}</div>

      <form *ngIf="!loading" (ngSubmit)="submit()" #f="ngForm">
        <div class="form-sections">
          <div class="form-card">
            <h2>{{ t.homepageAccessoryTitle }}</h2>
            <div class="form-grid">
              <div class="field full">
                <label>{{ t.homepageAccessoryTitle }} *</label>
                <input
                  [(ngModel)]="form.titel"
                  name="titel"
                  required
                  placeholder="z.B. Fahrradschloss Abus"
                />
              </div>
              <div class="field">
                <label>{{ t.homepageAccessoryBrand }}</label>
                <input
                  [(ngModel)]="form.marke"
                  name="marke"
                  placeholder="z.B. Abus, Knog"
                />
              </div>
              <div class="field">
                <label>{{ t.homepageAccessoryPrice }} *</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="form.preis"
                  name="preis"
                  required
                />
              </div>
              <div class="field">
                <label>{{ t.homepageAccessoryCategory }}</label>
                <select [(ngModel)]="form.kategorie" name="kategorie">
                  <option value="">
                    {{ t.homepageAccessorySelectCategory }}
                  </option>
                  <option value="Schlösser">Schlösser</option>
                  <option value="Beleuchtung">Beleuchtung</option>
                  <option value="Helme">Helme</option>
                  <option value="Körbe & Taschen">Körbe & Taschen</option>
                  <option value="Pumpen">Pumpen</option>
                  <option value="Werkzeug">Werkzeug</option>
                  <option value="Schutzbleche">Schutzbleche</option>
                  <option value="Klingeln">Klingeln</option>
                  <option value="Kindersitze">Kindersitze</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>
              <div class="field full">
                <label>{{ t.homepageAccessoryDescription }}</label>
                <textarea
                  [(ngModel)]="form.beschreibung"
                  name="beschreibung"
                  rows="4"
                  placeholder="Beschreibung des Zubehörs..."
                ></textarea>
              </div>
              <div class="field" *ngIf="isEdit">
                <label>
                  <input
                    type="checkbox"
                    [(ngModel)]="isActive"
                    name="isActive"
                  />
                  {{ t.homepageAccessoryActive }}
                </label>
              </div>
            </div>
          </div>

          <!-- Photos -->
          <div class="form-card" *ngIf="isEdit && existingItem">
            <h2>{{ t.homepageAccessoryPhotos }}</h2>

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
                📷 {{ t.homepageAccessoryUploadPhotos }}
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

          <div class="form-card hint-card" *ngIf="!isEdit">
            <p class="hint">
              💡 {{ t.homepageAccessoryPhotos }}: Erstelle zuerst den Artikel,
              dann kannst du Fotos hochladen.
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
    `,
  ],
})
export class HomepageAccessoryFormComponent implements OnInit {
  private translationService = inject(TranslationService);
  private service = inject(HomepageAccessoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  loading = false;
  submitting = false;
  uploading = false;
  isActive = true;
  existingItem: HomepageAccessory | null = null;

  form: HomepageAccessoryCreate = {
    titel: '',
    beschreibung: '',
    preis: 0,
    preisText: '',
    kategorie: '',
    marke: '',
  };

  get t() {
    return this.translationService.translations();
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
      return path;
    }
    return `${environment.apiUrl.replace('/api', '')}${path}`;
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
    this.service.deleteImage(imageId).subscribe({
      next: () => {
        if (this.existingItem) {
          this.existingItem.images = this.existingItem.images.filter(
            (i) => i.id !== imageId,
          );
        }
      },
    });
  }

  submit() {
    if (!this.form.titel || this.form.preis <= 0) return;
    this.submitting = true;

    if (this.isEdit && this.existingItem) {
      const update: HomepageAccessoryUpdate = {
        ...this.form,
        isActive: this.isActive,
      };
      this.service.update(this.existingItem.id, update).subscribe({
        next: () => {
          this.router.navigate(['/homepage-accessories']);
        },
        error: () => {
          this.submitting = false;
        },
      });
    } else {
      this.service.create(this.form).subscribe({
        next: (created) => {
          this.router.navigate(['/homepage-accessories/edit', created.id]);
        },
        error: () => {
          this.submitting = false;
        },
      });
    }
  }
}
