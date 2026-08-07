import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

/**
 * Sichtbarer Hinweis, wenn ein Neu-Formular seine Felder aus einem
 * sessionStorage-Entwurf wiederhergestellt hat (siehe FormDraftService).
 * Ein Formular, das ungefragt gefüllt aufgeht, verwirrt mehr als es hilft —
 * deshalb hier fest mit einem Weg, den Entwurf zu verwerfen und leer
 * weiterzumachen. `filesLost` blendet zusätzlich den Hinweis ein, dass
 * Fotos/Dateien nicht Teil des Entwurfs waren (die lassen sich nicht in
 * sessionStorage ablegen) und erneut ausgewählt werden müssen.
 */
@Component({
  selector: 'app-draft-restored-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="draft-banner" role="status">
      <div class="draft-banner-text">
        <strong>{{ t.draftRestoredTitle }}</strong>
        <p>{{ t.draftRestoredMessage }}</p>
        <p class="draft-files-note" *ngIf="filesLost">
          {{ t.draftFilesLostNote }}
        </p>
      </div>
      <button type="button" class="draft-banner-discard" (click)="discard.emit()">
        {{ t.draftDiscard }}
      </button>
    </div>
  `,
  styles: [
    `
      .draft-banner {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        margin: 0 0 1.25rem;
        padding: 0.85rem 1rem;
        border-radius: 8px;
        background: #fff7e6;
        border: 1px solid #f0c36d;
        color: #6b4a00;
      }

      .draft-banner-text strong {
        display: block;
        margin-bottom: 0.2rem;
      }

      .draft-banner-text p {
        margin: 0.15rem 0 0;
        font-size: 0.88rem;
      }

      .draft-files-note {
        font-weight: 600;
      }

      .draft-banner-discard {
        flex-shrink: 0;
        padding: 0.4rem 0.85rem;
        border-radius: 6px;
        border: 1px solid #d99a1f;
        background: #fff;
        color: #6b4a00;
        font-size: 0.85rem;
        cursor: pointer;
        white-space: nowrap;
      }

      .draft-banner-discard:hover {
        background: #fff1d1;
      }
    `,
  ],
})
export class DraftRestoredBannerComponent {
  @Input() filesLost = false;
  @Output() discard = new EventEmitter<void>();

  private translationService = inject(TranslationService);
  get t() {
    return this.translationService.translations();
  }
}
