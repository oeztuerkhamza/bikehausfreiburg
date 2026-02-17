import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, ShopSettings } from '../../services/settings.service';
import { ThemeService } from '../../services/theme.service';
import {
  TranslationService,
  Language,
} from '../../services/translation.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        padding: 24px;
        max-width: 900px;
      }

      h1 {
        margin-bottom: 24px;
      }

      .success-message {
        background: var(--accent-success);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 20px;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
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
        color: var(--text-muted);
      }

      .settings-section {
        margin-bottom: 32px;
      }

      .settings-section h2 {
        margin-bottom: 16px;
        color: var(--text-heading);
      }

      .settings-section h3 {
        margin: 20px 0 12px;
        font-size: 1rem;
        color: var(--text-heading);
      }

      .settings-card {
        background: var(--bg-card);
        border-radius: 12px;
        padding: 24px;
        box-shadow: var(--shadow-sm);
      }

      /* Appearance Settings */
      .setting-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 0;
        border-bottom: 1px solid var(--border-light);
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
        font-weight: 500;
        color: var(--text-primary);
      }
      .setting-label small {
        color: var(--text-muted);
        font-size: 0.85rem;
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
        background: var(--border-color);
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
      }
      .toggle-switch input:checked + .toggle-slider {
        background: var(--accent-primary);
      }
      .toggle-switch input:checked + .toggle-slider:before {
        transform: translateX(22px);
      }

      .setting-row select {
        padding: 8px 12px;
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
        border-radius: 8px;
        border: 1px solid var(--border-color);
        padding: 8px;
        background: white;
      }

      .upload-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 40px 60px;
        border: 2px dashed var(--border-color);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .upload-area:hover {
        border-color: var(--accent-primary);
        background: var(--bg-secondary);
      }
      .upload-icon {
        font-size: 2rem;
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
        font-weight: 500;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }

      .form-group input,
      .form-group textarea {
        width: 100%;
      }

      .form-group textarea {
        resize: vertical;
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
    `,
  ],
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  themeService = inject(ThemeService);
  private translationService = inject(TranslationService);

  loading = true;
  saving = false;
  showSuccess = false;
  currentLanguage: Language = 'de';

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
    oeffnungszeiten: '',
    zusatzinfo: '',
    logoBase64: undefined,
    logoFileName: undefined,
  };

  get t() {
    return this.translationService.translations();
  }

  ngOnInit(): void {
    this.currentLanguage = this.translationService.currentLanguage();
    this.loadSettings();
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
