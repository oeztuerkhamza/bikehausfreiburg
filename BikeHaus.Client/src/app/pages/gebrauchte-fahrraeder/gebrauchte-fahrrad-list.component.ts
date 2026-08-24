import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BicycleService } from '../../services/bicycle.service';
import { NotificationService } from '../../services/notification.service';
import {
  Bicycle,
  BicycleCreate,
  BicycleImage,
  BikeCondition,
} from '../../models/models';
import { environment } from '../../../environments/environment';

/**
 * Gebrauchte Fahrräder für den Showroom.
 *
 * Der öffentliche Showroom speist sich aus zwei Quellen: den gescrapten
 * Kleinanzeigen-Anzeigen UND den eigenen Rädern, die hier auf „Website" gesetzt
 * werden (Flag `isPublishedOnWebsite`, ausgeliefert über
 * /api/public/gebrauchte-fahrraeder). Die Homepage wandelt sie in dasselbe
 * Listing-Format um, sie erscheinen also gemischt in derselben Liste.
 *
 * Wichtig für die Filter: Der Showroom filtert über den TITEL, nicht über
 * strukturierte Felder. Marke, Zoll, Gänge, Rahmengröße und Herren/Damen/Kinder
 * gehören deshalb gepflegt — daraus baut die Homepage einen Titel im gleichen
 * Format wie eine Kleinanzeigen-Anzeige. Die Vorschau unten zeigt live, was
 * dabei herauskommt.
 */
@Component({
  selector: 'app-gebrauchte-fahrrad-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Gebrauchte Fahrräder</h1>
          <p class="page-sub">
            Räder, die im Showroom erscheinen sollen, aber nicht über
            Kleinanzeigen laufen.
          </p>
        </div>
        <button class="btn btn-primary" (click)="startNew()">
          + Fahrrad hinzufügen
        </button>
      </div>

      <div class="info-box">
        Diese Räder erscheinen auf
        <strong>bikehausfreiburg.com/de/showroom</strong> zusammen mit den
        Kleinanzeigen-Anzeigen. Damit die Filter greifen, bitte Zoll,
        Rahmengröße, Gänge und Art (Herren/Damen/Kinder) ausfüllen — daraus wird
        der Anzeigentitel gebaut.
      </div>

      <div class="toolbar">
        <input
          type="text"
          class="search"
          placeholder="Suchen (Marke, Modell, Rahmennummer)…"
          [(ngModel)]="search"
        />
        <label class="check">
          <input type="checkbox" [(ngModel)]="onlyPublished" />
          Nur veröffentlichte
        </label>
        <span class="count">
          {{ publishedCount() }} im Showroom · {{ filtered().length }} angezeigt
        </span>
      </div>

      <div *ngIf="loading()" class="state">Lade Fahrräder…</div>
      <div *ngIf="!loading() && filtered().length === 0" class="state">
        <!-- Der Filter ist beim Öffnen aktiv. Ohne diesen Hinweis wirkt die
             leere Seite wie ein Fehler, obwohl nur nichts veröffentlicht ist. -->
        <ng-container *ngIf="onlyPublished && hiddenByFilter() > 0">
          Aktuell steht kein Fahrrad im Showroom.
          {{ hiddenByFilter() }} nicht veröffentlichte Rad(er) sind
          ausgeblendet —
          <button class="link-btn" (click)="onlyPublished = false">
            alle anzeigen
          </button>
        </ng-container>
        <ng-container *ngIf="!(onlyPublished && hiddenByFilter() > 0)">
          Keine Fahrräder gefunden.
        </ng-container>
      </div>

      <div class="grid" *ngIf="!loading() && filtered().length > 0">
        <article class="card" *ngFor="let b of filtered()">
          <div class="thumb" [class.empty]="!firstImage(b)">
            <img
              *ngIf="firstImage(b) as img"
              [src]="imageUrl(img)"
              [alt]="b.marke + ' ' + b.modell"
              loading="lazy"
            />
            <span *ngIf="!firstImage(b)" class="no-img">Kein Foto</span>
          </div>

          <div class="card-body">
            <div class="card-head">
              <h3>{{ b.marke }} {{ b.modell }}</h3>
              <span
                class="badge"
                [class.on]="b.isPublishedOnWebsite"
                [class.off]="!b.isPublishedOnWebsite"
              >
                {{ b.isPublishedOnWebsite ? 'Im Showroom' : 'Nicht sichtbar' }}
              </span>
            </div>

            <p class="title-preview" [title]="previewTitle(b)">
              {{ previewTitle(b) }}
            </p>

            <div class="meta">
              <span *ngIf="b.verkaufspreisVorschlag"
                >{{ b.verkaufspreisVorschlag }} €</span
              >
              <span *ngIf="!b.verkaufspreisVorschlag" class="warn"
                >Kein Preis</span
              >
              <span>{{ b.images?.length || 0 }} Foto(s)</span>
              <span class="warn" *ngIf="!b.images?.length"
                >Ohne Foto kaum verkäuflich</span
              >
            </div>

            <div class="card-actions">
              <button class="btn btn-sm btn-outline" (click)="startEdit(b)">
                Bearbeiten
              </button>
              <button
                class="btn btn-sm"
                [class.btn-primary]="!b.isPublishedOnWebsite"
                [class.btn-outline]="b.isPublishedOnWebsite"
                (click)="togglePublish(b)"
                [disabled]="busyId() === b.id"
              >
                {{
                  b.isPublishedOnWebsite
                    ? 'Aus Showroom nehmen'
                    : 'Im Showroom zeigen'
                }}
              </button>
            </div>
          </div>
        </article>
      </div>

      <!-- ── Formular ── -->
      <div class="modal-overlay" *ngIf="showForm()" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>{{ editing() ? 'Fahrrad bearbeiten' : 'Neues Fahrrad' }}</h2>

          <div class="form-grid">
            <div class="field">
              <label>Marke *</label>
              <input [(ngModel)]="form.marke" list="brandList" />
              <datalist id="brandList">
                <option *ngFor="let br of brands()" [value]="br"></option>
              </datalist>
            </div>
            <div class="field">
              <label>Modell</label>
              <input [(ngModel)]="form.modell" />
            </div>
            <div class="field">
              <label>Reifengröße (Zoll) *</label>
              <select [(ngModel)]="form.reifengroesse">
                <option value="">– wählen –</option>
                <option *ngFor="let z of zollOptions" [value]="z">
                  {{ z }}"
                </option>
              </select>
            </div>
            <div class="field">
              <label>Rahmengröße (size)</label>
              <input
                [(ngModel)]="form.rahmengroesse"
                placeholder="z. B. 52"
              />
            </div>
            <div class="field">
              <label>Gänge</label>
              <input
                [(ngModel)]="form.gangschaltung"
                placeholder="z. B. 21 Gänge"
              />
            </div>
            <div class="field">
              <label>Art</label>
              <select [(ngModel)]="form.art">
                <option value="">– wählen –</option>
                <option value="Herren">Herren</option>
                <option value="Damen">Damen</option>
                <option value="Kinder">Kinder</option>
              </select>
            </div>
            <div class="field">
              <label>Fahrradtyp</label>
              <select [(ngModel)]="form.fahrradtyp">
                <option value="">– wählen –</option>
                <option *ngFor="let t of typOptions" [value]="t">{{ t }}</option>
              </select>
            </div>
            <div class="field">
              <label>Farbe</label>
              <input [(ngModel)]="form.farbe" />
            </div>
            <div class="field">
              <label>Preis (€)</label>
              <input
                type="number"
                [(ngModel)]="form.verkaufspreisVorschlag"
                min="0"
                step="1"
              />
            </div>
            <div class="field">
              <label>Zustand</label>
              <select [(ngModel)]="form.zustand">
                <option value="Gebraucht">Gebraucht</option>
                <option value="Neu">Neu</option>
              </select>
            </div>
            <div class="field">
              <label>Rahmennummer</label>
              <input
                [(ngModel)]="form.rahmennummer"
                style="text-transform: uppercase"
              />
            </div>
            <div class="field full">
              <label>Beschreibung</label>
              <textarea
                [(ngModel)]="form.beschreibung"
                rows="4"
                placeholder="Ausstattung, Zustand, Besonderheiten…"
              ></textarea>
            </div>
          </div>

          <div class="preview-box">
            <span class="preview-label">So heißt das Rad im Showroom:</span>
            <strong>{{ formPreviewTitle() }}</strong>
            <small
              >Aus diesem Titel liest der Showroom die Filter (Zoll, Gänge,
              size, Herren/Damen/Kinder).</small
            >
          </div>

          <!-- Fotos: erst nach dem Anlegen, weil der Upload eine ID braucht -->
          <div class="photos" *ngIf="editing()">
            <div class="photos-head">
              <label>Fotos</label>
              <label class="upload-btn">
                + Foto hochladen
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  (change)="onUpload($event)"
                />
              </label>
            </div>
            <div class="photo-grid" *ngIf="gallery().length > 0">
              <div class="photo" *ngFor="let img of gallery()">
                <img [src]="imageUrl(img)" [alt]="'Foto'" />
                <button
                  class="photo-del"
                  (click)="deleteImage(img)"
                  title="Löschen"
                >
                  ✕
                </button>
              </div>
            </div>
            <p class="hint" *ngIf="gallery().length === 0">
              Noch keine Fotos. Ein Rad ohne Foto wird online kaum angeklickt.
            </p>
          </div>
          <p class="hint" *ngIf="!editing()">
            Fotos lassen sich hochladen, sobald das Fahrrad gespeichert ist.
          </p>

          <div class="modal-actions">
            <button class="btn btn-outline" (click)="closeForm()">
              Abbrechen
            </button>
            <button
              class="btn btn-primary"
              (click)="save()"
              [disabled]="saving()"
            >
              {{ saving() ? 'Speichert…' : 'Speichern' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1400px;
        margin: 0 auto;
        animation: fadeIn 0.4s ease;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 12px;
      }
      .page-header h1 {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
        margin: 0;
      }
      .page-sub {
        margin: 4px 0 0;
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
      .info-box {
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        border: 1px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        padding: 10px 14px;
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin-bottom: 16px;
      }
      .toolbar {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }
      .search {
        flex: 1;
        min-width: 220px;
        padding: 10px 14px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card, #fff);
        color: var(--text-primary);
      }
      .check {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.86rem;
        color: var(--text-secondary);
      }
      .count {
        font-size: 0.82rem;
        color: var(--text-secondary);
      }
      .state {
        padding: 40px;
        text-align: center;
        color: var(--text-secondary);
      }
      .link-btn {
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        color: var(--accent-primary, #6366f1);
        text-decoration: underline;
        cursor: pointer;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }
      .card {
        background: var(--bg-card, #fff);
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-lg, 14px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .thumb {
        height: 160px;
        background: var(--bg-secondary, #f1f5f9);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .no-img {
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
      .card-body {
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
      }
      .card-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
      }
      .card-head h3 {
        margin: 0;
        font-size: 0.98rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 20px;
        white-space: nowrap;
      }
      .badge.on {
        background: rgba(16, 185, 129, 0.14);
        color: #059669;
      }
      .badge.off {
        background: var(--bg-secondary, #f1f5f9);
        color: var(--text-secondary);
      }
      .title-preview {
        margin: 0;
        font-size: 0.8rem;
        color: var(--text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .meta {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        font-size: 0.78rem;
        color: var(--text-secondary);
        margin-top: auto;
      }
      .meta .warn {
        color: var(--accent-warning, #d97706);
        font-weight: 600;
      }
      .card-actions {
        display: flex;
        gap: 8px;
        padding-top: 6px;
      }
      .card-actions .btn {
        flex: 1;
      }

      .btn {
        padding: 9px 16px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        font-size: 0.86rem;
        cursor: pointer;
        border: 1.5px solid transparent;
      }
      .btn-sm {
        padding: 7px 10px;
        font-size: 0.78rem;
      }
      .btn-primary {
        background: var(--accent-primary, #6366f1);
        color: #fff;
      }
      .btn-outline {
        background: transparent;
        border-color: var(--border-light, #e2e8f0);
        color: var(--text-primary);
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 16px;
      }
      .modal {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 24px;
        width: 100%;
        max-width: 760px;
        max-height: 92vh;
        overflow-y: auto;
      }
      .modal h2 {
        margin: 0 0 16px;
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 12px;
      }
      .field.full {
        grid-column: 1 / -1;
      }
      .field label {
        display: block;
        font-size: 0.76rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        color: var(--text-secondary);
        margin-bottom: 4px;
      }
      .field input,
      .field select,
      .field textarea {
        width: 100%;
        padding: 9px 12px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        font-family: inherit;
        font-size: 0.9rem;
        box-sizing: border-box;
      }

      .preview-box {
        margin-top: 14px;
        padding: 12px 14px;
        border-radius: var(--radius-md, 10px);
        background: var(--bg-secondary, #f8fafc);
        border: 1.5px dashed var(--border-light, #e2e8f0);
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .preview-label {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-secondary);
        font-weight: 700;
      }
      .preview-box strong {
        font-size: 0.95rem;
        color: var(--text-primary);
      }
      .preview-box small,
      .hint {
        font-size: 0.76rem;
        color: var(--text-secondary);
      }

      .photos {
        margin-top: 18px;
      }
      .photos-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      .photos-head label {
        font-size: 0.76rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--text-secondary);
      }
      .upload-btn {
        cursor: pointer;
        padding: 7px 12px;
        border-radius: var(--radius-md, 10px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--accent-primary, #6366f1);
      }
      .photo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
        gap: 10px;
      }
      .photo {
        position: relative;
        aspect-ratio: 4 / 3;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid var(--border-light, #e2e8f0);
      }
      .photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .photo-del {
        position: absolute;
        top: 4px;
        right: 4px;
        border: none;
        border-radius: 50%;
        width: 22px;
        height: 22px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        cursor: pointer;
        line-height: 1;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 22px;
      }

      @media (max-width: 760px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class GebrauchteFahrradListComponent implements OnInit {
  private bicycleService = inject(BicycleService);
  private notify = inject(NotificationService);

  bikes = signal<Bicycle[]>([]);
  loading = signal(true);
  saving = signal(false);
  busyId = signal<number | null>(null);
  showForm = signal(false);
  editing = signal<Bicycle | null>(null);
  gallery = signal<BicycleImage[]>([]);
  brands = signal<string[]>([]);

  search = '';
  // Beim Öffnen zeigt die Seite nur, was tatsächlich im Showroom steht — das
  // ist die Frage, mit der man hierher kommt. Zum Anlegen oder Nachpflegen
  // eines noch nicht veröffentlichten Rades den Haken abwählen.
  onlyPublished = true;

  readonly zollOptions = [
    '12', '14', '16', '18', '20', '24', '26', '27.5', '28', '29',
  ];
  readonly typOptions = [
    'City', 'Trekking', 'MTB', 'Rennrad', 'Gravelbike', 'E-Bike',
    'Kinderfahrrad', 'Lastenrad', 'Hollandrad', 'Sonstige',
  ];

  form: BicycleCreate = this.emptyForm();

  publishedCount = computed(
    () => this.bikes().filter((b) => b.isPublishedOnWebsite).length,
  );

  /** Wie viele Räder der Veröffentlicht-Filter gerade ausblendet. */
  hiddenByFilter = computed(
    () => this.bikes().filter((b) => !b.isPublishedOnWebsite).length,
  );

  filtered = computed(() => {
    const term = this.search.trim().toLowerCase();
    return this.bikes().filter((b) => {
      if (this.onlyPublished && !b.isPublishedOnWebsite) return false;
      if (!term) return true;
      return [b.marke, b.modell, b.rahmennummer, b.farbe]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(term));
    });
  });

  ngOnInit(): void {
    this.load();
    this.bicycleService.getBrands().subscribe({
      next: (b) => this.brands.set(b),
      error: () => {},
    });
  }

  load(): void {
    this.loading.set(true);
    this.bicycleService.getAll().subscribe({
      next: (all) => {
        // Verkaufte und vermietete Räder gehören nicht in den Showroom.
        this.bikes.set(
          all.filter((b) => b.status === 'Available' || b.isPublishedOnWebsite),
        );
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notify.error('Fahrräder konnten nicht geladen werden.');
      },
    });
  }

  firstImage(b: Bicycle): BicycleImage | null {
    return b.images?.length ? b.images[0] : null;
  }

  imageUrl(img: BicycleImage): string {
    return `${environment.apiUrl}/public/gallery-image/${img.filePath}`;
  }

  /**
   * Zeigt exakt den Titel, den die Homepage aus diesen Feldern baut
   * (bicycle-listing-title.ts). Bewusst dupliziert statt geteilt: Admin und
   * Homepage sind getrennte Anwendungen ohne gemeinsames Paket. Wer das Format
   * dort ändert, muss es hier nachziehen — deshalb steht die Quelle im Kommentar.
   */
  private buildTitle(b: {
    reifengroesse?: string;
    zustand?: string;
    marke?: string;
    modell?: string;
    art?: string;
    fahrradtyp?: string;
    gangschaltung?: string;
    rahmengroesse?: string;
  }): string {
    const parts: string[] = [];
    if (b.reifengroesse) parts.push(`${b.reifengroesse} Zoll`);
    if (b.zustand === 'Neu') parts.push('neues');
    if (b.marke) parts.push(b.marke.trim());
    if (b.modell) parts.push(b.modell.trim());
    if (b.art) parts.push(b.art.trim());
    if (b.fahrradtyp && b.fahrradtyp.trim() !== b.art?.trim()) {
      parts.push(b.fahrradtyp.trim());
    }
    parts.push('Fahrrad.');
    const gears = (b.gangschaltung ?? '').match(/\d{1,2}/);
    if (gears) parts.push(`${gears[0]} Gänge.`);
    const size = (b.rahmengroesse ?? '').match(/\d{1,3}/);
    if (size) parts.push(`${size[0]} size.`);
    return parts.join(' ').replace(/\s{2,}/g, ' ').trim();
  }

  previewTitle(b: Bicycle): string {
    return this.buildTitle(b);
  }

  formPreviewTitle(): string {
    return this.buildTitle(this.form) || '—';
  }

  startNew(): void {
    this.editing.set(null);
    this.gallery.set([]);
    this.form = this.emptyForm();
    this.showForm.set(true);
  }

  startEdit(b: Bicycle): void {
    this.editing.set(b);
    this.form = {
      marke: b.marke,
      modell: b.modell,
      rahmennummer: b.rahmennummer,
      rahmengroesse: b.rahmengroesse,
      farbe: b.farbe,
      reifengroesse: b.reifengroesse,
      fahrradtyp: b.fahrradtyp,
      art: b.art,
      beschreibung: b.beschreibung,
      gangschaltung: b.gangschaltung,
      zustand: b.zustand,
      verkaufspreisVorschlag: b.verkaufspreisVorschlag,
    } as BicycleCreate;
    this.showForm.set(true);
    this.loadGallery(b.id);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  private loadGallery(id: number): void {
    this.bicycleService.getGallery(id).subscribe({
      next: (imgs) => this.gallery.set(imgs),
      error: () => this.gallery.set([]),
    });
  }

  save(): void {
    if (!this.form.marke?.trim()) {
      this.notify.error('Bitte eine Marke angeben.');
      return;
    }
    if (!this.form.reifengroesse) {
      this.notify.error('Bitte die Reifengröße angeben — sonst greift der Zoll-Filter im Showroom nicht.');
      return;
    }
    this.saving.set(true);
    const current = this.editing();

    if (current) {
      this.bicycleService
        .update(current.id, { ...this.form, status: current.status } as never)
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.notify.success('Fahrrad gespeichert.');
            this.showForm.set(false);
            this.load();
          },
          error: () => {
            this.saving.set(false);
            this.notify.error('Speichern fehlgeschlagen.');
          },
        });
      return;
    }

    this.bicycleService.create(this.form).subscribe({
      next: (created) => {
        this.saving.set(false);
        this.notify.success(
          'Fahrrad angelegt. Jetzt Fotos hochladen und im Showroom zeigen.',
        );
        // Direkt im Bearbeiten-Modus bleiben, damit Fotos ergänzt werden können.
        this.editing.set(created);
        this.loadGallery(created.id);
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.notify.error('Anlegen fehlgeschlagen.');
      },
    });
  }

  onUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const current = this.editing();
    if (!input.files?.length || !current) return;
    const files = Array.from(input.files);
    let pending = files.length;
    files.forEach((file) => {
      this.bicycleService.uploadGalleryImage(current.id, file).subscribe({
        next: () => {
          if (--pending === 0) {
            this.loadGallery(current.id);
            this.load();
          }
        },
        error: () => {
          if (--pending === 0) this.loadGallery(current.id);
          this.notify.error(`Foto ${file.name} konnte nicht hochgeladen werden.`);
        },
      });
    });
    input.value = '';
  }

  deleteImage(img: BicycleImage): void {
    const current = this.editing();
    if (!current) return;
    this.bicycleService.deleteGalleryImage(current.id, img.id).subscribe({
      next: () => {
        this.loadGallery(current.id);
        this.load();
      },
      error: () => this.notify.error('Foto konnte nicht gelöscht werden.'),
    });
  }

  togglePublish(b: Bicycle): void {
    // Ohne Foto im Showroom zu landen ist fast immer ein Versehen.
    if (!b.isPublishedOnWebsite && !b.images?.length) {
      this.notify.warning(
        'Dieses Rad hat kein Foto — im Showroom wird es kaum angeklickt.',
      );
    }
    this.busyId.set(b.id);
    this.bicycleService.togglePublishWebsite(b.id).subscribe({
      next: (updated) => {
        this.busyId.set(null);
        this.notify.success(
          updated.isPublishedOnWebsite
            ? 'Fahrrad erscheint jetzt im Showroom.'
            : 'Fahrrad aus dem Showroom genommen.',
        );
        this.load();
      },
      error: () => {
        this.busyId.set(null);
        this.notify.error('Status konnte nicht geändert werden.');
      },
    });
  }

  private emptyForm(): BicycleCreate {
    return {
      marke: '',
      modell: '',
      rahmennummer: undefined,
      rahmengroesse: undefined,
      farbe: undefined,
      reifengroesse: '',
      fahrradtyp: undefined,
      art: undefined,
      beschreibung: undefined,
      gangschaltung: undefined,
      zustand: 'Gebraucht' as BikeCondition,
      verkaufspreisVorschlag: undefined,
    } as BicycleCreate;
  }
}
