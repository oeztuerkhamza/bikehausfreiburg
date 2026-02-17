import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BicycleService } from '../../services/bicycle.service';
import { DocumentService } from '../../services/document.service';
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
            Speichern
          </button>
          <button class="btn btn-outline" (click)="editing = !editing">
            {{ editing ? 'Abbrechen' : 'Bearbeiten' }}
          </button>
          <a routerLink="/bicycles" class="btn btn-outline">Zurück</a>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-card">
          <h2>Fahrrad-Daten</h2>
          <div class="field">
            <label>Marke</label>
            <input *ngIf="editing" [(ngModel)]="form.marke" />
            <span *ngIf="!editing">{{ bicycle.marke }}</span>
          </div>
          <div class="field">
            <label>Modell</label>
            <input *ngIf="editing" [(ngModel)]="form.modell" />
            <span *ngIf="!editing">{{ bicycle.modell }}</span>
          </div>
          <div class="field">
            <label>Rahmennummer</label>
            <input *ngIf="editing" [(ngModel)]="form.rahmennummer" />
            <span *ngIf="!editing" class="mono">{{
              bicycle.rahmennummer
            }}</span>
          </div>
          <div class="field">
            <label>Farbe</label>
            <input *ngIf="editing" [(ngModel)]="form.farbe" />
            <span *ngIf="!editing">{{ bicycle.farbe }}</span>
          </div>
          <div class="field">
            <label>Reifengröße</label>
            <input *ngIf="editing" [(ngModel)]="form.reifengroesse" />
            <span *ngIf="!editing">{{ bicycle.reifengroesse }}</span>
          </div>
          <div class="field">
            <label>Fahrradtyp</label>
            <select *ngIf="editing" [(ngModel)]="form.fahrradtyp">
              <option value="">– wählen –</option>
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
            <label>Zustand</label>
            <select *ngIf="editing" [(ngModel)]="form.zustand">
              <option [value]="BikeCondition.Gebraucht">Gebraucht</option>
              <option [value]="BikeCondition.Neu">Neu</option>
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
            <label>Status</label>
            <select *ngIf="editing" [(ngModel)]="form.status">
              <option value="Available">Verfügbar</option>
              <option value="Sold">Verkauft</option>
              <option value="Reserved">Reserviert</option>
            </select>
            <span
              *ngIf="!editing"
              class="badge"
              [class]="'badge-' + bicycle.status.toLowerCase()"
            >
              {{
                bicycle.status === 'Available'
                  ? 'Verfügbar'
                  : bicycle.status === 'Sold'
                    ? 'Verkauft'
                    : 'Reserviert'
              }}
            </span>
          </div>
          <div class="field">
            <label>Beschreibung</label>
            <textarea
              *ngIf="editing"
              [(ngModel)]="form.beschreibung"
              rows="3"
            ></textarea>
            <span *ngIf="!editing">{{ bicycle.beschreibung || '–' }}</span>
          </div>
        </div>

        <div class="detail-card">
          <h2>Dokumente</h2>
          <div class="doc-upload">
            <input
              type="file"
              #fileInput
              (change)="uploadFile($event)"
              style="display:none"
            />
            <button class="btn btn-sm btn-outline" (click)="fileInput.click()">
              + Dokument hochladen
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
            <p *ngIf="documents.length === 0" class="empty">Keine Dokumente</p>
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
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 10px;
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
        background: #fff;
        border-radius: 10px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
      .detail-card h2 {
        font-size: 1.1rem;
        margin-bottom: 16px;
      }
      .field {
        margin-bottom: 12px;
      }
      .field label {
        display: block;
        font-size: 0.8rem;
        color: #777;
        margin-bottom: 4px;
      }
      .field input,
      .field select,
      .field textarea {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.95rem;
      }
      .mono {
        font-family: monospace;
      }
      .badge {
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 0.8rem;
      }
      .badge-available {
        background: #d4edda;
        color: #155724;
      }
      .badge-sold {
        background: #f8d7da;
        color: #721c24;
      }
      .badge-reserved {
        background: #fff3cd;
        color: #856404;
      }
      .badge-neu {
        background: #cce5ff;
        color: #004085;
      }
      .badge-gebraucht {
        background: #e2e3e5;
        color: #383d41;
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
        border-bottom: 1px solid #f0f0f0;
      }
      .doc-actions {
        display: flex;
        gap: 4px;
      }
      .empty {
        color: #999;
        font-style: italic;
      }
    `,
  ],
})
export class BicycleDetailComponent implements OnInit {
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
    fahrradtyp: '',
    status: BikeStatus.Available,
    zustand: BikeCondition.Gebraucht,
  };

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
    if (confirm(`Dokument "${doc.fileName}" löschen?`)) {
      this.documentService.delete(doc.id).subscribe(() => {
        this.documents = this.documents.filter((d) => d.id !== doc.id);
      });
    }
  }
}
