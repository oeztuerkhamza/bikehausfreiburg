import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, ShopSettings } from '../../services/settings.service';
import { ThemeService } from '../../services/theme.service';
import {
  TranslationService,
  Language,
} from '../../services/translation.service';
import { SignaturePadComponent } from '../../components/signature-pad/signature-pad.component';
import { AuthService, UserInfo } from '../../services/auth.service';

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

              <div class="form-grid">
                <div class="form-group full-width">
                  <label>{{ t.openingHours }}</label>
                  <textarea
                    [(ngModel)]="settings.oeffnungszeiten"
                    name="oeffnungszeiten"
                    rows="3"
                  ></textarea>
                </div>

                <div class="form-group full-width">
                  <label>{{ t.additionalInfo }}</label>
                  <textarea
                    [(ngModel)]="settings.zusatzinfo"
                    name="zusatzinfo"
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <!-- Bicycle Numbering -->
              <h3
                style="margin-top: 24px; margin-bottom: 12px; font-size: 0.95rem; color: var(--text-secondary, #64748b); font-weight: 600;"
              >
                Fahrrad-Nummerierung
              </h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Startnummer</label>
                  <input
                    type="number"
                    min="1"
                    [(ngModel)]="settings.fahrradNummerStart"
                    name="fahrradNummerStart"
                  />
                  <small
                    style="color: var(--text-secondary, #64748b); font-size: 0.78rem;"
                    >Neue Fahrräder bekommen automatisch die nächste
                    Nummer</small
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
        padding: 9px 14px;
        min-width: 150px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        font-size: 0.92rem;
        transition: var(--transition-fast);
      }
      .setting-row select:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
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
        padding: 9px 14px;
        border: 1.5px solid var(--border-light, #e2e8f0);
        border-radius: var(--radius-md, 10px);
        background: var(--bg-card, #fff);
        color: var(--text-primary);
        font-size: 0.92rem;
        transition: var(--transition-fast);
      }

      .form-group input:focus,
      .form-group textarea:focus,
      .form-group select:focus {
        outline: none;
        border-color: var(--accent-primary, #6366f1);
        box-shadow: 0 0 0 3px
          var(--accent-primary-light, rgba(99, 102, 241, 0.1));
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
    `,
  ],
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  themeService = inject(ThemeService);
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);

  loading = true;
  saving = false;
  showSuccess = false;
  currentLanguage: Language = 'de';

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
    oeffnungszeiten: '',
    zusatzinfo: '',
    logoBase64: undefined,
    logoFileName: undefined,
    inhaberSignatureBase64: undefined,
    inhaberSignatureFileName: undefined,
  };

  ownerSignatureData = '';

  get t() {
    return this.translationService.translations();
  }

  ngOnInit(): void {
    this.currentLanguage = this.translationService.currentLanguage();
    this.loadSettings();
    this.loadCurrentUser();
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

  loadSettings(): void {
    this.loading = true;
    this.settingsService.getSettings().subscribe({
      next: (data) => {
        if (data) {
          this.settings = data;
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
        oeffnungszeiten: this.settings.oeffnungszeiten,
        zusatzinfo: this.settings.zusatzinfo,
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

  private showSuccessMessage(): void {
    this.showSuccess = true;
    setTimeout(() => {
      this.showSuccess = false;
    }, 3000);
  }
}
