import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RentalService } from '../../services/rental.service';
import { NotificationService } from '../../services/notification.service';
import { DialogService } from '../../services/dialog.service';
import {
  Rental,
  RentalAbschluss,
  BikeConditionAtHandover,
} from '../../models/models';

@Component({
  selector: 'app-rental-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page" *ngIf="rental">
      <div class="page-header">
        <h1>Mietvertrag {{ rental.mietvertragNummer }}</h1>
        <div class="header-actions">
          <a
            [routerLink]="['/rentals/edit', rental.id]"
            class="btn btn-outline"
          >
            ✏️ Bearbeiten
          </a>
          <button class="btn btn-outline" (click)="previewMietvertrag()">
            🖨️ Mietvertrag
          </button>
          <button class="btn btn-outline" (click)="previewKaution()">
            🖨️ Kautionsquittung
          </button>
          <button
            *ngIf="rental.kautionZurueckgegeben"
            class="btn btn-outline"
            (click)="previewKautionRueckgabe()"
          >
            🖨️ Kautionsrückgabe
          </button>
          <button class="btn btn-outline" (click)="previewBedingungen()">
            🖨️ Mietbedingungen
          </button>
          <button
            *ngIf="rental.ausweisPhotoPath"
            class="btn btn-outline"
            (click)="downloadAusweis('vorderseite')"
          >
            🪪 Ausweis herunterladen{{ rental.ausweisPhotoRueckseitePath ? ' (Vorderseite)' : '' }}
          </button>
          <button
            *ngIf="rental.ausweisPhotoRueckseitePath"
            class="btn btn-outline"
            (click)="downloadAusweis('rueckseite')"
          >
            🪪 Ausweis herunterladen (Rückseite)
          </button>
          <a routerLink="/rentals" class="btn btn-outline">Zurück</a>
        </div>
      </div>

      <!-- Info cards -->
      <div class="info-grid">
        <div class="info-card">
          <h3>Mieter</h3>
          <div class="info-row">
            <span>Name:</span><strong>{{ rental.customer.fullName }}</strong>
          </div>
          <div class="info-row" *ngIf="rental.customer.fullAddress">
            <span>Adresse:</span><span>{{ rental.customer.fullAddress }}</span>
          </div>
          <div class="info-row" *ngIf="rental.customer.telefon">
            <span>Telefon:</span><span>{{ rental.customer.telefon }}</span>
          </div>
          <div class="info-row" *ngIf="rental.customer.email">
            <span>E-Mail:</span><span>{{ rental.customer.email }}</span>
          </div>
        </div>

        <div class="info-card">
          <h3>
            {{
              rental.bikes.length > 1
                ? rental.bikes.length + ' Fahrräder'
                : 'Fahrrad'
            }}
          </h3>
          <div
            class="bike-block"
            *ngFor="let rb of rental.bikes; let i = index"
          >
            <h4 *ngIf="rental.bikes.length > 1">
              {{ i + 1 }}. {{ rb.bicycle.marke }} {{ rb.bicycle.modell }}
            </h4>
            <div class="info-row" *ngIf="rental.bikes.length === 1">
              <span>Marke/Modell:</span
              ><strong>{{ rb.bicycle.marke }} {{ rb.bicycle.modell }}</strong>
            </div>
            <div
              class="info-row"
              *ngIf="rb.rahmennummer || rb.bicycle.rahmennummer"
            >
              <span>Rahmennummer:</span
              ><span>{{ rb.rahmennummer || rb.bicycle.rahmennummer }}</span>
            </div>
            <div class="info-row" *ngIf="rb.farbe || rb.bicycle.farbe">
              <span>Farbe:</span><span>{{ rb.farbe || rb.bicycle.farbe }}</span>
            </div>
            <div class="info-row" *ngIf="rb.bicycle.reifengroesse">
              <span>Reifengröße:</span
              ><span>{{ rb.bicycle.reifengroesse }}</span>
            </div>
            <div class="info-row">
              <span>Mietpreis:</span
              ><strong>{{ rb.mietpreis | number: '1.2-2' }} €</strong>
            </div>
            <div class="info-row">
              <span>Kaution:</span
              ><strong>{{ rb.kaution | number: '1.2-2' }} €</strong>
            </div>
            <div class="info-row">
              <span>Zeitraum:</span>
              <span
                >{{ rb.startDatum | date: 'dd.MM.yyyy' }} –
                {{ rb.endDatum | date: 'dd.MM.yyyy' }}</span
              >
            </div>
            <div class="info-row">
              <span>Zustand:</span
              ><span>{{ getZustandText(rb.zustandBeiUebergabe) }}</span>
            </div>
          </div>
        </div>

        <div class="info-card">
          <h3>Mietdetails</h3>
          <!-- Belegdatum des Vertrags — steht so auf PDF und Quittung. -->
          <div class="info-row">
            <span>Vertragsdatum:</span
            ><strong>{{ rental.vertragsdatum | date: 'dd.MM.yyyy' }}</strong>
          </div>
          <div class="info-row">
            <span>Von:</span
            ><strong>{{ rental.startDatum | date: 'dd.MM.yyyy' }}</strong>
          </div>
          <div class="info-row">
            <span>Bis:</span
            ><strong>{{ rental.endDatum | date: 'dd.MM.yyyy' }}</strong>
          </div>
          <div class="info-row">
            <span>Gesamtmiete:</span
            ><strong>{{ rental.gesamtmiete | number: '1.2-2' }} €</strong>
          </div>
          <div class="info-row" *ngIf="rental.rabatt > 0">
            <span>Rabatt:</span
            ><strong style="color: var(--accent-success, #10b981)"
              >- {{ rental.rabatt | number: '1.2-2' }} €</strong
            >
          </div>
          <div class="info-row">
            <span>Kaution:</span
            ><strong>{{ rental.kaution | number: '1.2-2' }} €</strong>
          </div>
          <div class="info-row">
            <span>Zahlungsart Miete:</span
            ><span>{{ getZahlungsartText(rental.zahlungsart) }}</span>
          </div>
          <div class="info-row">
            <span>Zahlungsart Kaution:</span
            ><span>{{ getZahlungsartText(rental.kautionZahlungsart) }}</span>
          </div>
          <div class="info-row">
            <span>Kaution zurück:</span>
            <span
              [class.text-success]="rental.kautionZurueckgegeben"
              [class.text-danger]="!rental.kautionZurueckgegeben"
            >
              {{ rental.kautionZurueckgegeben ? 'Ja' : 'Nein' }}
            </span>
          </div>
          <div class="info-row">
            <span>Status:</span>
            <span
              class="status-badge"
              [class]="getStatusClass(rental.status)"
              >{{ getStatusText(rental.status) }}</span
            >
          </div>
        </div>
      </div>

      <!-- Return summary (after return) -->
      <div
        class="info-card return-summary"
        *ngIf="rental.status === 'Returned' && hasReturnData(rental)"
      >
        <h3>Rückgabe-Abrechnung</h3>
        <div *ngFor="let rb of rental.bikes">
          <div class="bike-block-header" *ngIf="rental.bikes.length > 1">
            <strong>{{ rb.bicycle.marke }} {{ rb.bicycle.modell }}</strong>
          </div>
          <div class="info-row" *ngIf="rb.zustandBeiRueckgabe">
            <span>Zustand bei Rückgabe:</span>
            <span>{{ getZustandText(rb.zustandBeiRueckgabe) }}</span>
          </div>
          <div class="info-row" *ngIf="rb.tatsaechlichesRueckgabeDatum">
            <span>Tatsächl. Rückgabe:</span>
            <span>{{
              rb.tatsaechlichesRueckgabeDatum | date: 'dd.MM.yyyy'
            }}</span>
          </div>
          <div class="info-row" *ngIf="rb.schadenAbzug > 0">
            <span>Schadensabzug:</span>
            <span class="text-danger"
              >- {{ rb.schadenAbzug | number: '1.2-2' }} €</span
            >
          </div>
          <div class="info-row" *ngIf="rb.verspaetungsAbzug > 0">
            <span>Verspätungsabzug:</span>
            <span class="text-danger"
              >- {{ rb.verspaetungsAbzug | number: '1.2-2' }} €</span
            >
          </div>
          <div class="info-row" *ngIf="rb.abzugNotizen">
            <span>Notizen:</span>
            <span>{{ rb.abzugNotizen }}</span>
          </div>
        </div>
        <ng-container *ngIf="getLostAccessories(rental).length > 0">
          <div class="info-row" *ngFor="let acc of getLostAccessories(rental)">
            <span>Verlust: {{ acc.bezeichnung }}</span>
            <span class="text-danger"
              >- {{ acc.verlustgebuehr | number: '1.2-2' }} €</span
            >
          </div>
        </ng-container>
        <div class="info-row total-row">
          <span>Kaution gesamt:</span>
          <strong>{{ rental.kaution | number: '1.2-2' }} €</strong>
        </div>
        <div class="info-row total-row" *ngIf="getTotalAbzug(rental) > 0">
          <span>Gesamtabzug:</span>
          <strong class="text-danger"
            >- {{ getTotalAbzug(rental) | number: '1.2-2' }} €</strong
          >
        </div>
        <div class="info-row total-row highlight">
          <span>Rückzahlung an Mieter:</span>
          <strong class="text-success"
            >{{ getKautionRueckgabeBetrag(rental) | number: '1.2-2' }} €</strong
          >
        </div>
      </div>

      <!-- Rückgabe: EIN Weg, der alles erledigt (Rad + Zubehör + Kaution).
           Solange die Kaution offen ist, ist der Vertrag nicht abgeschlossen. -->
      <div class="action-bar" *ngIf="!istAbgeschlossen()">
        <button class="btn btn-success" (click)="openReturnModal()">
          ✅ Rückgabe abschließen
        </button>
        <button
          class="btn btn-danger"
          (click)="cancelRental()"
          *ngIf="rental.status === 'Active'"
        >
          ✖ Stornieren
        </button>
      </div>
      <div class="offen-hinweis" *ngIf="rental.status === 'Returned' && !rental.kautionZurueckgegeben">
        ⚠ Das Rad ist zurück, aber die Kaution steht noch offen — der Vertrag
        bleibt in der Liste, bis sie abgerechnet ist.
      </div>

      <!-- Notes -->
      <div class="info-card" *ngIf="rental.notizen" style="margin-top: 20px;">
        <h3>Notizen</h3>
        <p>{{ rental.notizen }}</p>
      </div>

      <!-- Löschen. Bewusst NICHT verfügbar, solange der Vertrag läuft oder die
           Kaution offen ist: bei der Übergabe steht dieser Knopf sonst neben
           dem Rückgabeknopf, und ein Fehlgriff löscht den Beleg der Vermietung.
           Erst abschließen oder stornieren, dann löschen. -->
      <div class="action-bar" style="margin-top: 20px;" *ngIf="darfGeloeschtWerden()">
        <button class="btn btn-danger" (click)="deleteRental()">
          🗑 Löschen
        </button>
      </div>
      <p class="loeschen-gesperrt" *ngIf="!darfGeloeschtWerden()">
        🔒 Der Mietvertrag kann erst gelöscht werden, wenn er abgeschlossen oder
        storniert ist — er ist der Beleg über die Vermietung.
      </p>
    </div>

    <!-- Return Checklist Modal -->
    <div
      class="modal-backdrop return-backdrop"
      *ngIf="showReturnModal"
      (click)="closeReturnModal()"
    >
      <div class="modal modal-return" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>✅ Rückgabe abschließen</h3>
          <button class="modal-close" (click)="closeReturnModal()">✕</button>
        </div>
        <!-- Schrittanzeige: ein Weg von der Radannahme bis zur quittierten
             Kaution, damit am Ladentisch nichts halb erledigt liegen bleibt.
             Auf dem Handy entfällt sie — dort steht alles auf einer Seite. -->
        <div class="schritt-leiste" *ngIf="!einSeitenModus">
          <span
            class="schritt"
            *ngFor="let sch of schritte; let i = index"
            [class.aktiv]="i === schrittIndex"
            [class.erledigt]="i < schrittIndex"
          >
            {{ i + 1 }}. {{ schrittTitel(sch) }}
          </span>
        </div>
        <div class="modal-body return-body">
          <!-- SCHRITT 1: Fahrräder -->
          <div
            class="return-bike-block"
            *ngFor="let bikeForm of returnBikeForms; let i = index"
            [hidden]="!zeigeSchritt('raeder')"
          >
            <div class="return-bike-title">
              🚲 {{ bikeForm.bikeLabel }}
              <span class="planned-end"
                >Geplant bis:
                {{ bikeForm.plannedEndDatum | date: 'dd.MM.yyyy' }}</span
              >
            </div>

            <div class="form-row">
              <label>Tatsächl. Rückgabedatum</label>
              <input
                type="date"
                [(ngModel)]="bikeForm.tatsaechlichesRueckgabeDatum"
                (change)="onReturnDateChange(i)"
              />
              <span class="overdue-hint" *ngIf="isOverdue(i)">
                ⚠ {{ getOverdueDays(i) }} Tag(e) zu spät
              </span>
            </div>

            <div class="form-row">
              <label>Zustand bei Rückgabe</label>
              <select [(ngModel)]="bikeForm.zustandBeiRueckgabe">
                <option value="SehrGut">Sehr gut</option>
                <option value="Gut">Gut</option>
                <option value="Gebrauchsspuren">Gebrauchsspuren</option>
              </select>
            </div>

            <div class="form-row">
              <label>Schadensabzug (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                [(ngModel)]="bikeForm.schadenAbzug"
                placeholder="0,00"
              />
            </div>

            <div class="form-row">
              <label>Verspätungsgebühr (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                [(ngModel)]="bikeForm.verspaetungsAbzug"
                placeholder="0,00"
              />
              <span class="hint" *ngIf="isOverdue(i)">
                Tagesmiete:
                {{ bikeForm.mietpreis | number: '1.2-2' }} € ×
                {{ getOverdueDays(i) }} Tage =
                {{ getSuggestedLateFee(i) | number: '1.2-2' }} €
                <button class="btn-link" (click)="applySuggestedLateFee(i)">
                  Übernehmen
                </button>
              </span>
            </div>

            <div class="form-row">
              <label>Notizen</label>
              <input
                type="text"
                [(ngModel)]="bikeForm.abzugNotizen"
                placeholder="Optionale Anmerkungen"
              />
            </div>

            <div class="bike-kaution-calc">
              <span
                >Kaution:
                <strong
                  >{{ bikeForm.kaution | number: '1.2-2' }} €</strong
                ></span
              >
              <span *ngIf="getBikeAbzug(i) > 0" class="text-danger">
                − {{ getBikeAbzug(i) | number: '1.2-2' }} €
              </span>
              <span class="text-success">
                =
                <strong
                  >{{ getBikeKautionRueckgabe(i) | number: '1.2-2' }} €</strong
                >
              </span>
            </div>
          </div>

          <!-- SCHRITT 2: Zubehör -->
          <div
            class="return-section"
            *ngIf="returnAccessoryForms.length > 0"
            [hidden]="!zeigeSchritt('zubehoer')"
          >
            <div class="return-section-title">📦 Zubehör</div>
            <div
              class="acc-row"
              *ngFor="let accForm of returnAccessoryForms; let j = index"
            >
              <label class="acc-check">
                <input type="checkbox" [(ngModel)]="accForm.zurueckgegeben" />
                {{ accForm.bezeichnung }}
                (× {{ accForm.menge }})
                <!-- Einmaliges Zubehör (Verbrauchsmaterial): Haken weg = wurde
                     verbraucht und wird berechnet. Bleibt der Haken, kostet es
                     nichts. -->
                <small class="acc-einmalig" *ngIf="accForm.einmalig">
                  einmalig · Haken entfernen = verbraucht
                </small>
              </label>
              <span
                class="acc-verbrauch"
                *ngIf="accForm.einmalig && !accForm.zurueckgegeben"
              >
                Wird berechnet:
                <strong
                  >{{
                    accForm.tagespreis * accForm.menge | number: '1.2-2'
                  }}
                  €</strong
                >
              </span>
              <span
                class="acc-loss"
                *ngIf="!accForm.einmalig && !accForm.zurueckgegeben && accForm.verlustgebuehr"
              >
                Verlustgebühr:
                <strong class="text-danger"
                  >{{ accForm.verlustgebuehr | number: '1.2-2' }} €</strong
                >
              </span>
            </div>
          </div>

          <!-- SCHRITT 3: Kaution abrechnen und quittieren -->
          <div [hidden]="!zeigeSchritt('kaution')">
          <div class="return-section-title" *ngIf="einSeitenModus">
            💶 Kaution
          </div>
          <div class="return-summary-box">
            <div class="summary-row">
              <span>Kaution gesamt:</span>
              <strong>{{ rental?.kaution | number: '1.2-2' }} €</strong>
            </div>
            <div class="summary-row" *ngIf="getModalTotalAbzug() > 0">
              <span>Gesamtabzug:</span>
              <strong class="text-danger"
                >− {{ getModalTotalAbzug() | number: '1.2-2' }} €</strong
              >
            </div>
            <div class="summary-row total">
              <span>Rückzahlung an Mieter:</span>
              <strong class="text-success"
                >{{ getModalKautionRueckgabe() | number: '1.2-2' }} €</strong
              >
            </div>
          </div>

          <div class="sig-block" *ngIf="brauchtUnterschrift()">
            <p class="sig-info">
              <strong>{{ getModalKautionRueckgabe() | number: '1.2-2' }} €</strong>
              gehen an <strong>{{ rental?.customer?.fullName }}</strong> zurück.
              Bitte Unterschrift des Mieters.
            </p>
            <div class="sig-canvas-wrap">
              <canvas
                id="kautionSignatureCanvas"
                width="460"
                height="160"
                (mousedown)="onSigMouseDown($event)"
                (mousemove)="onSigMouseMove($event)"
                (mouseup)="onSigEnd()"
                (mouseleave)="onSigEnd()"
                (touchstart)="onSigTouchStart($event)"
                (touchmove)="onSigTouchMove($event)"
                (touchend)="onSigEnd()"
              ></canvas>
              <span class="sig-placeholder" *ngIf="sigIsEmpty"
                >Hier unterschreiben ...</span
              >
            </div>
            <button class="btn btn-outline btn-sm" (click)="clearSignature()">
              🗑 Unterschrift löschen
            </button>
          </div>
          <p class="ohne-kaution-hinweis" *ngIf="!brauchtUnterschrift()">
            Für diesen Vertrag steht keine Kaution offen — es gibt nichts
            auszuzahlen und nichts zu quittieren.
          </p>
          </div>
        </div>

        <!-- Fußleiste außerhalb des Scrollbereichs: die Knöpfe bleiben immer
             sichtbar und rutschen auf dem Handy nicht unter die Browserleiste. -->
        <div class="return-actions">
          <button
            class="btn btn-outline"
            (click)="schrittZurueck()"
            *ngIf="!einSeitenModus && schrittIndex > 0"
          >
            ‹ Zurück
          </button>
          <button class="btn btn-outline" (click)="closeReturnModal()">
            Abbrechen
          </button>
          <button
            class="btn btn-primary"
            (click)="schrittWeiter()"
            *ngIf="!einSeitenModus && schrittIndex < schritte.length - 1"
          >
            Weiter ›
          </button>
          <button
            class="btn btn-success"
            (click)="abschlussSpeichern()"
            *ngIf="einSeitenModus || schrittIndex === schritte.length - 1"
            [disabled]="abschlussLaeuft || (brauchtUnterschrift() && sigIsEmpty)"
          >
            {{ abschlussLaeuft ? 'Wird gespeichert…' : '✅ Abschließen' }}
          </button>
        </div>
      </div>
    </div>

    <!-- PDF Preview Modal -->
    <div
      class="modal-backdrop"
      *ngIf="showPdfPreview"
      (click)="closePdfPreview()"
    >
      <div class="modal modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ pdfPreviewTitle }}</h3>
          <div class="modal-header-actions">
            <!-- Safari auf dem iPhone zeigt PDFs im eingebetteten Rahmen nicht
                 zuverlässig; in einem eigenen Tab rendert es sie selbst. -->
            <button class="btn btn-sm" (click)="openCurrentPdfInNewTab()">
              ↗️ Öffnen
            </button>
            <button class="btn btn-sm" (click)="downloadCurrentPdf()">
              📥 Download
            </button>
            <button class="btn btn-sm" (click)="printCurrentPdf()">
              🖨️ Drucken
            </button>
            <button class="modal-close" (click)="closePdfPreview()">✕</button>
          </div>
        </div>
        <div class="modal-body pdf-preview-body">
          <iframe
            *ngIf="pdfPreviewUrl"
            #pdfPreviewIframe
            [src]="pdfPreviewUrl"
            class="pdf-iframe"
          ></iframe>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1000px;
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
        gap: 8px;
        flex-wrap: wrap;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }
      .info-card {
        background: var(--bg-card);
        border-radius: var(--radius-lg, 14px);
        border: 1px solid var(--border-light);
        box-shadow: var(--shadow-sm);
        padding: 20px;
      }
      .info-card h3 {
        margin: 0 0 14px 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--accent-primary);
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid var(--border-light);
        font-size: 0.88rem;
      }
      .info-row:last-child {
        border-bottom: none;
      }
      .info-row span:first-child {
        color: var(--text-muted);
      }
      .text-success {
        color: var(--accent-success, #10b981);
        font-weight: 600;
      }
      .text-danger {
        color: var(--accent-danger, #ef4444);
        font-weight: 600;
      }
      .schritt-leiste {
        display: flex;
        gap: 6px;
        padding: 10px 16px;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
        flex-wrap: wrap;
      }
      .schritt {
        font-size: 0.78rem;
        padding: 5px 12px;
        border-radius: 999px;
        background: var(--bg-hover, #f1f5f9);
        color: var(--text-muted, #94a3b8);
      }
      .schritt.aktiv {
        background: rgba(16, 185, 129, 0.14);
        color: #047857;
        font-weight: 600;
      }
      .schritt.erledigt {
        color: #10b981;
      }
      .offen-hinweis {
        margin: 14px 0 0;
        padding: 11px 14px;
        border-radius: 10px;
        background: rgba(240, 178, 50, 0.14);
        color: #92400e;
        font-size: 0.88rem;
      }
      .loeschen-gesperrt {
        margin-top: 20px;
        font-size: 0.82rem;
        color: var(--text-muted, #94a3b8);
      }
      .ohne-kaution-hinweis {
        margin: 8px 0 0;
        font-size: 0.86rem;
        color: var(--text-muted, #94a3b8);
      }
      .sig-block {
        margin-top: 14px;
      }
      .status-badge {
        display: inline-block;
        padding: 4px 11px;
        border-radius: 50px;
        font-size: 0.75rem;
        font-weight: 600;
      }
      .status-active {
        background: rgba(16, 185, 129, 0.08);
        color: #10b981;
      }
      .status-returned {
        background: rgba(59, 130, 246, 0.08);
        color: #3b82f6;
      }
      .status-cancelled {
        background: rgba(100, 116, 139, 0.08);
        color: #64748b;
      }
      .action-bar {
        display: flex;
        gap: 12px;
        margin-top: 20px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .btn {
        padding: 10px 20px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        font-size: 0.88rem;
        cursor: pointer;
        border: none;
        transition: var(--transition-fast);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
      }
      .btn-outline {
        background: transparent;
        border: 1.5px solid var(--border-color);
        color: var(--text-primary);
      }
      .btn-outline:hover {
        background: var(--bg-secondary);
      }
      .btn-sm {
        padding: 6px 12px;
        font-size: 0.82rem;
      }
      .btn-success {
        background: var(--accent-success, #10b981);
        color: white;
      }
      .btn-success:hover {
        background: #059669;
      }
      .btn-warning {
        background: #f59e0b;
        color: white;
      }
      .btn-warning:hover {
        background: #d97706;
      }
      .btn-danger {
        background: var(--accent-danger, #ef4444);
        color: white;
      }
      .btn-danger:hover {
        background: #dc2626;
      }
      /* Modal */
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-xl, 20px);
        width: 90%;
        max-width: 420px;
        overflow: hidden;
        box-shadow: var(--shadow-xl);
      }
      .modal-lg {
        max-width: 900px;
        height: 85vh;
        display: flex;
        flex-direction: column;
      }
      .modal-header {
        padding: 16px 22px;
        border-bottom: 1px solid var(--border-light);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-header h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
      }
      .modal-header-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .modal-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: var(--text-muted);
        padding: 4px 8px;
      }
      .modal-close:hover {
        background: var(--bg-secondary);
        border-radius: 6px;
      }
      .pdf-preview-body {
        flex: 1;
        padding: 0;
        overflow: hidden;
      }
      .pdf-iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
      .modal-sig {
        max-width: 540px;
      }
      .sig-body {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .sig-info {
        font-size: 0.9rem;
        color: var(--text-secondary);
        line-height: 1.7;
        margin: 0;
      }
      .sig-canvas-wrap {
        position: relative;
        border: 2px dashed var(--border-color);
        border-radius: var(--radius-md, 10px);
        background: #fff;
        cursor: crosshair;
        overflow: hidden;
      }
      #kautionSignatureCanvas {
        display: block;
        width: 100%;
        height: 160px;
        touch-action: none;
      }
      .sig-placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        color: #94a3b8;
        pointer-events: none;
      }
      .sig-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
      /* Return modal */
      /* [hidden] verliert sonst gegen das display:flex der Schritt-Blöcke —
         ohne diese Regel zeigt der Assistent alle Schritte gleichzeitig an. */
      [hidden] {
        display: none !important;
      }
      .modal-return {
        max-width: 640px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
      }
      .return-body {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        overflow-y: auto;
        flex: 1 1 auto;
        min-height: 0;
        overscroll-behavior: contain;
      }
      .return-bike-block {
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md, 10px);
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: var(--bg-secondary);
      }
      .return-bike-title {
        font-weight: 700;
        font-size: 0.9rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
      }
      .planned-end {
        font-size: 0.78rem;
        font-weight: 400;
        color: var(--text-muted);
      }
      .form-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .form-row label {
        font-size: 0.8rem;
        color: var(--text-muted);
        font-weight: 600;
      }
      .form-row input,
      .form-row select {
        padding: 7px 10px;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm, 6px);
        font-size: 0.88rem;
        background: var(--bg-card);
        color: var(--text-primary);
      }
      .overdue-hint {
        font-size: 0.78rem;
        color: #f59e0b;
        font-weight: 600;
      }
      .hint {
        font-size: 0.78rem;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .btn-link {
        background: none;
        border: none;
        color: var(--accent-primary);
        cursor: pointer;
        font-size: 0.78rem;
        padding: 0;
        text-decoration: underline;
      }
      .bike-kaution-calc {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
        font-size: 0.85rem;
        padding-top: 6px;
        border-top: 1px solid var(--border-light);
      }
      .return-section {
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md, 10px);
        padding: 14px;
      }
      .return-section-title {
        font-weight: 700;
        font-size: 0.88rem;
        margin-bottom: 10px;
      }
      .acc-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid var(--border-light);
        font-size: 0.85rem;
        flex-wrap: wrap;
        gap: 6px;
      }
      .acc-row:last-child {
        border-bottom: none;
      }
      .acc-check {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 0.85rem;
      }
      .acc-check input[type='checkbox'] {
        width: 16px;
        height: 16px;
        cursor: pointer;
      }
      .acc-loss {
        font-size: 0.82rem;
      }
      .acc-verbrauch {
        font-size: 0.82rem;
        color: #0f766e;
      }
      .acc-einmalig {
        display: block;
        font-size: 0.72rem;
        color: var(--text-muted, #94a3b8);
      }
      .return-summary-box {
        background: var(--bg-secondary);
        border-radius: var(--radius-md, 10px);
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .summary-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.88rem;
      }
      .summary-row.total {
        border-top: 2px solid var(--border-color);
        padding-top: 8px;
        margin-top: 4px;
        font-size: 1rem;
      }
      .return-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        flex-wrap: wrap;
        flex-shrink: 0;
        padding: 12px 20px calc(12px + env(safe-area-inset-bottom, 0px));
        border-top: 1px solid var(--border-light);
        background: var(--bg-card);
      }
      /* Handy: Vollbild statt schwebendem Fenster. 100dvh richtet sich nach
         dem tatsächlich sichtbaren Ausschnitt, dadurch bleibt die Fußleiste
         mit den Knöpfen oberhalb der Safari-Leiste erreichbar;
         env(safe-area-inset-bottom) polstert den Home-Steg. */
      @media (max-width: 640px) {
        .return-backdrop {
          align-items: stretch;
        }
        .modal-return {
          width: 100%;
          max-width: none;
          height: 100vh;
          height: 100dvh;
          max-height: none;
          border-radius: 0;
        }
        .return-body {
          padding-bottom: 28px;
        }
        .return-actions {
          padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
        }
        .return-actions .btn {
          flex: 1 1 auto;
          padding: 12px 10px;
        }
        /* iOS zoomt bei Eingabefeldern unter 16px automatisch hinein und
           verschiebt dabei das Formular. */
        .return-body input,
        .return-body select {
          font-size: 16px;
        }
      }
      /* Return summary on detail page */
      .return-summary {
        margin-top: 20px;
      }
      .bike-block-header {
        font-size: 0.88rem;
        padding: 6px 0 2px 0;
        color: var(--text-muted);
      }
      .total-row {
        font-weight: 700;
      }
      .highlight {
        background: rgba(16, 185, 129, 0.06);
        padding: 6px 0;
        border-radius: 6px;
      }
    `,
  ],
})
export class RentalDetailComponent implements OnInit {
  private rentalService = inject(RentalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private dialogService = inject(DialogService);
  private sanitizer = inject(DomSanitizer);

  rental: Rental | null = null;
  showPdfPreview = false;
  /** Für das iframe: vom DomSanitizer freigegebener Blob-Link. */
  pdfPreviewUrl: SafeResourceUrl | null = null;
  /** Derselbe Link als Zeichenkette — zum Öffnen und zum Widerrufen. */
  private pdfPreviewRawUrl: string | null = null;
  pdfPreviewTitle = '';
  private currentPdfBlob: Blob | null = null;
  private currentPdfFilename = '';
  @ViewChild('pdfPreviewIframe') pdfPreviewIframe?: ElementRef<HTMLIFrameElement>;

  // Signature modal
  sigIsEmpty = true;
  private sigDrawing = false;

  // Rückgabe-Assistent: ein Ablauf von der Radannahme bis zur quittierten
  // Kaution. "zubehoer" fällt weg, wenn der Vertrag kein Zubehör hat.
  showReturnModal = false;
  /** Handy: alle Schritte auf einer Seite statt als Assistent. */
  einSeitenModus = false;
  schritte: Array<'raeder' | 'zubehoer' | 'kaution'> = ['raeder', 'kaution'];
  schrittIndex = 0;
  abschlussLaeuft = false;
  returnBikeForms: {
    rentalBikeId: number;
    bikeLabel: string;
    plannedEndDatum: string;
    kaution: number;
    mietpreis: number;
    zustandBeiRueckgabe: BikeConditionAtHandover;
    schadenAbzug: number;
    verspaetungsAbzug: number;
    tatsaechlichesRueckgabeDatum: string;
    abzugNotizen: string;
  }[] = [];
  returnAccessoryForms: {
    rentalAccessoryItemId: number;
    bezeichnung: string;
    menge: number;
    verlustgebuehr: number | undefined;
    zurueckgegeben: boolean;
    einmalig: boolean;
    tagespreis: number;
  }[] = [];

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadRental(id);
  }

  loadRental(id: number) {
    this.rentalService.getById(id).subscribe({
      next: (rental) => (this.rental = rental),
      error: () => {
        this.notificationService.error('Mietvertrag nicht gefunden');
        this.router.navigate(['/rentals']);
      },
    });
  }

  getZustandText(z: string): string {
    const map: Record<string, string> = {
      SehrGut: 'Sehr gut',
      Gut: 'Gut',
      Gebrauchsspuren: 'Gebrauchsspuren',
    };
    return map[z] || z;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      Active: 'status-active',
      Returned: 'status-returned',
      Cancelled: 'status-cancelled',
    };
    return map[status] || '';
  }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      Active: 'Aktiv',
      Returned: 'Zurückgegeben',
      Cancelled: 'Storniert',
    };
    return map[status] || status;
  }

  getZahlungsartText(z: string): string {
    const map: Record<string, string> = {
      Bar: 'Bar',
      PayPal: 'PayPal',
      Karte: 'Karte',
      Überweisung: 'Überweisung',
      OhneKaution: 'Ohne Kaution',
    };
    return map[z] || z;
  }

  openReturnModal() {
    if (!this.rental) return;
    const today = new Date().toISOString().split('T')[0];
    this.returnBikeForms = this.rental.bikes.map((rb) => ({
      rentalBikeId: rb.id,
      bikeLabel: `${rb.bicycle.marke} ${rb.bicycle.modell}`.trim(),
      plannedEndDatum: rb.endDatum,
      kaution: rb.kaution,
      mietpreis: rb.mietpreis,
      zustandBeiRueckgabe: BikeConditionAtHandover.Gut,
      schadenAbzug: 0,
      verspaetungsAbzug: 0,
      tatsaechlichesRueckgabeDatum: today,
      abzugNotizen: '',
    }));
    this.returnAccessoryForms = this.rental.accessories.map((acc) => ({
      rentalAccessoryItemId: acc.id,
      bezeichnung: acc.bezeichnung,
      menge: acc.menge,
      verlustgebuehr: acc.verlustgebuehr,
      zurueckgegeben: true,
      einmalig: acc.einmalig,
      tagespreis: acc.tagespreis,
    }));
    this.schritte = this.returnAccessoryForms.length > 0
      ? ['raeder', 'zubehoer', 'kaution']
      : ['raeder', 'kaution'];
    // Ist das Rad schon zurück und nur die Kaution offen, beginnt der Ablauf
    // direkt beim offenen Punkt statt bei schon erledigten Schritten.
    this.schrittIndex =
      this.rental?.status === 'Returned' ? this.schritte.length - 1 : 0;
    // Auf dem Handy ist der Schritt-Assistent unhandlich — dort steht alles
    // untereinander auf einer Seite, am Rechner bleibt der geführte Ablauf.
    this.einSeitenModus = window.matchMedia('(max-width: 640px)').matches;
    this.sigIsEmpty = true;
    this.showReturnModal = true;
    setTimeout(() => this.clearSignature());
  }

  closeReturnModal() {
    this.showReturnModal = false;
  }

  aktiverSchritt(): 'raeder' | 'zubehoer' | 'kaution' {
    return this.schritte[this.schrittIndex];
  }

  /** Im Ein-Seiten-Modus (Handy) sind alle Schritte gleichzeitig sichtbar. */
  zeigeSchritt(schritt: 'raeder' | 'zubehoer' | 'kaution'): boolean {
    return this.einSeitenModus || this.aktiverSchritt() === schritt;
  }

  schrittTitel(schritt: 'raeder' | 'zubehoer' | 'kaution'): string {
    return { raeder: 'Fahrräder', zubehoer: 'Zubehör', kaution: 'Kaution' }[schritt];
  }

  schrittWeiter() {
    if (this.schrittIndex < this.schritte.length - 1) {
      this.schrittIndex++;
      // Das Unterschriftfeld wird erst jetzt sichtbar und muss danach neu
      // aufgesetzt werden, sonst bleibt die Zeichenfläche leer/verschoben.
      if (this.aktiverSchritt() === 'kaution') setTimeout(() => this.clearSignature());
    }
  }

  schrittZurueck() {
    if (this.schrittIndex > 0) this.schrittIndex--;
  }

  /** Unterschrift nur, wenn wirklich Geld zurückgeht. */
  brauchtUnterschrift(): boolean {
    return !!this.rental
      && (this.rental.kaution ?? 0) > 0
      && !this.rental.kautionZurueckgegeben;
  }

  /** Erledigt heißt: Rad zurück UND Kaution abgerechnet. Storniert zählt auch. */
  istAbgeschlossen(): boolean {
    if (!this.rental) return false;
    if (this.rental.status === 'Cancelled') return true;
    return this.rental.status === 'Returned' && this.rental.kautionZurueckgegeben;
  }

  /** Während der Übergabe wird nichts gelöscht — siehe Hinweis im Template. */
  darfGeloeschtWerden(): boolean {
    return this.istAbgeschlossen();
  }

  isOverdue(bikeIndex: number): boolean {
    const f = this.returnBikeForms[bikeIndex];
    if (!f) return false;
    return new Date(f.tatsaechlichesRueckgabeDatum) > new Date(f.plannedEndDatum);
  }

  getOverdueDays(bikeIndex: number): number {
    const f = this.returnBikeForms[bikeIndex];
    if (!f) return 0;
    const diff = new Date(f.tatsaechlichesRueckgabeDatum).getTime() - new Date(f.plannedEndDatum).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getSuggestedLateFee(bikeIndex: number): number {
    const f = this.returnBikeForms[bikeIndex];
    if (!f) return 0;
    return this.getOverdueDays(bikeIndex) * f.mietpreis;
  }

  applySuggestedLateFee(bikeIndex: number) {
    this.returnBikeForms[bikeIndex].verspaetungsAbzug =
      this.getSuggestedLateFee(bikeIndex);
  }

  onReturnDateChange(bikeIndex: number) {
    if (
      this.isOverdue(bikeIndex) &&
      this.returnBikeForms[bikeIndex].verspaetungsAbzug === 0
    ) {
      this.returnBikeForms[bikeIndex].verspaetungsAbzug =
        this.getSuggestedLateFee(bikeIndex);
    }
  }

  getBikeAbzug(bikeIndex: number): number {
    const f = this.returnBikeForms[bikeIndex];
    return (f.schadenAbzug || 0) + (f.verspaetungsAbzug || 0);
  }

  getBikeKautionRueckgabe(bikeIndex: number): number {
    const f = this.returnBikeForms[bikeIndex];
    if (!f) return 0;
    return Math.max(0, f.kaution - this.getBikeAbzug(bikeIndex));
  }

  getModalLostAccessoriesAbzug(): number {
    return this.returnAccessoryForms.reduce((sum, f) => {
      if (f.zurueckgegeben) return sum;
      // Einmaliges Zubehör ist Verbrauchsmaterial: nicht zurückgegeben heißt
      // verbraucht. Das rechnet der Server über den Zubehörpreis ab, hier
      // darf deshalb keine Verlustgebühr obendrauf kommen.
      if (f.einmalig) return sum;
      return sum + (f.verlustgebuehr ?? 0);
    }, 0);
  }

  getModalTotalAbzug(): number {
    const bikeAbzug = this.returnBikeForms.reduce(
      (s, _, i) => s + this.getBikeAbzug(i),
      0,
    );
    return bikeAbzug + this.getModalLostAccessoriesAbzug();
  }

  getModalKautionRueckgabe(): number {
    if (!this.rental) return 0;
    return Math.max(0, this.rental.kaution - this.getModalTotalAbzug());
  }

  /**
   * Alles in einem Zug: Räder aufnehmen, Zubehör abhaken, Vertrag auf
   * "zurückgegeben" setzen und die Kaution quittieren. Ein Aufruf, damit kein
   * halb erledigter Zustand entstehen kann (Rad zurück, Kaution vergessen).
   * Der Mietvertrag wird dabei nicht gelöscht — er bleibt der Beleg.
   */
  abschlussSpeichern() {
    if (!this.rental || this.abschlussLaeuft) return;
    if (this.brauchtUnterschrift() && this.sigIsEmpty) {
      this.notificationService.error('Bitte den Mieter unterschreiben lassen.');
      return;
    }

    const payload: RentalAbschluss = {
      bikes: this.returnBikeForms.map((f) => ({
        rentalBikeId: f.rentalBikeId,
        zustandBeiRueckgabe: f.zustandBeiRueckgabe,
        schadenAbzug: f.schadenAbzug || 0,
        verspaetungsAbzug: f.verspaetungsAbzug || 0,
        tatsaechlichesRueckgabeDatum: new Date(
          f.tatsaechlichesRueckgabeDatum,
        ).toISOString(),
        abzugNotizen: f.abzugNotizen || undefined,
      })),
      accessories:
        this.returnAccessoryForms.length > 0
          ? this.returnAccessoryForms
          : undefined,
      kautionRueckgabeUnterschrift: this.brauchtUnterschrift()
        ? this.getSigCanvas().toDataURL('image/png')
        : undefined,
    };

    this.abschlussLaeuft = true;
    this.rentalService.abschliessen(this.rental.id, payload).subscribe({
      next: (r) => {
        this.abschlussLaeuft = false;
        this.rental = r;
        this.closeReturnModal();
        this.notificationService.success(
          'Rückgabe abgeschlossen — Rad zurück und Kaution abgerechnet.',
        );
      },
      error: (err) => {
        this.abschlussLaeuft = false;
        this.notificationService.error(err.error?.error || 'Fehler');
      },
    });
  }

  // ── Return summary helpers (displayed after return) ──
  hasReturnData(rental: Rental): boolean {
    return rental.bikes.some((b) => b.zustandBeiRueckgabe != null);
  }

  getLostAccessories(rental: Rental) {
    return rental.accessories.filter(
      (a) => !a.zurueckgegeben && !a.einmalig && a.verlustgebuehr,
    );
  }

  getTotalAbzug(rental: Rental): number {
    const bikeAbzug = rental.bikes.reduce(
      (s, b) => s + (b.schadenAbzug || 0) + (b.verspaetungsAbzug || 0),
      0,
    );
    const lossAbzug = this.getLostAccessories(rental).reduce(
      (s, a) => s + (a.verlustgebuehr ?? 0),
      0,
    );
    return bikeAbzug + lossAbzug;
  }

  getKautionRueckgabeBetrag(rental: Rental): number {
    return Math.max(0, rental.kaution - this.getTotalAbzug(rental));
  }



  private getSigCanvas(): HTMLCanvasElement {
    return document.getElementById(
      'kautionSignatureCanvas',
    ) as HTMLCanvasElement;
  }

  clearSignature() {
    const c = this.getSigCanvas();
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    this.sigIsEmpty = true;
    this.sigDrawing = false;
  }

  /** Zeigerposition in Canvas-Koordinaten: die Fläche ist intern 460×160,
   *  wird aber per CSS auf Fensterbreite gedehnt — ohne Umrechnung landet
   *  der Strich auf dem Handy neben dem Finger. */
  private sigPoint(c: HTMLCanvasElement, e: MouseEvent) {
    const r = c.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * c.width) / r.width,
      y: ((e.clientY - r.top) * c.height) / r.height,
    };
  }

  onSigMouseDown(e: MouseEvent) {
    this.sigDrawing = true;
    this.sigIsEmpty = false;
    const c = this.getSigCanvas();
    const ctx = c.getContext('2d')!;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
    const p = this.sigPoint(c, e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  onSigMouseMove(e: MouseEvent) {
    if (!this.sigDrawing) return;
    const c = this.getSigCanvas();
    const ctx = c.getContext('2d')!;
    const p = this.sigPoint(c, e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  onSigEnd() {
    this.sigDrawing = false;
  }

  onSigTouchStart(e: TouchEvent) {
    e.preventDefault();
    const t = e.touches[0];
    this.onSigMouseDown({
      clientX: t.clientX,
      clientY: t.clientY,
    } as MouseEvent);
  }

  onSigTouchMove(e: TouchEvent) {
    e.preventDefault();
    const t = e.touches[0];
    this.onSigMouseMove({
      clientX: t.clientX,
      clientY: t.clientY,
    } as MouseEvent);
  }


  cancelRental() {
    if (!this.rental) return;
    this.dialogService
      .confirm({
        title: 'Stornieren',
        message: 'Möchten Sie diese Vermietung wirklich stornieren?',
        type: 'danger',
        confirmText: 'Stornieren',
      })
      .then((ok) => {
        if (ok) {
          this.rentalService.cancel(this.rental!.id).subscribe({
            next: (r) => {
              this.rental = r;
              this.notificationService.success('Vermietung storniert');
            },
            error: (err) =>
              this.notificationService.error(err.error?.error || 'Fehler'),
          });
        }
      });
  }

  // ── PDF ──
  // All three buttons open a preview modal that offers "Download" and "Drucken".
  // Rendering the PDF in a visible iframe first avoids the race where printing
  // straight from a hidden iframe captured a not-yet-rendered (garbled) PDF.
  previewMietvertrag() {
    if (!this.rental) return;
    this.rentalService.downloadMietvertragPdf(this.rental.id).subscribe({
      next: (blob) => {
        this.openPdfPreview(
          blob,
          'Mietvertrag',
          `Mietvertrag-${this.rental!.mietvertragNummer}.pdf`,
        );
      },
      error: () => this.notificationService.error('Fehler beim Laden des PDF'),
    });
  }

  previewKaution() {
    if (!this.rental) return;
    this.rentalService.downloadKautionsquittungPdf(this.rental.id).subscribe({
      next: (blob) => {
        this.openPdfPreview(
          blob,
          'Kautionsquittung',
          `Kautionsquittung-${this.rental!.mietvertragNummer}.pdf`,
        );
      },
      error: () => this.notificationService.error('Fehler beim Laden des PDF'),
    });
  }

  previewKautionRueckgabe() {
    if (!this.rental) return;
    this.rentalService.downloadKautionsrueckgabePdf(this.rental.id).subscribe({
      next: (blob) => {
        this.openPdfPreview(
          blob,
          'Kautionsrückgabe',
          `Kautionsrueckgabe-${this.rental!.mietvertragNummer}.pdf`,
        );
      },
      error: () => this.notificationService.error('Fehler beim Laden des PDF'),
    });
  }

  previewBedingungen() {
    if (!this.rental) return;
    this.rentalService.downloadMietbedingungenPdf(this.rental.id).subscribe({
      next: (blob) => {
        this.openPdfPreview(
          blob,
          'Mietbedingungen',
          `Mietbedingungen-${this.rental!.mietvertragNummer}.pdf`,
        );
      },
      error: () => this.notificationService.error('Fehler beim Laden des PDF'),
    });
  }

  /**
   * Öffnet die Vorschau für ein geladenes PDF.
   *
   * Der Blob-Link muss durch den DomSanitizer: Angular behandelt `iframe[src]`
   * als RESOURCE_URL und verweigert eine rohe Zeichenkette. Genau daran lag es,
   * dass die Vorschau leer blieb — in **jedem** Browser, nicht nur auf dem
   * Handy. Denselben Weg geht die WhatsApp-Seite schon (bypassSecurityTrust…).
   *
   * `pdfPreviewRawUrl` bleibt daneben als normale Zeichenkette stehen, weil ein
   * SafeResourceUrl sich nicht mehr öffnen oder widerrufen lässt.
   */
  private openPdfPreview(blob: Blob, titel: string, dateiname: string): void {
    this.releasePdfPreviewUrl();
    this.currentPdfBlob = blob;
    this.currentPdfFilename = dateiname;
    this.pdfPreviewRawUrl = URL.createObjectURL(blob);
    this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.pdfPreviewRawUrl,
    );
    this.pdfPreviewTitle = titel;
    this.showPdfPreview = true;
  }

  private releasePdfPreviewUrl(): void {
    if (this.pdfPreviewRawUrl) URL.revokeObjectURL(this.pdfPreviewRawUrl);
    this.pdfPreviewRawUrl = null;
    this.pdfPreviewUrl = null;
  }

  /**
   * PDF in einem eigenen Tab öffnen.
   *
   * Safari auf dem iPhone zeigt ein PDF in einem eingebetteten iframe nicht
   * zuverlässig an — dort bleibt die Fläche auch mit korrektem Link oft leer.
   * In einem eigenen Tab rendert Safari das PDF dagegen selbst, mit Blättern
   * und Zoom. Der Knopf steht für alle Geräte da; auf dem Desktop ist er
   * schlicht die größere Ansicht.
   */
  openCurrentPdfInNewTab(): void {
    if (!this.pdfPreviewRawUrl) return;
    window.open(this.pdfPreviewRawUrl, '_blank');
  }

  downloadCurrentPdf() {
    if (!this.currentPdfBlob) return;
    const url = URL.createObjectURL(this.currentPdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.currentPdfFilename;
    a.click();
    URL.revokeObjectURL(url);
  }

  printCurrentPdf() {
    // Print the already-rendered preview iframe. Because the user sees the PDF
    // fully rendered before clicking, there is no race against an unpainted PDF.
    const win = this.pdfPreviewIframe?.nativeElement?.contentWindow;
    if (win) {
      win.focus();
      win.print();
      return;
    }
    // Fallback: print from a hidden iframe if the preview ref is unavailable.
    if (!this.currentPdfBlob) return;
    const url = URL.createObjectURL(this.currentPdfBlob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      setTimeout(() => iframe.contentWindow?.print(), 250);
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 1000);
    };
  }

  closePdfPreview() {
    this.releasePdfPreviewUrl();
    this.showPdfPreview = false;
    this.currentPdfBlob = null;
  }

  deleteRental() {
    if (!this.rental) return;
    this.dialogService
      .danger(
        'Löschen',
        `Möchten Sie die Vermietung "${this.rental.mietvertragNummer}" wirklich löschen?`,
      )
      .then((ok) => {
        if (ok) {
          this.rentalService.delete(this.rental!.id).subscribe({
            next: () => {
              this.notificationService.success('Vermietung gelöscht');
              this.router.navigate(['/rentals']);
            },
            error: (err) =>
              this.notificationService.error(
                err.error?.error || 'Fehler beim Löschen',
              ),
          });
        }
      });
  }

  downloadAusweis(seite: 'vorderseite' | 'rueckseite' = 'vorderseite') {
    if (!this.rental) return;
    this.rentalService.downloadAusweis(this.rental.id, seite).subscribe({
      next: (blob) => {
        const path =
          seite === 'rueckseite'
            ? this.rental!.ausweisPhotoRueckseitePath
            : this.rental!.ausweisPhotoPath;
        const ext = path?.split('.').pop() || 'jpg';
        const suffix = seite === 'rueckseite' ? '-Rueckseite' : '';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Ausweis-${this.rental!.mietvertragNummer}${suffix}.${ext}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.notificationService.error('Fehler beim Herunterladen'),
    });
  }
}
