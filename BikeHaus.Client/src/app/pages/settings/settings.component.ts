import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { SettingsService, ShopSettings } from '../../services/settings.service';
import { environment } from '../../../environments/environment';
import { ThemeService } from '../../services/theme.service';
import {
  TranslationService,
  Language,
} from '../../services/translation.service';
import { SignaturePadComponent } from '../../components/signature-pad/signature-pad.component';
import { AuthService, UserInfo } from '../../services/auth.service';
import { BackupService } from '../../services/backup.service';
import {
  KleinanzeigenService,
  KleinanzeigenSyncResult,
} from '../../services/kleinanzeigen.service';

interface EmailAccount {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  fromEmail: string;
  fromName: string;
  useSsl: boolean;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

interface EmailLog {
  id: number;
  toEmail: string;
  toName: string;
  subject: string;
  status: string;
  errorMessage: string | null;
  emailType: string;
  accountName: string | null;
  createdAt: string;
}

interface EmailAccountForm {
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  useSsl: boolean;
  isDefault: boolean;
  isActive: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, SignaturePadComponent],
  template: `
    <div class="settings-page">
      <h1>{{ t.settings }}</h1>

      <!-- Success Message -->
      <div class="success-message" *ngIf="showSuccess">
        {{ t.settingsSaved }}
      </div>

      <!-- Loading -->
      <div class="loading" *ngIf="loading">
        <p>{{ t.loading }}</p>
      </div>

      <!-- Settings Content -->
      <div class="settings-content" *ngIf="!loading">
        <!-- Appearance Section -->
        <section class="settings-section">
          <h2>{{ t.appearance }}</h2>
          <div class="settings-card">
            <div class="setting-row">
              <div class="setting-label">
                <span>{{ t.darkMode }}</span>
                <small>{{
                  themeService.isDarkMode() ? 'Aktiv' : 'Inaktiv'
                }}</small>
              </div>
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  [checked]="themeService.isDarkMode()"
                  (change)="themeService.toggleTheme()"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="setting-row">
              <div class="setting-label">
                <span>{{ t.language }}</span>
              </div>
              <select
                [(ngModel)]="currentLanguage"
                (change)="changeLanguage(currentLanguage)"
              >
                <option value="de">{{ t.german }}</option>
                <option value="tr">{{ t.turkish }}</option>
              </select>
            </div>
          </div>
        </section>

        <!-- User Account Section -->
        <section class="settings-section">
          <h2>{{ t.userAccount }}</h2>
          <div class="settings-card">
            <!-- Current User Info -->
            <div class="user-info" *ngIf="currentUser">
              <span class="user-label">{{ t.currentUsername }}:</span>
              <span class="user-value">{{ currentUser.username }}</span>
            </div>

            <!-- Change Username -->
            <div class="account-form">
              <h3>{{ t.changeUsername }}</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>{{ t.newUsername }}</label>
                  <input
                    type="text"
                    [(ngModel)]="usernameForm.newUsername"
                    name="newUsername"
                    autocomplete="off"
                  />
                </div>
                <div class="form-group">
                  <label>{{ t.currentPassword }}</label>
                  <input
                    type="password"
                    [(ngModel)]="usernameForm.currentPassword"
                    name="usernamePassword"
                    autocomplete="off"
                  />
                </div>
              </div>
              <button
                type="button"
                class="btn btn-primary btn-sm"
                [disabled]="
                  !usernameForm.newUsername ||
                  !usernameForm.currentPassword ||
                  savingUsername
                "
                (click)="changeUsername()"
              >
                {{ savingUsername ? t.loading : t.changeUsername }}
              </button>
              <div class="success-msg" *ngIf="usernameSuccess">
                {{ usernameSuccess }}
              </div>
              <div class="error-msg" *ngIf="usernameError">
                {{ usernameError }}
              </div>
            </div>

            <!-- Change Password -->
            <div class="account-form">
              <h3>{{ t.changePassword }}</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>{{ t.currentPassword }}</label>
                  <input
                    type="password"
                    [(ngModel)]="passwordForm.currentPassword"
                    name="currentPassword"
                    autocomplete="off"
                  />
                </div>
                <div class="form-group">
                  <label>{{ t.newPassword }}</label>
                  <input
                    type="password"
                    [(ngModel)]="passwordForm.newPassword"
                    name="newPassword"
                    autocomplete="off"
                  />
                </div>
                <div class="form-group">
                  <label>{{ t.confirmPassword }}</label>
                  <input
                    type="password"
                    [(ngModel)]="passwordForm.confirmPassword"
                    name="confirmPassword"
                    autocomplete="off"
                  />
                </div>
              </div>
              <button
                type="button"
                class="btn btn-primary btn-sm"
                [disabled]="
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword ||
                  savingPassword
                "
                (click)="changePassword()"
              >
                {{ savingPassword ? t.loading : t.changePassword }}
              </button>
              <div class="success-msg" *ngIf="passwordSuccess">
                {{ passwordSuccess }}
              </div>
              <div class="error-msg" *ngIf="passwordError">
                {{ passwordError }}
              </div>
            </div>
          </div>
        </section>

        <!-- Logo Section -->
        <section class="settings-section">
          <h2>{{ t.logo }}</h2>
          <div class="settings-card logo-section">
            <div class="logo-preview" *ngIf="settings.logoBase64">
              <img [src]="settings.logoBase64" [alt]="t.logo" />
              <button class="btn btn-danger btn-sm" (click)="deleteLogo()">
                {{ t.deleteLogo }}
              </button>
            </div>
            <div class="logo-upload" *ngIf="!settings.logoBase64">
              <div class="upload-area" (click)="fileInput.click()">
                <span class="upload-icon">📷</span>
                <span>{{ t.uploadLogo }}</span>
              </div>
              <input
                #fileInput
                type="file"
                accept="image/*"
                (change)="onLogoSelected($event)"
                hidden
              />
            </div>
          </div>
        </section>

        <!-- Owner Section -->
        <section class="settings-section">
          <h2>{{ t.ownerInfo }}</h2>
          <div class="settings-card">
            <div class="form-grid">
              <div class="form-group">
                <label>{{ t.ownerFirstName }}</label>
                <input
                  type="text"
                  [(ngModel)]="settings.inhaberVorname"
                  name="inhaberVorname"
                />
              </div>
              <div class="form-group">
                <label>{{ t.ownerLastName }}</label>
                <input
                  type="text"
                  [(ngModel)]="settings.inhaberNachname"
                  name="inhaberNachname"
                />
              </div>
            </div>

            <div class="owner-signature-section">
              <h3>{{ t.ownerSignature }}</h3>
              <div
                *ngIf="settings.inhaberSignatureBase64"
                class="signature-preview"
              >
                <img
                  [src]="settings.inhaberSignatureBase64"
                  alt="Unterschrift"
                />
                <button
                  class="btn btn-danger btn-sm"
                  (click)="deleteOwnerSignature()"
                >
                  {{ t.deleteSignature }}
                </button>
              </div>
              <div
                *ngIf="!settings.inhaberSignatureBase64"
                class="signature-options"
              >
                <div class="signature-option">
                  <h4>{{ t.drawSignature }}</h4>
                  <app-signature-pad
                    [label]="t.ownerSignature"
                    [(ngModel)]="ownerSignatureData"
                    name="ownerSignature"
                  ></app-signature-pad>
                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    style="margin-top: 8px"
                    [disabled]="!ownerSignatureData"
                    (click)="saveOwnerSignature()"
                  >
                    {{ t.saveSignature }}
                  </button>
                </div>
                <div class="signature-divider">{{ t.or }}</div>
                <div class="signature-option">
                  <h4>{{ t.uploadSignature }}</h4>
                  <div class="upload-area" (click)="signatureFileInput.click()">
                    <span class="upload-icon">📷</span>
                    <span>{{ t.uploadSignature }}</span>
                  </div>
                  <input
                    #signatureFileInput
                    type="file"
                    accept="image/*"
                    (change)="onSignatureSelected($event)"
                    hidden
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Shop Information Section -->
        <section class="settings-section">
          <h2>{{ t.shopInformation }}</h2>
          <div class="settings-card">
            <form (ngSubmit)="saveSettings()">
              <div class="form-grid">
                <div class="form-group full-width">
                  <label>{{ t.shopName }}</label>
                  <input
                    type="text"
                    [(ngModel)]="settings.shopName"
                    name="shopName"
                  />
                </div>

                <div class="form-group">
                  <label>{{ t.street }}</label>
                  <input
                    type="text"
                    [(ngModel)]="settings.strasse"
                    name="strasse"
                  />
                </div>

                <div class="form-group small">
                  <label>{{ t.houseNumber }}</label>
                  <input
                    type="text"
                    [(ngModel)]="settings.hausnummer"
                    name="hausnummer"
                  />
                </div>

                <div class="form-group small">
                  <label>{{ t.postalCode }}</label>
                  <input type="text" [(ngModel)]="settings.plz" name="plz" />
                </div>

                <div class="form-group">
                  <label>{{ t.city }}</label>
                  <input
                    type="text"
                    [(ngModel)]="settings.stadt"
                    name="stadt"
                  />
                </div>

                <div class="form-group">
                  <label>{{ t.phone }}</label>
                  <input
                    type="tel"
                    [(ngModel)]="settings.telefon"
                    name="telefon"
                  />
                </div>

                <div class="form-group">
                  <label>{{ t.email }}</label>
                  <input
                    type="email"
                    [(ngModel)]="settings.email"
                    name="email"
                  />
                </div>

                <div class="form-group full-width">
                  <label>{{ t.website }}</label>
                  <input
                    type="url"
                    [(ngModel)]="settings.website"
                    name="website"
                  />
                </div>

                <div class="form-group">
                  <label>{{ t.taxNumber }}</label>
                  <input
                    type="text"
                    [(ngModel)]="settings.steuernummer"
                    name="steuernummer"
                  />
                </div>

                <div class="form-group">
                  <label>{{ t.vatId }}</label>
                  <input
                    type="text"
                    [(ngModel)]="settings.ustIdNr"
                    name="ustIdNr"
                  />
                </div>
              </div>

              <h3>Bank</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>{{ t.bankName }}</label>
                  <input
                    type="text"
                    [(ngModel)]="settings.bankname"
                    name="bankname"
                  />
                </div>

                <div class="form-group">
                  <label>IBAN</label>
                  <input type="text" [(ngModel)]="settings.iban" name="iban" />
                </div>

                <div class="form-group">
                  <label>BIC</label>
                  <input type="text" [(ngModel)]="settings.bic" name="bic" />
                </div>
              </div>

              <!-- Company Emails -->
              <h3
                style="margin-top: 24px; margin-bottom: 12px; font-size: 0.95rem; color: var(--text-secondary, #64748b); font-weight: 600;"
              >
                📧 Unternehmens-E-Mails
              </h3>
              <div class="form-grid full-width" style="flex-direction: column;">
                <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                  <input
                    type="email"
                    [(ngModel)]="newCompanyEmail"
                    name="newCompanyEmail"
                    placeholder="z.B. info@bikehausfreiburg.com"
                    class="company-email-input"
                    style="flex: 1; padding: 8px 12px; border: 1px solid var(--border-light, #e2e8f0); border-radius: 6px; font-size: 0.9rem;"
                  />
                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    (click)="addCompanyEmail()"
                    [disabled]="!newCompanyEmail.trim()"
                  >
                    + Hinzufügen
                  </button>
                </div>

                <div
                  style="display: flex; flex-wrap: wrap; gap: 8px;"
                  *ngIf="companyEmailsList.length > 0"
                >
                  <div
                    *ngFor="let email of companyEmailsList"
                    style="display: flex; align-items: center; gap: 8px; background: var(--accent-blue, rgba(99, 102, 241, 0.1)); padding: 6px 12px; border-radius: 20px; font-size: 0.9rem;"
                  >
                    <span>{{ email }}</span>
                    <button
                      type="button"
                      (click)="changeCompanyEmailPassword(email)"
                      style="background: none; border: none; cursor: pointer; color: var(--accent-primary, #6366f1); font-size: 0.95rem; padding: 0; line-height: 1;"
                      title="Passwort ändern"
                    >
                      🔑
                    </button>
                    <button
                      type="button"
                      (click)="removeCompanyEmail(email)"
                      style="background: none; border: none; cursor: pointer; color: var(--accent-danger, #ef4444); font-size: 1.1rem; padding: 0; line-height: 1;"
                      title="Entfernen"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <p
                  *ngIf="companyEmailsList.length === 0"
                  style="color: var(--text-secondary, #64748b); font-size: 0.85rem; margin: 8px 0;"
                >
                  Keine E-Mail-Adressen hinzugefügt. Fügen Sie
                  Unternehmens-E-Mails hinzu, um sie in Anwendungen zu
                  verwenden.
                </p>
              </div>

              <!-- Kleinanzeigen Integration -->
              <h3
                style="margin-top: 24px; margin-bottom: 12px; font-size: 0.95rem; color: var(--text-secondary, #64748b); font-weight: 600;"
              >
                🔗 {{ t.kleinanzeigenIntegration }}
              </h3>
              <div class="form-grid">
                <div class="form-group full-width">
                  <label>{{ t.kleinanzeigenProfileUrl }}</label>
                  <input
                    type="url"
                    [(ngModel)]="settings.kleinanzeigenUrl"
                    name="kleinanzeigenUrl"
                    placeholder="https://www.kleinanzeigen.de/s-bestandsliste.html?userId=..."
                  />
                  <small
                    style="color: var(--text-secondary, #64748b); font-size: 0.78rem;"
                    >{{ t.kleinanzeigenUrlHint }}</small
                  >
                </div>
              </div>
              <div
                style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;"
              >
                <button
                  type="button"
                  class="btn btn-secondary"
                  [disabled]="syncing || !settings.kleinanzeigenUrl"
                  (click)="triggerKleinanzeigenSync()"
                  style="white-space: nowrap;"
                >
                  {{ syncing ? '⏳ ' + t.syncingText : '🔄 ' + t.syncNow }}
                </button>
                <span
                  *ngIf="lastSyncTime"
                  style="font-size: 0.82rem; color: var(--text-secondary, #64748b);"
                >
                  {{ t.lastSync }} {{ lastSyncTime | date: 'dd.MM.yyyy HH:mm' }}
                </span>
              </div>
              <div
                *ngIf="syncResult"
                style="padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 16px;"
                [style.background]="
                  syncResult.error
                    ? 'var(--danger-bg, #fef2f2)'
                    : 'var(--success-bg, #f0fdf4)'
                "
                [style.color]="
                  syncResult.error
                    ? 'var(--danger, #dc2626)'
                    : 'var(--success, #16a34a)'
                "
              >
                <span *ngIf="syncResult.error">❌ {{ syncResult.error }}</span>
                <span *ngIf="!syncResult.error">
                  ✅ {{ syncResult.newListings }} {{ t.syncNew }},
                  {{ syncResult.updatedListings }} {{ t.syncUpdated }},
                  {{ syncResult.deactivatedListings }} {{ t.syncDeactivated }}
                </span>
              </div>

              <!-- Google Review -->
              <h3
                style="margin-top: 24px; margin-bottom: 12px; font-size: 0.95rem; color: var(--text-secondary, #64748b); font-weight: 600;"
              >
                ⭐ Google Review
              </h3>
              <div class="form-grid">
                <div class="form-group full-width">
                  <label>Google Review URL</label>
                  <input
                    type="url"
                    [(ngModel)]="settings.googleReviewUrl"
                    name="googleReviewUrl"
                    placeholder="https://g.page/r/..."
                  />
                  <small
                    style="color: var(--text-secondary, #64748b); font-size: 0.78rem;"
                    >Link für Google-Bewertungen</small
                  >
                </div>
              </div>

              <!-- Bicycle Numbering -->
              <h3
                style="margin-top: 24px; margin-bottom: 12px; font-size: 0.95rem; color: var(--text-secondary, #64748b); font-weight: 600;"
              >
                {{ t.bicycleNumbering }}
              </h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>{{ t.startNumber }}</label>
                  <input
                    type="number"
                    min="1"
                    [(ngModel)]="settings.fahrradNummerStart"
                    name="fahrradNummerStart"
                  />
                  <small
                    style="color: var(--text-secondary, #64748b); font-size: 0.78rem;"
                    >{{ t.autoNumberHint }}</small
                  >
                </div>
              </div>

              <div class="form-actions">
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="saving"
                >
                  {{ saving ? t.loading : t.save }}
                </button>
              </div>
            </form>
          </div>
        </section>

        <!-- Öffnungszeiten Section -->
        <section class="settings-section">
          <h2>🕒 Öffnungszeiten</h2>
          <div class="settings-card">
            <p
              style="color: var(--text-secondary, #64748b); font-size: 0.82rem; margin-top: 0;"
            >
              Pro Tag bis zu zwei Zeiträume (z. B. Fr 10:00–13:00 &amp;
              15:00–18:00). „Geschlossen" markiert Ruhetage. Diese Zeiten
              erscheinen auf der Website (Über uns / Kontakt).
            </p>

            <div class="oh-list">
              <div
                *ngFor="let day of openingDays; let i = index"
                style="display:flex; align-items:center; gap:0.65rem; flex-wrap:wrap; padding:0.5rem 0; border-bottom:1px solid var(--border-light, #e5e7eb);"
              >
                <span style="width:2.4rem; font-weight:700;">{{
                  dayLabels[i]
                }}</span>
                <label
                  style="display:inline-flex; align-items:center; gap:0.35rem; font-size:0.85rem; cursor:pointer;"
                >
                  <input
                    type="checkbox"
                    [(ngModel)]="day.closed"
                    [name]="'ohClosed' + i"
                  />
                  Geschlossen
                </label>
                <ng-container *ngIf="!day.closed">
                  <span
                    style="display:inline-flex; align-items:center; gap:0.25rem;"
                  >
                    <input
                      type="time"
                      style="width:6.6rem;"
                      [(ngModel)]="day.ranges[0].from"
                      [name]="'ohR0f' + i"
                    />
                    <span>–</span>
                    <input
                      type="time"
                      style="width:6.6rem;"
                      [(ngModel)]="day.ranges[0].to"
                      [name]="'ohR0t' + i"
                    />
                  </span>
                  <span
                    style="display:inline-flex; align-items:center; gap:0.25rem;"
                    title="Optionaler zweiter Zeitraum"
                  >
                    <input
                      type="time"
                      style="width:6.6rem;"
                      [(ngModel)]="day.ranges[1].from"
                      [name]="'ohR1f' + i"
                    />
                    <span>–</span>
                    <input
                      type="time"
                      style="width:6.6rem;"
                      [(ngModel)]="day.ranges[1].to"
                      [name]="'ohR1t' + i"
                    />
                  </span>
                </ng-container>
              </div>
            </div>

            <h3 style="margin-top: 1.25rem;">Hinweise</h3>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              <div
                *ngFor="let note of openingNotes; let i = index; trackBy: trackByIndex"
                style="display:flex; align-items:center; gap:0.5rem;"
              >
                <input
                  type="text"
                  style="flex:1;"
                  [(ngModel)]="openingNotes[i]"
                  [name]="'ohNote' + i"
                  placeholder="z. B. Fahrradrückgabe bis 18:00 Uhr"
                />
                <button
                  type="button"
                  class="btn btn-outline"
                  (click)="removeNote(i)"
                >
                  ✕
                </button>
              </div>
              <button
                type="button"
                class="btn btn-outline"
                style="align-self:flex-start;"
                (click)="addNote()"
              >
                + Hinweis hinzufügen
              </button>
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="btn btn-primary"
                [disabled]="saving"
                (click)="saveSettings()"
              >
                {{ saving ? t.loading : t.save }}
              </button>
            </div>
          </div>
        </section>

        <!-- Email Test Section -->
        <section class="settings-section">
          <h2>📧 E-Mail Test</h2>
          <div class="settings-card">
            <div class="backup-section">
              <div class="backup-info">
                <div class="backup-icon">✉️</div>
                <div class="backup-text">
                  <h3>SMTP Verbindung testen</h3>
                  <p>
                    Schickt eine Test-E-Mail, um die SMTP-Konfiguration zu
                    prüfen.
                  </p>
                </div>
              </div>
              <div class="email-test-row">
                <input
                  type="email"
                  [(ngModel)]="testEmailAddress"
                  name="testEmailAddress"
                  placeholder="test@example.com"
                  class="email-test-input"
                />
                <button
                  class="btn btn-primary"
                  [disabled]="sendingTestEmail || !testEmailAddress"
                  (click)="sendTestEmail()"
                >
                  {{ sendingTestEmail ? 'Sende...' : 'Test senden' }}
                </button>
              </div>
              <div class="success-msg" *ngIf="testEmailSuccess">
                {{ testEmailSuccess }}
              </div>
              <div class="error-msg" *ngIf="testEmailError">
                {{ testEmailError }}
              </div>
            </div>
          </div>
        </section>

        <!-- E-Mail-Verwaltung Section -->
        <section class="settings-section">
          <h2>E-Mail-Verwaltung</h2>

          <div class="email-mgmt-tabs">
            <button
              class="tab-btn"
              [class.active]="emailTab === 'accounts'"
              (click)="switchEmailTab('accounts')"
            >
              Konten
            </button>
            <button
              class="tab-btn"
              [class.active]="emailTab === 'logs'"
              (click)="switchEmailTab('logs')"
            >
              Protokoll
            </button>
          </div>

          <!-- KONTEN TAB -->
          <div class="settings-card" *ngIf="emailTab === 'accounts'">
            <div class="section-header-row">
              <p class="section-desc">
                Standard-Konto überschreibt die SMTP-Konfiguration aus den
                Systemeinstellungen.
              </p>
              <button
                class="btn btn-primary btn-sm"
                (click)="openEmailAccountForm()"
              >
                + Neues Konto
              </button>
            </div>

            <!-- Create/Edit Form -->
            <div class="email-account-form-card" *ngIf="showingEmailForm">
              <h3>
                {{ editingEmailAccountId ? 'Konto bearbeiten' : 'Neues Konto' }}
              </h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    [(ngModel)]="eaf.name"
                    placeholder="z.B. Buchungsversand"
                  />
                </div>
                <div class="form-group">
                  <label>SMTP-Host</label>
                  <input
                    type="text"
                    [(ngModel)]="eaf.host"
                    placeholder="smtp.example.com"
                  />
                </div>
                <div class="form-group small">
                  <label>Port</label>
                  <input type="number" [(ngModel)]="eaf.port" />
                </div>
                <div class="form-group">
                  <label>Benutzername</label>
                  <input type="text" [(ngModel)]="eaf.username" />
                </div>
                <div class="form-group">
                  <label
                    >Passwort{{
                      editingEmailAccountId ? ' (leer = unverändert)' : ''
                    }}</label
                  >
                  <input
                    type="password"
                    [(ngModel)]="eaf.password"
                    autocomplete="new-password"
                  />
                </div>
                <div class="form-group">
                  <label>Absender-E-Mail</label>
                  <input
                    type="email"
                    [(ngModel)]="eaf.fromEmail"
                    placeholder="info.bikehausfreiburg@gmail.com"
                  />
                </div>
                <div class="form-group">
                  <label>Absender-Name</label>
                  <input
                    type="text"
                    [(ngModel)]="eaf.fromName"
                    placeholder="Bike Haus Freiburg"
                  />
                </div>
              </div>
              <div class="form-checkboxes">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="eaf.useSsl" />
                  SSL/TLS verwenden
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="eaf.isDefault" />
                  Standard-Konto (überschreibt appsettings.json)
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="eaf.isActive" />
                  Aktiv
                </label>
              </div>
              <div class="success-msg" *ngIf="emailAccountSuccess">
                {{ emailAccountSuccess }}
              </div>
              <div class="error-msg" *ngIf="emailAccountError">
                {{ emailAccountError }}
              </div>
              <div class="form-actions">
                <button
                  class="btn btn-secondary"
                  (click)="cancelEmailAccountForm()"
                >
                  Abbrechen
                </button>
                <button
                  class="btn btn-primary"
                  [disabled]="savingEmailAccount"
                  (click)="saveEmailAccount()"
                >
                  {{ savingEmailAccount ? 'Speichern...' : 'Speichern' }}
                </button>
              </div>
            </div>

            <div
              class="email-accounts-empty"
              *ngIf="emailAccounts.length === 0 && !showingEmailForm"
            >
              <p>
                Keine E-Mail-Konten konfiguriert. Klicken Sie auf "+ Neues
                Konto" um zu beginnen.
              </p>
            </div>

            <table class="email-table" *ngIf="emailAccounts.length > 0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Host</th>
                  <th>Absender</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let acc of emailAccounts">
                  <td>
                    {{ acc.name }}
                    <span class="badge badge-primary" *ngIf="acc.isDefault"
                      >Standard</span
                    >
                  </td>
                  <td class="text-muted">{{ acc.host }}:{{ acc.port }}</td>
                  <td>{{ acc.fromEmail }}</td>
                  <td>
                    <span
                      class="badge"
                      [class.badge-success]="acc.isActive"
                      [class.badge-muted]="!acc.isActive"
                    >
                      {{ acc.isActive ? 'Aktiv' : 'Inaktiv' }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <button
                      class="btn-icon"
                      title="Bearbeiten"
                      (click)="editEmailAccount(acc)"
                    >
                      ✏️
                    </button>
                    <button
                      class="btn-icon btn-icon-danger"
                      title="Löschen"
                      (click)="confirmDeleteEmailAccount(acc)"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              class="restore-confirm"
              style="margin-top:16px"
              *ngIf="deletingEmailAccount"
            >
              <div class="restore-confirm-message">
                <span class="warning-icon">⚠️</span>
                <div>
                  <strong>Konto löschen?</strong>
                  <p>
                    Das Konto "{{ deletingEmailAccount.name }}" wird
                    unwiderruflich gelöscht.
                  </p>
                </div>
              </div>
              <div class="restore-confirm-buttons">
                <button
                  class="btn btn-secondary"
                  (click)="deletingEmailAccount = null"
                >
                  Abbrechen
                </button>
                <button
                  class="btn btn-danger"
                  [disabled]="deletingEmailAccountLoading"
                  (click)="deleteEmailAccount()"
                >
                  {{ deletingEmailAccountLoading ? 'Löschen...' : 'Löschen' }}
                </button>
              </div>
            </div>
          </div>

          <!-- PROTOKOLL TAB -->
          <div class="settings-card" *ngIf="emailTab === 'logs'">
            <div class="section-header-row">
              <p class="section-desc">Letzte 100 gesendeten E-Mails.</p>
              <button
                class="btn btn-secondary btn-sm"
                (click)="loadEmailLogs()"
              >
                Aktualisieren
              </button>
            </div>
            <div class="email-accounts-empty" *ngIf="emailLogs.length === 0">
              <p>Noch keine E-Mails versendet.</p>
            </div>
            <table class="email-table" *ngIf="emailLogs.length > 0">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>An</th>
                  <th>Betreff</th>
                  <th>Typ</th>
                  <th>Konto</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of emailLogs">
                  <td class="text-muted">
                    {{ log.createdAt | date: 'dd.MM.yy HH:mm' }}
                  </td>
                  <td>{{ log.toEmail }}</td>
                  <td>{{ log.subject }}</td>
                  <td class="text-muted">{{ log.emailType }}</td>
                  <td class="text-muted">
                    {{ log.accountName || 'appsettings' }}
                  </td>
                  <td>
                    <span
                      class="badge"
                      [class.badge-success]="log.status === 'Gesendet'"
                      [class.badge-danger]="log.status === 'Fehler'"
                    >
                      {{ log.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Backup & Restore Section -->
        <section class="settings-section">
          <h2>{{ t.backupRestore }}</h2>
          <div class="settings-card">
            <!-- Create Backup -->
            <div class="backup-section">
              <div class="backup-info">
                <div class="backup-icon">💾</div>
                <div class="backup-text">
                  <h3>{{ t.downloadBackup }}</h3>
                  <p>{{ t.backupDescription }}</p>
                </div>
              </div>
              <button
                class="btn btn-primary"
                [disabled]="creatingBackup"
                (click)="createBackup()"
              >
                {{ creatingBackup ? t.creatingBackup : t.createBackup }}
              </button>
              <div class="success-msg" *ngIf="backupSuccess">
                {{ backupSuccess }}
              </div>
              <div class="error-msg" *ngIf="backupError">
                {{ backupError }}
              </div>
            </div>

            <div class="backup-divider"></div>

            <!-- Restore Backup -->
            <div class="backup-section">
              <div class="backup-info">
                <div class="backup-icon">📦</div>
                <div class="backup-text">
                  <h3>{{ t.restoreSystem }}</h3>
                  <p>{{ t.restoreDescription }}</p>
                </div>
              </div>
              <div class="restore-warning" *ngIf="!showRestoreConfirm">
                <span class="warning-icon">⚠️</span>
                <span>{{ t.restoreWarning }}</span>
              </div>
              <div class="restore-actions" *ngIf="!showRestoreConfirm">
                <button
                  class="btn btn-warning"
                  (click)="restoreFileInput.click()"
                  [disabled]="restoringBackup"
                >
                  {{ t.selectBackupFile }}
                </button>
                <input
                  #restoreFileInput
                  type="file"
                  accept=".zip"
                  (change)="onRestoreFileSelected($event)"
                  hidden
                />
              </div>

              <!-- Confirm restore -->
              <div class="restore-confirm" *ngIf="showRestoreConfirm">
                <div class="restore-confirm-message">
                  <span class="warning-icon">⚠️</span>
                  <div>
                    <strong>{{ t.restoreConfirm }}</strong>
                    <p>{{ t.restoreConfirmMessage }}</p>
                    <p class="selected-file" *ngIf="selectedRestoreFile">
                      📎 {{ selectedRestoreFile.name }}
                    </p>
                  </div>
                </div>
                <div class="restore-confirm-buttons">
                  <button
                    class="btn btn-danger"
                    [disabled]="restoringBackup"
                    (click)="confirmRestore()"
                  >
                    {{ restoringBackup ? t.restoring : t.restoreConfirm }}
                  </button>
                  <button
                    class="btn btn-secondary"
                    [disabled]="restoringBackup"
                    (click)="cancelRestore()"
                  >
                    {{ t.cancel }}
                  </button>
                </div>
              </div>

              <div class="success-msg" *ngIf="restoreSuccess">
                {{ restoreSuccess }}
              </div>
              <div class="error-msg" *ngIf="restoreError">
                {{ restoreError }}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-page {
        max-width: 900px;
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

      h1 {
        margin-bottom: 24px;
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--text-primary);
      }

      .success-message {
        background: var(--accent-success, #10b981);
        color: white;
        padding: 12px 16px;
        border-radius: var(--radius-md, 10px);
        margin-bottom: 20px;
        font-weight: 600;
        animation: slideDown 0.3s ease;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .loading {
        text-align: center;
        padding: 40px;
        color: var(--text-secondary, #64748b);
      }

      .settings-section {
        margin-bottom: 32px;
      }

      .settings-section h2 {
        margin-bottom: 16px;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary);
      }

      .settings-section h3 {
        margin: 20px 0 12px;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-primary);
      }

      .settings-card {
        background: var(--bg-card, #fff);
        border-radius: var(--radius-lg, 14px);
        padding: 24px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        box-shadow: var(--shadow-sm);
      }

      /* Appearance Settings */
      .setting-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 0;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
      }
      .setting-row:last-child {
        border-bottom: none;
      }

      .setting-label {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .setting-label span {
        font-weight: 600;
        color: var(--text-primary);
      }
      .setting-label small {
        color: var(--text-secondary, #64748b);
        font-size: 0.82rem;
      }

      /* Toggle Switch */
      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 28px;
      }
      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--border-light, #cbd5e1);
        transition: 0.3s;
        border-radius: 28px;
      }
      .toggle-slider:before {
        position: absolute;
        content: '';
        height: 22px;
        width: 22px;
        left: 3px;
        bottom: 3px;
        background: white;
        transition: 0.3s;
        border-radius: 50%;
        box-shadow: var(--shadow-xs);
      }
      .toggle-switch input:checked + .toggle-slider {
        background: var(--accent-primary, #6366f1);
      }
      .toggle-switch input:checked + .toggle-slider:before {
        transform: translateX(22px);
      }

      .setting-row select {
        min-width: 150px;
      }

      /* Logo Section */
      .logo-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }

      .logo-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .logo-preview img {
        max-width: 200px;
        max-height: 150px;
        object-fit: contain;
        border-radius: var(--radius-md, 10px);
        border: 1.5px solid var(--border-light, #e2e8f0);
        padding: 8px;
        background: white;
      }

      .upload-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 40px 60px;
        border: 2px dashed var(--border-light, #e2e8f0);
        border-radius: var(--radius-lg, 14px);
        cursor: pointer;
        transition: var(--transition-fast);
        color: var(--text-secondary, #64748b);
      }
      .upload-area:hover {
        border-color: var(--accent-primary, #6366f1);
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.04));
        color: var(--accent-primary, #6366f1);
      }
      .upload-icon {
        font-size: 2rem;
      }

      /* Owner Signature */
      .owner-signature-section {
        margin-top: 20px;
      }
      .signature-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .signature-preview img {
        max-width: 300px;
        max-height: 100px;
        object-fit: contain;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        padding: 8px;
        background: white;
      }
      .signature-options {
        display: flex;
        gap: 24px;
        align-items: flex-start;
      }
      .signature-option {
        flex: 1;
      }
      .signature-option h4 {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-secondary, #64748b);
        margin-bottom: 10px;
      }
      .signature-divider {
        display: flex;
        align-items: center;
        padding: 40px 16px;
        font-size: 0.85rem;
        color: var(--text-muted, #94a3b8);
        font-weight: 500;
      }
      @media (max-width: 640px) {
        .signature-options {
          flex-direction: column;
        }
        .signature-divider {
          padding: 12px 0;
        }
      }

      /* Form Grid */
      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .form-group.full-width {
        grid-column: 1 / -1;
      }
      .form-group.small {
        max-width: 120px;
      }

      .form-group label {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-secondary, #64748b);
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .form-group input,
      .form-group textarea,
      .form-group select {
        width: 100%;
      }

      .form-group textarea {
        resize: vertical;
        font-family: inherit;
      }

      .form-actions {
        margin-top: 24px;
        display: flex;
        justify-content: flex-end;
      }

      @media (max-width: 640px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        .form-group.small {
          max-width: none;
        }
      }

      /* User Account Section */
      .user-info {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        background: var(--accent-primary-light, rgba(99, 102, 241, 0.08));
        border-radius: var(--radius-md, 10px);
        margin-bottom: 20px;
        font-size: 0.9rem;
      }
      .user-label {
        color: var(--text-secondary, #64748b);
      }
      .user-value {
        font-weight: 600;
        color: var(--accent-primary, #6366f1);
      }
      .account-form {
        padding: 16px 0;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
      }
      .account-form:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      .account-form h3 {
        margin-top: 0;
        margin-bottom: 12px;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      .account-form .form-grid {
        margin-bottom: 12px;
      }
      .success-msg {
        margin-top: 10px;
        padding: 8px 12px;
        background: var(--accent-success-light, rgba(16, 185, 129, 0.08));
        color: var(--accent-success, #10b981);
        border-radius: var(--radius-sm, 6px);
        font-size: 0.85rem;
        font-weight: 500;
      }
      .error-msg {
        margin-top: 10px;
        padding: 8px 12px;
        background: var(--accent-danger-light, rgba(239, 68, 68, 0.08));
        color: var(--accent-danger, #ef4444);
        border-radius: var(--radius-sm, 6px);
        font-size: 0.85rem;
        font-weight: 500;
      }

      /* Backup & Restore Section */
      .backup-section {
        padding: 20px 0;
      }
      .backup-section:first-child {
        padding-top: 0;
      }
      .backup-section:last-child {
        padding-bottom: 0;
      }
      .email-test-row {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }
      .email-test-input {
        flex: 1;
        min-width: 220px;
      }
      .backup-info {
        display: flex;
        gap: 16px;
        align-items: flex-start;
        margin-bottom: 16px;
      }
      .backup-icon {
        font-size: 2rem;
        line-height: 1;
        flex-shrink: 0;
      }
      .backup-text h3 {
        margin: 0 0 6px 0;
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .backup-text p {
        margin: 0;
        font-size: 0.88rem;
        color: var(--text-secondary, #64748b);
        line-height: 1.5;
      }
      .backup-divider {
        border-top: 1.5px solid var(--border-light, #e2e8f0);
        margin: 0;
      }
      .restore-warning {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid rgba(245, 158, 11, 0.2);
        border-radius: var(--radius-md, 10px);
        margin-bottom: 14px;
        font-size: 0.85rem;
        font-weight: 500;
        color: #d97706;
      }
      .warning-icon {
        font-size: 1.1rem;
        flex-shrink: 0;
      }
      .restore-actions {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .restore-confirm {
        background: rgba(239, 68, 68, 0.05);
        border: 1.5px solid rgba(239, 68, 68, 0.2);
        border-radius: var(--radius-md, 10px);
        padding: 16px;
      }
      .restore-confirm-message {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
      }
      .restore-confirm-message strong {
        display: block;
        margin-bottom: 6px;
        color: var(--accent-danger, #ef4444);
      }
      .restore-confirm-message p {
        margin: 0;
        font-size: 0.88rem;
        color: var(--text-secondary, #64748b);
        line-height: 1.5;
      }
      .selected-file {
        margin-top: 8px !important;
        font-weight: 600;
        color: var(--text-primary) !important;
      }
      .restore-confirm-buttons {
        display: flex;
        gap: 12px;
      }
      .btn-warning {
        background: #f59e0b;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: var(--transition-fast);
      }
      .btn-warning:hover {
        background: #d97706;
      }
      .btn-warning:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn-secondary {
        background: var(--border-light, #e2e8f0);
        color: var(--text-primary);
        border: none;
        padding: 10px 20px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: var(--transition-fast);
      }
      .btn-secondary:hover {
        background: var(--border-medium, #cbd5e1);
      }

      /* E-Mail-Verwaltung */
      .email-mgmt-tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 16px;
        background: var(--bg-secondary, #f1f5f9);
        border-radius: var(--radius-md, 10px);
        padding: 4px;
      }
      .tab-btn {
        flex: 1;
        padding: 8px 16px;
        border: none;
        border-radius: var(--radius-sm, 8px);
        background: transparent;
        color: var(--text-secondary, #64748b);
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: var(--transition-fast);
      }
      .tab-btn.active {
        background: var(--bg-card, #fff);
        color: var(--accent-primary, #6366f1);
        box-shadow: var(--shadow-sm);
      }
      .section-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }
      .section-desc {
        margin: 0;
        font-size: 0.88rem;
        color: var(--text-secondary, #64748b);
      }
      .btn-sm {
        padding: 7px 14px;
        font-size: 0.85rem;
      }
      .email-account-form-card {
        background: var(--bg-secondary, #f8fafc);
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        padding: 20px;
        margin-bottom: 20px;
      }
      .email-account-form-card h3 {
        margin: 0 0 16px 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-primary);
      }
      .form-checkboxes {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
        margin: 12px 0 16px;
      }
      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.88rem;
        font-weight: 500;
        color: var(--text-primary);
        cursor: pointer;
      }
      .checkbox-label input[type='checkbox'] {
        width: 16px;
        height: 16px;
        accent-color: var(--accent-primary, #6366f1);
        cursor: pointer;
      }
      .email-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.88rem;
        margin-top: 8px;
      }
      .email-table th {
        padding: 8px 12px;
        text-align: left;
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-secondary, #64748b);
        text-transform: uppercase;
        letter-spacing: 0.03em;
        border-bottom: 1.5px solid var(--border-light, #e2e8f0);
      }
      .email-table td {
        padding: 10px 12px;
        border-bottom: 1px solid var(--border-light, #e2e8f0);
        color: var(--text-primary);
        vertical-align: middle;
      }
      .email-table tr:last-child td {
        border-bottom: none;
      }
      .email-table .text-muted {
        color: var(--text-secondary, #64748b);
      }
      .actions-cell {
        display: flex;
        gap: 4px;
        align-items: center;
      }
      .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px 6px;
        border-radius: var(--radius-sm, 6px);
        font-size: 1rem;
        transition: background 0.15s;
      }
      .btn-icon:hover {
        background: var(--bg-secondary, #f1f5f9);
      }
      .btn-icon-danger:hover {
        background: rgba(239, 68, 68, 0.08);
      }
      .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-left: 4px;
      }
      .badge-primary {
        background: rgba(99, 102, 241, 0.12);
        color: var(--accent-primary, #6366f1);
      }
      .badge-success {
        background: rgba(16, 185, 129, 0.1);
        color: var(--accent-success, #10b981);
      }
      .badge-danger {
        background: rgba(239, 68, 68, 0.1);
        color: var(--accent-danger, #ef4444);
      }
      .badge-muted {
        background: var(--border-light, #e2e8f0);
        color: var(--text-secondary, #64748b);
      }
      .email-accounts-empty {
        padding: 24px;
        text-align: center;
        color: var(--text-secondary, #64748b);
        font-size: 0.9rem;
      }
      .btn-danger {
        background: var(--accent-danger, #ef4444);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: var(--radius-md, 10px);
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: var(--transition-fast);
      }
      .btn-danger:hover {
        background: #dc2626;
      }
      .btn-danger:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ],
})
export class SettingsComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.stopSyncPolling();
  }

  private settingsService = inject(SettingsService);
  private backupService = inject(BackupService);
  private kleinanzeigenService = inject(KleinanzeigenService);
  private http = inject(HttpClient);
  themeService = inject(ThemeService);
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);

  loading = true;
  saving = false;
  showSuccess = false;
  currentLanguage: Language = 'de';

  // Kleinanzeigen sync
  syncing = false;
  lastSyncTime: Date | null = null;
  syncResult: KleinanzeigenSyncResult | null = null;
  private syncPollTimer: any = null;

  // Backup & Restore
  creatingBackup = false;
  restoringBackup = false;
  backupSuccess = '';
  backupError = '';
  restoreSuccess = '';
  restoreError = '';
  showRestoreConfirm = false;
  selectedRestoreFile: File | null = null;

  // Email test
  testEmailAddress = '';
  sendingTestEmail = false;
  testEmailSuccess = '';
  testEmailError = '';

  // E-Mail-Verwaltung
  emailTab: 'accounts' | 'logs' = 'accounts';
  emailAccounts: EmailAccount[] = [];
  emailLogs: EmailLog[] = [];
  showingEmailForm = false;
  editingEmailAccountId: number | null = null;
  savingEmailAccount = false;
  emailAccountSuccess = '';
  emailAccountError = '';
  deletingEmailAccount: EmailAccount | null = null;
  deletingEmailAccountLoading = false;
  eaf: EmailAccountForm = this.defaultEmailForm();

  // User account
  currentUser: UserInfo | null = null;
  usernameForm = { newUsername: '', currentPassword: '' };
  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  savingUsername = false;
  savingPassword = false;
  usernameSuccess = '';
  usernameError = '';
  passwordSuccess = '';
  passwordError = '';

  settings: ShopSettings = {
    id: 0,
    shopName: '',
    strasse: '',
    hausnummer: '',
    plz: '',
    stadt: '',
    telefon: '',
    email: '',
    website: '',
    steuernummer: '',
    ustIdNr: '',
    bankname: '',
    iban: '',
    bic: '',
    inhaberVorname: '',
    inhaberNachname: '',
    fahrradNummerStart: 1,
    kleinanzeigenUrl: '',
    googleReviewUrl: '',
    oeffnungszeiten: '',
    oeffnungszeitenJson: undefined,
    zusatzinfo: '',
    companyEmails: undefined,
    logoBase64: undefined,
    logoFileName: undefined,
    inhaberSignatureBase64: undefined,
    inhaberSignatureFileName: undefined,
  };

  ownerSignatureData = '';

  // Structured opening-hours editor
  dayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  openingDays: { closed: boolean; ranges: { from: string; to: string }[] }[] =
    [];
  openingNotes: string[] = [];
  trackByIndex = (i: number) => i;

  // Company Emails Management
  companyEmailsList: string[] = [];
  newCompanyEmail = '';
  addingCompanyEmail = false;

  get t() {
    return this.translationService.translations();
  }

  ngOnInit(): void {
    this.currentLanguage = this.translationService.currentLanguage();
    this.loadSettings();
    this.loadCurrentUser();
    this.loadLastSyncTime();
    this.loadEmailAccounts();
  }

  loadLastSyncTime(): void {
    this.kleinanzeigenService.getLastSync().subscribe({
      next: (data) => {
        this.lastSyncTime = data.lastSyncedAt
          ? new Date(data.lastSyncedAt)
          : null;
      },
      error: () => {},
    });
  }

  triggerKleinanzeigenSync(): void {
    this.syncing = true;
    this.syncResult = null;
    this.kleinanzeigenService.triggerSync().subscribe({
      next: () => {
        // Sync started in background — poll for status
        this.startSyncPolling();
      },
      error: (err) => {
        this.syncResult = {
          newListings: 0,
          updatedListings: 0,
          deactivatedListings: 0,
          syncedAt: new Date().toISOString(),
          error:
            this.t.syncFailed +
            ' ' +
            (err.error?.message || err.message || this.t.unknownError),
        };
        this.syncing = false;
      },
    });
  }

  private startSyncPolling(): void {
    this.stopSyncPolling();
    this.syncPollTimer = setInterval(() => {
      this.kleinanzeigenService.getSyncStatus().subscribe({
        next: (status) => {
          if (!status.syncing && status.result) {
            this.syncResult = status.result;
            this.syncing = false;
            if (!status.result.error) {
              this.lastSyncTime = new Date(status.result.syncedAt);
            }
            this.stopSyncPolling();
          }
        },
        error: () => {
          // Keep polling on transient errors
        },
      });
    }, 3000);
  }

  private stopSyncPolling(): void {
    if (this.syncPollTimer) {
      clearInterval(this.syncPollTimer);
      this.syncPollTimer = null;
    }
  }

  loadCurrentUser(): void {
    this.authService.getMe().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (err) => {
        console.error('Error loading user:', err);
      },
    });
  }

  changeUsername(): void {
    this.usernameError = '';
    this.usernameSuccess = '';

    if (!this.usernameForm.newUsername || !this.usernameForm.currentPassword) {
      return;
    }

    this.savingUsername = true;
    this.authService
      .changeUsername({
        newUsername: this.usernameForm.newUsername,
        currentPassword: this.usernameForm.currentPassword,
      })
      .subscribe({
        next: () => {
          this.usernameSuccess = this.t.usernameChanged;
          this.usernameForm = { newUsername: '', currentPassword: '' };
          this.loadCurrentUser();
          this.savingUsername = false;
        },
        error: () => {
          this.usernameError = this.t.usernameChangeError;
          this.savingUsername = false;
        },
      });
  }

  changePassword(): void {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.passwordError = this.t.passwordMismatch;
      return;
    }

    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword) {
      return;
    }

    this.savingPassword = true;
    this.authService
      .changePassword({
        currentPassword: this.passwordForm.currentPassword,
        newPassword: this.passwordForm.newPassword,
      })
      .subscribe({
        next: () => {
          this.passwordSuccess = this.t.passwordChanged;
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          };
          this.savingPassword = false;
        },
        error: () => {
          this.passwordError = this.t.passwordChangeError;
          this.savingPassword = false;
        },
      });
  }

  parseOpeningHours(): void {
    const blank = () => ({ from: '', to: '' });
    const ensure2 = (ranges: unknown): { from: string; to: string }[] => {
      const r = Array.isArray(ranges)
        ? ranges.map((x: any) => ({ from: x?.from || '', to: x?.to || '' }))
        : [];
      while (r.length < 2) r.push(blank());
      return r.slice(0, 2);
    };
    try {
      const raw = this.settings.oeffnungszeitenJson;
      if (raw) {
        const parsed = JSON.parse(raw);
        const days: any[] = Array.isArray(parsed?.days) ? parsed.days : [];
        this.openingDays = Array.from({ length: 7 }, (_, i) => ({
          closed: !!days[i]?.closed,
          ranges: ensure2(days[i]?.ranges),
        }));
        this.openingNotes = Array.isArray(parsed?.notes)
          ? parsed.notes.map((n: any) => String(n))
          : [];
        return;
      }
    } catch {
      /* fall through to defaults */
    }
    // Default: Mo–Sa 13:00–17:00, So closed + the standard notes.
    this.openingDays = Array.from({ length: 7 }, (_, i) => ({
      closed: i === 6,
      ranges:
        i === 6 ? ensure2([]) : ensure2([{ from: '13:00', to: '17:00' }]),
    }));
    this.openingNotes = [
      'Fahrradverleih 10:00–13:00 nur mit Termin',
      'Fahrradrückgabe bis 18:00 Uhr',
    ];
  }

  serializeOpeningHours(): string {
    const days = this.openingDays.map((d) => ({
      closed: d.closed,
      ranges: d.closed ? [] : d.ranges.filter((r) => r.from && r.to),
    }));
    const notes = this.openingNotes
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    return JSON.stringify({ days, notes });
  }

  addNote(): void {
    this.openingNotes.push('');
  }

  removeNote(i: number): void {
    this.openingNotes.splice(i, 1);
  }

  loadSettings(): void {
    this.loading = true;
    this.settingsService.getSettings().subscribe({
      next: (data) => {
        this.settings = data;
        this.parseOpeningHours();
        if (data.companyEmails) {
          try {
            this.companyEmailsList = JSON.parse(data.companyEmails);
          } catch {
            this.companyEmailsList = [];
          }
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading settings:', err);
        this.loading = false;
      },
    });
  }

  saveSettings(): void {
    this.saving = true;
    this.settingsService
      .updateSettings({
        shopName: this.settings.shopName,
        strasse: this.settings.strasse,
        hausnummer: this.settings.hausnummer,
        plz: this.settings.plz,
        stadt: this.settings.stadt,
        telefon: this.settings.telefon,
        email: this.settings.email,
        website: this.settings.website,
        steuernummer: this.settings.steuernummer,
        ustIdNr: this.settings.ustIdNr,
        bankname: this.settings.bankname,
        iban: this.settings.iban,
        bic: this.settings.bic,
        inhaberVorname: this.settings.inhaberVorname,
        inhaberNachname: this.settings.inhaberNachname,
        fahrradNummerStart: this.settings.fahrradNummerStart || 1,
        kleinanzeigenUrl: this.settings.kleinanzeigenUrl,
        googleReviewUrl: this.settings.googleReviewUrl,
        oeffnungszeiten: this.settings.oeffnungszeiten,
        oeffnungszeitenJson: this.serializeOpeningHours(),
        zusatzinfo: this.settings.zusatzinfo,
        companyEmails: JSON.stringify(this.companyEmailsList) || undefined,
      })
      .subscribe({
        next: (data) => {
          this.settings = data;
          this.saving = false;
          this.showSuccessMessage();
        },
        error: (err) => {
          console.error('Error saving settings:', err);
          this.saving = false;
        },
      });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = reader.result as string;
        this.settingsService
          .uploadLogo({
            logoBase64: base64,
            fileName: file.name,
          })
          .subscribe({
            next: (data) => {
              this.settings = data;
              this.showSuccessMessage();
            },
            error: (err) => console.error('Error uploading logo:', err),
          });
      };

      reader.readAsDataURL(file);
    }
  }

  deleteLogo(): void {
    this.settingsService.deleteLogo().subscribe({
      next: () => {
        this.settings.logoBase64 = undefined;
        this.settings.logoFileName = undefined;
        this.showSuccessMessage();
      },
      error: (err) => console.error('Error deleting logo:', err),
    });
  }

  saveOwnerSignature(): void {
    if (!this.ownerSignatureData) return;
    this.settingsService
      .uploadOwnerSignature({
        signatureBase64: this.ownerSignatureData,
        fileName: 'owner-signature.png',
      })
      .subscribe({
        next: (data) => {
          this.settings = data;
          this.ownerSignatureData = '';
          this.showSuccessMessage();
        },
        error: (err) => console.error('Error saving signature:', err),
      });
  }

  onSignatureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = reader.result as string;
        this.settingsService
          .uploadOwnerSignature({
            signatureBase64: base64,
            fileName: file.name,
          })
          .subscribe({
            next: (data) => {
              this.settings = data;
              this.showSuccessMessage();
            },
            error: (err) => console.error('Error uploading signature:', err),
          });
      };

      reader.readAsDataURL(file);
    }
  }

  deleteOwnerSignature(): void {
    this.settingsService.deleteOwnerSignature().subscribe({
      next: () => {
        this.settings.inhaberSignatureBase64 = undefined;
        this.settings.inhaberSignatureFileName = undefined;
        this.showSuccessMessage();
      },
      error: (err) => console.error('Error deleting signature:', err),
    });
  }

  changeLanguage(lang: Language): void {
    this.translationService.setLanguage(lang);
  }

  // ── Email Test ──

  sendTestEmail(): void {
    if (!this.testEmailAddress) return;
    this.sendingTestEmail = true;
    this.testEmailSuccess = '';
    this.testEmailError = '';

    this.http
      .post<{
        message: string;
      }>(`${environment.apiUrl}/settings/test-email`, {
        toEmail: this.testEmailAddress,
      })
      .subscribe({
        next: (res) => {
          this.testEmailSuccess = res.message;
          this.sendingTestEmail = false;
        },
        error: (err) => {
          this.testEmailError =
            err.error?.error ||
            'E-Mail konnte nicht gesendet werden. SMTP-Konfiguration prüfen.';
          this.sendingTestEmail = false;
        },
      });
  }

  // ── E-Mail-Verwaltung ──

  private defaultEmailForm(): EmailAccountForm {
    return {
      name: '',
      host: '',
      port: 587,
      username: '',
      password: '',
      fromEmail: '',
      fromName: '',
      useSsl: true,
      isDefault: false,
      isActive: true,
    };
  }

  switchEmailTab(tab: 'accounts' | 'logs'): void {
    this.emailTab = tab;
    if (tab === 'logs') this.loadEmailLogs();
  }

  loadEmailAccounts(): void {
    this.http
      .get<EmailAccount[]>(`${environment.apiUrl}/email-accounts`)
      .subscribe({
        next: (accounts) => {
          this.emailAccounts = accounts;
        },
        error: () => {},
      });
  }

  loadEmailLogs(): void {
    this.http
      .get<EmailLog[]>(`${environment.apiUrl}/email-accounts/logs`)
      .subscribe({
        next: (logs) => {
          this.emailLogs = logs;
        },
        error: () => {},
      });
  }

  openEmailAccountForm(): void {
    this.editingEmailAccountId = null;
    this.eaf = this.defaultEmailForm();
    this.emailAccountSuccess = '';
    this.emailAccountError = '';
    this.showingEmailForm = true;
  }

  editEmailAccount(acc: EmailAccount): void {
    this.editingEmailAccountId = acc.id;
    this.eaf = {
      name: acc.name,
      host: acc.host,
      port: acc.port,
      username: acc.username,
      password: '',
      fromEmail: acc.fromEmail,
      fromName: acc.fromName,
      useSsl: acc.useSsl,
      isDefault: acc.isDefault,
      isActive: acc.isActive,
    };
    this.emailAccountSuccess = '';
    this.emailAccountError = '';
    this.showingEmailForm = true;
  }

  cancelEmailAccountForm(): void {
    this.showingEmailForm = false;
    this.editingEmailAccountId = null;
    this.emailAccountSuccess = '';
    this.emailAccountError = '';
  }

  saveEmailAccount(): void {
    this.savingEmailAccount = true;
    this.emailAccountSuccess = '';
    this.emailAccountError = '';

    const body = { ...this.eaf };
    const req = this.editingEmailAccountId
      ? this.http.put<EmailAccount>(
          `${environment.apiUrl}/email-accounts/${this.editingEmailAccountId}`,
          body,
        )
      : this.http.post<EmailAccount>(
          `${environment.apiUrl}/email-accounts`,
          body,
        );

    req.subscribe({
      next: () => {
        this.savingEmailAccount = false;
        this.emailAccountSuccess = 'Konto gespeichert.';
        this.showingEmailForm = false;
        this.loadEmailAccounts();
        setTimeout(() => (this.emailAccountSuccess = ''), 3000);
      },
      error: (err) => {
        this.emailAccountError = err.error?.message || 'Fehler beim Speichern.';
        this.savingEmailAccount = false;
      },
    });
  }

  confirmDeleteEmailAccount(acc: EmailAccount): void {
    this.deletingEmailAccount = acc;
  }

  deleteEmailAccount(): void {
    if (!this.deletingEmailAccount) return;
    this.deletingEmailAccountLoading = true;
    this.http
      .delete(
        `${environment.apiUrl}/email-accounts/${this.deletingEmailAccount.id}`,
      )
      .subscribe({
        next: () => {
          this.deletingEmailAccountLoading = false;
          this.deletingEmailAccount = null;
          this.loadEmailAccounts();
        },
        error: () => {
          this.deletingEmailAccountLoading = false;
        },
      });
  }

  // ── Backup & Restore ──

  createBackup(): void {
    this.creatingBackup = true;
    this.backupSuccess = '';
    this.backupError = '';

    this.backupService.downloadBackup().subscribe({
      next: (blob) => {
        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .slice(0, 19);
        const fileName = `BikeHaus_Backup_${timestamp}.zip`;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.backupSuccess = this.t.backupSuccess;
        this.creatingBackup = false;
        setTimeout(() => (this.backupSuccess = ''), 5000);
      },
      error: (err) => {
        console.error('Backup error:', err);
        this.backupError = this.t.backupError;
        this.creatingBackup = false;
        setTimeout(() => (this.backupError = ''), 5000);
      },
    });
  }

  onRestoreFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedRestoreFile = input.files[0];
      this.showRestoreConfirm = true;
      this.restoreError = '';
      this.restoreSuccess = '';
    }
    // Reset file input so same file can be selected again
    input.value = '';
  }

  confirmRestore(): void {
    if (!this.selectedRestoreFile) return;

    this.restoringBackup = true;
    this.restoreError = '';
    this.restoreSuccess = '';

    this.backupService.restoreBackup(this.selectedRestoreFile).subscribe({
      next: () => {
        this.restoreSuccess = this.t.restoreSuccess;
        this.restoringBackup = false;
        this.showRestoreConfirm = false;
        this.selectedRestoreFile = null;

        // Reload the page after 2 seconds to apply restored data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      error: (err) => {
        console.error('Restore error:', err);
        this.restoreError = err.error?.message || this.t.restoreError;
        this.restoringBackup = false;
        setTimeout(() => (this.restoreError = ''), 8000);
      },
    });
  }

  cancelRestore(): void {
    this.showRestoreConfirm = false;
    this.selectedRestoreFile = null;
    this.restoreError = '';
  }

  private showSuccessMessage(): void {
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }

  // ── Company Emails Management ──

  addCompanyEmail(): void {
    const email = this.newCompanyEmail.trim();
    if (!email) return;
    if (
      !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ||
      this.companyEmailsList.includes(email)
    ) {
      return;
    }

    const password = window.prompt(
      `Passwort für ${email} eingeben (mindestens 8 Zeichen):`,
    );
    if (!password || password.length < 8) {
      alert('Passwort muss mindestens 8 Zeichen haben.');
      return;
    }

    this.settingsService.createCompanyEmail({ email, password }).subscribe({
      next: (data) => {
        this.settings = data;
        if (data.companyEmails) {
          try {
            this.companyEmailsList = JSON.parse(data.companyEmails);
          } catch {
            this.companyEmailsList = [];
          }
        }
        this.newCompanyEmail = '';
        this.showSuccessMessage();
      },
      error: (err) => {
        alert(
          err.error?.error ||
            'Mailbox konnte nicht erstellt werden. Provisioning prüfen.',
        );
      },
    });
  }

  removeCompanyEmail(email: string): void {
    this.companyEmailsList = this.companyEmailsList.filter((e) => e !== email);
    this.saveSettings();
  }

  changeCompanyEmailPassword(email: string): void {
    const newPassword = window.prompt(
      `Neues Passwort für ${email} eingeben (mindestens 8 Zeichen):`,
    );
    if (!newPassword || newPassword.length < 8) {
      alert('Passwort muss mindestens 8 Zeichen haben.');
      return;
    }

    this.settingsService
      .changeCompanyEmailPassword({ email, newPassword })
      .subscribe({
        next: () => {
          alert('Passwort erfolgreich geändert.');
        },
        error: (err) => {
          alert(err.error?.error || 'Passwort konnte nicht geändert werden.');
        },
      });
  }
}
