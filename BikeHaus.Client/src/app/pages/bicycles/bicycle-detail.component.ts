import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BicycleService } from '../../services/bicycle.service';
import { DocumentService } from '../../services/document.service';
import { TranslationService } from '../../services/translation.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import {
  Bicycle,
  BicycleUpdate,
  BikeStatus,
  BikeCondition,
  Document as DocModel,
} from '../../models/models';

@Component({
  selector: 'app-bicycle-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page" *ngIf="bicycle">
      <div class="page-header">
        <h1>{{ t.edit }}: {{ bicycle.marke }} {{ bicycle.modell }}</h1>
        <div class="header-actions">
          <button
            class="btn btn-primary"
            (click)="save()"
            [disabled]="submitting"
          >
            {{ submitting ? '...' : t.save }}
          </button>
          <a routerLink="/bicycles" class="btn btn-outline">{{ t.cancel }}</a>
        </div>
      </div>

      <div class="edit-grid">
        <!-- Left: Bicycle fields -->
        <div class="edit-card">
          <h2>{{ t.bicycleData }}</h2>
          <div class="form-grid">
            <div class="field">
              <label>{{ t.brand }} *</label>
              <input [(ngModel)]="form.marke" name="marke" />
            </div>
            <div class="field">
              <label>{{ t.model }}</label>
              <input [(ngModel)]="form.modell" name="modell" />
            </div>
            <div class="field">
              <label>{{ t.frameNumber }}</label>
              <input
                [(ngModel)]="form.rahmennummer"
                name="rahmennummer"
                placeholder="optional"
              />
            </div>
            <div class="field">
              <label>{{ t.frameSize }}</label>
              <input
                [(ngModel)]="form.rahmengroesse"
                name="rahmengroesse"
                placeholder="z.B. 52, 56, M, L"
              />
            </div>
            <div class="field">
              <label>{{ t.color }}</label>
              <select [(ngModel)]="form.farbe" name="farbe">
                <option value="">-- {{ t.selectOption }} --</option>
                <option value="Schwarz">Schwarz</option>
                <option value="Weiß">Weiß</option>
                <option value="Rot">Rot</option>
                <option value="Blau">Blau</option>
                <option value="Grün">Grün</option>
                <option value="Gelb">Gelb</option>
                <option value="Orange">Orange</option>
                <option value="Grau">Grau</option>
                <option value="Silber">Silber</option>
                <option value="Pink">Pink</option>
              </select>
            </div>
            <div class="field">
              <label>{{ t.wheelSize }}</label>
              <select [(ngModel)]="form.reifengroesse" name="reifengroesse">
                <option value="">-- {{ t.selectOption }} --</option>
                <option value="12">12"</option>
                <option value="14">14"</option>
                <option value="16">16"</option>
                <option value="18">18"</option>
                <option value="20">20"</option>
                <option value="24">24"</option>
                <option value="26">26"</option>
                <option value="27.5">27.5"</option>
                <option value="28">28"</option>
                <option value="29">29"</option>
              </select>
            </div>
            <div class="field">
              <label>{{ t.stockNo }}</label>
              <input [(ngModel)]="form.stokNo" name="stokNo" />
            </div>
            <div class="field">
              <label>{{ t.bicycleType }}</label>
              <select [(ngModel)]="form.fahrradtyp" name="fahrradtyp">
                <option value="">-- {{ t.selectOption }} --</option>
                <option value="E-Bike">E-Bike</option>
                <option value="E-Trekking Pedelec">E-Trekking Pedelec</option>
                <option value="Trekking">Trekking</option>
                <option value="City">City</option>
                <option value="MTB">Mountainbike (MTB)</option>
                <option value="Rennrad">Rennrad</option>
                <option value="Kinderfahrrad">Kinderfahrrad</option>
              </select>
            </div>
            <div class="field">
              <label>{{ t.condition }}</label>
              <select [(ngModel)]="form.zustand" name="zustand">
                <option [value]="BikeCondition.Gebraucht">
                  {{ t.usedCondition }}
                </option>
                <option [value]="BikeCondition.Neu">
                  {{ t.newCondition }}
                </option>
              </select>
            </div>
            <div class="field">
              <label>{{ t.status }}</label>
              <select [(ngModel)]="form.status" name="status">
                <option value="Available">{{ t.available }}</option>
                <option value="Sold">{{ t.sold }}</option>
                <option value="Reserved">{{ t.reserved }}</option>
              </select>
            </div>
            <div class="field field-full">
              <label>{{ t.description }}</label>
              <textarea
                [(ngModel)]="form.beschreibung"
                name="beschreibung"
                rows="3"
                placeholder="optional"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Right: Documents -->
        <div class="edit-card">
          <h2>{{ t.documents }}</h2>
          <div class="doc-upload">
            <input
              type="file"
              #fileInput
              (change)="uploadFile($event)"
              style="display: none"
            />
            <button class="btn btn-sm btn-outline" (click)="fileInput.click()">
              + {{ t.uploadDocument }}
            </button>
          </div>
          <div class="doc-list">
            <div *ngFor="let doc of documents" class="doc-item">
              <span class="doc-name">{{ doc.fileName }}</span>
              <div class="doc-actions">
                <button
                  class="btn btn-sm btn-outline"
                  (click)="downloadDoc(doc)"
                >
                  ↓
                </button>
                <button class="btn btn-sm btn-danger" (click)="deleteDoc(doc)">
                  ×
                </button>
              </div>
            </div>
            <p *ngIf="documents.length === 0" class="empty">
              {{ t.noDocuments }}
            </p>
          </div>
        </div>
      </div>

      <!-- Bottom save bar -->
      <div class="save-bar">
        <a routerLink="/bicycles" class="btn btn-outline">{{ t.cancel }}</a>
        <button
          class="btn btn-primary btn-lg"
          (click)="save()"
          [disabled]="submitting"
        >
          {{ submitting ? '...' : t.save }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 960px;
        margin: 0 auto;
        padding-bottom: 90px;
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
        margin-bottom: 22px;
        flex-wrap: wrap;
        gap: 10px;
      }
      .page-header h1 {
        font-size: 1.4rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      .header-actions {
        display: flex;
        gap: 8px;
      }
      .edit-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      @media (max-width: 768px) {
        .edit-grid {
          grid-template-columns: 1fr;
        }
      }
      .edit-card {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 24px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
      }
      .edit-card h2 {
        font-size: 1.05rem;
        font-weight: 700;
        margin-bottom: 16px;
        color: var(--text-primary);
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .field-full {
        grid-column: 1 / -1;
      }
      @media (max-width: 480px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
      .field {
        display: flex;
        flex-direction: column;
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
        width: 100%;
        padding: 9px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        font-size: 0.92rem;
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        transition: var(--transition-fast);
        box-sizing: border-box;
      }
      .field input:focus,
      .field select:focus,
      .field textarea:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
      }

      /* Documents */
      .doc-upload {
        margin-bottom: 12px;
      }
      .doc-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
      }
      .doc-name {
        font-size: 0.88rem;
        color: var(--text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 200px;
      }
      .doc-actions {
        display: flex;
        gap: 4px;
      }
      .empty {
        color: var(--text-secondary, #64748b);
        font-style: italic;
        font-size: 0.88rem;
      }

      /* Save bar */
      .save-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--bg-primary, #fff);
        border-top: 1.5px solid var(--border-light, #e2e8f0);
        padding: 14px 24px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        z-index: 100;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
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
      .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn-danger {
        background: var(--accent-danger, #ef4444);
        color: #fff;
        border-color: var(--accent-danger, #ef4444);
      }
      .btn-sm {
        padding: 5px 12px;
        font-size: 0.8rem;
      }
      .btn-lg {
        padding: 12px 28px;
        font-size: 1rem;
      }
    `,
  ],
})
export class BicycleDetailComponent implements OnInit {
  private translationService = inject(TranslationService);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  bicycle: Bicycle | null = null;
  documents: DocModel[] = [];
  submitting = false;
  BikeCondition = BikeCondition;
  form: BicycleUpdate = {
    marke: '',
    modell: '',
    rahmennummer: '',
    rahmengroesse: '',
    farbe: '',
    reifengroesse: '',
    stokNo: '',
    fahrradtyp: '',
    beschreibung: '',
    status: BikeStatus.Available,
    zustand: BikeCondition.Gebraucht,
  };

  get t() {
    return this.translationService.translations();
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bicycleService: BicycleService,
    private documentService: DocumentService,
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.bicycleService.getById(id).subscribe((b) => {
      this.bicycle = b;
      this.form = {
        marke: b.marke,
        modell: b.modell,
        rahmennummer: b.rahmennummer,
        rahmengroesse: b.rahmengroesse,
        farbe: b.farbe,
        reifengroesse: b.reifengroesse,
        stokNo: b.stokNo,
        fahrradtyp: b.fahrradtyp,
        beschreibung: b.beschreibung,
        status: b.status,
        zustand: b.zustand,
      };
    });
    this.documentService
      .getByBicycleId(id)
      .subscribe((docs) => (this.documents = docs));
  }

  save() {
    if (!this.form.marke?.trim()) {
      this.notificationService.error('Marke ist erforderlich');
      return;
    }
    this.submitting = true;
    this.bicycleService.update(this.bicycle!.id, this.form).subscribe({
      next: () => {
        this.notificationService.success(
          this.t.saveSuccess || 'Erfolgreich gespeichert',
        );
        this.router.navigate(['/bicycles']);
      },
      error: (err) => {
        this.submitting = false;
        this.notificationService.error(
          err.error?.error || this.t.saveError || 'Fehler beim Speichern',
        );
      },
    });
  }

  uploadFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.documentService
      .upload(file, 'Image', this.bicycle!.id)
      .subscribe(() => {
        this.documentService
          .getByBicycleId(this.bicycle!.id)
          .subscribe((docs) => (this.documents = docs));
      });
  }

  downloadDoc(doc: DocModel) {
    this.documentService.download(doc.id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  deleteDoc(doc: DocModel) {
    this.dialogService
      .danger(this.t.delete, this.t.deleteConfirmDocument)
      .then((confirmed) => {
        if (confirmed) {
          this.documentService.delete(doc.id).subscribe({
            next: () => {
              this.notificationService.success(
                this.t.deleteSuccess || 'Erfolgreich gelöscht',
              );
              this.documents = this.documents.filter((d) => d.id !== doc.id);
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
