import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BicycleService } from '../../services/bicycle.service';
import { DocumentService } from '../../services/document.service';
import { TranslationService } from '../../services/translation.service';
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
        <h1>{{ bicycle.marke }} {{ bicycle.modell }}</h1>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="save()" *ngIf="editing">
            {{ t.save }}
          </button>
          <button class="btn btn-outline" (click)="editing = !editing">
            {{ editing ? t.cancel : t.edit }}
          </button>
          <a routerLink="/bicycles" class="btn btn-outline">{{ t.back }}</a>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-card">
          <h2>{{ t.bicycleData }}</h2>
          <div class="field">
            <label>{{ t.brand }}</label>
            <input *ngIf="editing" [(ngModel)]="form.marke" />
            <span *ngIf="!editing">{{ bicycle.marke }}</span>
          </div>
          <div class="field">
            <label>{{ t.model }}</label>
            <input *ngIf="editing" [(ngModel)]="form.modell" />
            <span *ngIf="!editing">{{ bicycle.modell }}</span>
          </div>
          <div class="field">
            <label>{{ t.frameNumber }}</label>
            <input *ngIf="editing" [(ngModel)]="form.rahmennummer" />
            <span *ngIf="!editing" class="mono">{{
              bicycle.rahmennummer
            }}</span>
          </div>
          <div class="field">
            <label>{{ t.color }}</label>
            <input *ngIf="editing" [(ngModel)]="form.farbe" />
            <span *ngIf="!editing">{{ bicycle.farbe }}</span>
          </div>
          <div class="field">
            <label>{{ t.wheelSizeInch }}</label>
            <input *ngIf="editing" [(ngModel)]="form.reifengroesse" />
            <span *ngIf="!editing">{{ bicycle.reifengroesse }}</span>
          </div>
          <div class="field">
            <label>{{ t.stockNo }}</label>
            <input *ngIf="editing" [(ngModel)]="form.stokNo" />
            <span *ngIf="!editing">{{ bicycle.stokNo || '–' }}</span>
          </div>
          <div class="field">
            <label>{{ t.bicycleType }}</label>
            <select *ngIf="editing" [(ngModel)]="form.fahrradtyp">
              <option value="">{{ t.selectOption }}</option>
              <option value="E-Bike">E-Bike</option>
              <option value="E-Trekking Pedelec">E-Trekking Pedelec</option>
              <option value="Trekking">Trekking</option>
              <option value="City">City</option>
              <option value="MTB">MTB</option>
              <option value="Rennrad">Rennrad</option>
              <option value="Kinderfahrrad">Kinderfahrrad</option>
            </select>
            <span *ngIf="!editing">{{ bicycle.fahrradtyp || '–' }}</span>
          </div>
          <div class="field">
            <label>{{ t.condition }}</label>
            <select *ngIf="editing" [(ngModel)]="form.zustand">
              <option [value]="BikeCondition.Gebraucht">{{ t.usedCondition }}</option>
              <option [value]="BikeCondition.Neu">{{ t.newCondition }}</option>
            </select>
            <span
              *ngIf="!editing"
              class="badge"
              [class]="'badge-' + bicycle.zustand.toLowerCase()"
            >
              {{ bicycle.zustand }}
            </span>
          </div>
          <div class="field">
            <label>{{ t.status }}</label>
            <select *ngIf="editing" [(ngModel)]="form.status">
              <option value="Available">{{ t.available }}</option>
              <option value="Sold">{{ t.sold }}</option>
              <option value="Reserved">{{ t.reserved }}</option>
            </select>
            <span
              *ngIf="!editing"
              class="badge"
              [class]="'badge-' + bicycle.status.toLowerCase()"
            >
              {{
                bicycle.status === 'Available'
                  ? t.available
                  : bicycle.status === 'Sold'
                    ? t.sold
                    : t.reserved
              }}
            </span>
          </div>
          <div class="field">
            <label>{{ t.description }}</label>
            <textarea
              *ngIf="editing"
              [(ngModel)]="form.beschreibung"
              rows="3"
            ></textarea>
            <span *ngIf="!editing">{{ bicycle.beschreibung || '–' }}</span>
          </div>
        </div>

        <div class="detail-card">
          <h2>{{ t.documents }}</h2>
          <div class="doc-upload">
            <input
              type="file"
              #fileInput
              (change)="uploadFile($event)"
              style="display:none"
            />
            <button class="btn btn-sm btn-outline" (click)="fileInput.click()">
              + {{ t.uploadDocument }}
            </button>
          </div>
          <div class="doc-list">
            <div *ngFor="let doc of documents" class="doc-item">
              <span>{{ doc.fileName }}</span>
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
            <p *ngIf="documents.length === 0" class="empty">{{ t.noDocuments }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 900px;
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
        flex-wrap: wrap;
        gap: 10px;
      }
      .page-header h1 {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
      }
      .header-actions {
        display: flex;
        gap: 8px;
      }
      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      @media (max-width: 768px) {
        .detail-grid {
          grid-template-columns: 1fr;
        }
      }
      .detail-card {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 24px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
      }
      .detail-card h2 {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 16px;
        color: var(--text-primary);
      }
      .field {
        margin-bottom: 12px;
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
      .mono {
        font-family: 'SF Mono', 'Consolas', monospace;
        font-size: 0.82rem;
        color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        padding: 2px 8px;
        border-radius: 6px;
        font-weight: 600;
      }
      .badge {
        padding: 4px 11px;
        border-radius: 50px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      .badge-available {
        background: var(--accent-success-light, rgba(16, 185, 129, 0.08));
        color: var(--accent-success, #10b981);
      }
      .badge-sold {
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.08));
        color: var(--accent-danger, #ef4444);
      }
      .badge-reserved {
        background: rgba(245, 158, 11, 0.08);
        color: #f59e0b;
      }
      .badge-neu {
        background: rgba(59, 130, 246, 0.08);
        color: #3b82f6;
      }
      .badge-gebraucht {
        background: rgba(100, 116, 139, 0.08);
        color: #64748b;
      }
      .doc-upload {
        margin-bottom: 12px;
      }
      .doc-list {
      }
      .doc-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
      }
      .doc-actions {
        display: flex;
        gap: 4px;
      }
      .empty {
        color: var(--text-secondary, #64748b);
        font-style: italic;
      }
    `,
  ],
})
export class BicycleDetailComponent implements OnInit {
  private translationService = inject(TranslationService);
  bicycle: Bicycle | null = null;
  documents: DocModel[] = [];
  editing = false;
  BikeCondition = BikeCondition;
  form: BicycleUpdate = {
    marke: '',
    modell: '',
    rahmennummer: '',
    farbe: '',
    reifengroesse: '',
    stokNo: '',
    fahrradtyp: '',
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
    this.bicycleService.update(this.bicycle!.id, this.form).subscribe(() => {
      this.editing = false;
      this.bicycleService
        .getById(this.bicycle!.id)
        .subscribe((b) => (this.bicycle = b));
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
    if (confirm(this.t.deleteConfirmDocument)) {
      this.documentService.delete(doc.id).subscribe(() => {
        this.documents = this.documents.filter((d) => d.id !== doc.id);
      });
    }
  }
}
