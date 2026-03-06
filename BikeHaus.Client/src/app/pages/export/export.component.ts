import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportService } from '../../services/export.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="export-page">
      <div class="page-header">
        <h1>{{ t.exportDocuments }}</h1>
      </div>

      <div class="export-card">
        <div class="card-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>
        <p class="export-desc">{{ t.exportDescription }}</p>

        <div class="folder-list">
          <div class="folder-item">
            <span class="folder-icon">📁</span>
            <span class="folder-name">Kaufbelege/</span>
            <span class="folder-hint">– {{ t.purchases }}</span>
          </div>
          <div class="folder-item">
            <span class="folder-icon">📁</span>
            <span class="folder-name">Verkaufsbelege/</span>
            <span class="folder-hint">– {{ t.sales }} (+ Einkaufspreis)</span>
          </div>
          <div class="folder-item">
            <span class="folder-icon">📁</span>
            <span class="folder-name">Rueckgabebelege/</span>
            <span class="folder-hint">– {{ t.returns }}</span>
          </div>
          <div class="folder-item">
            <span class="folder-icon">📁</span>
            <span class="folder-name">Ausgaben/</span>
            <span class="folder-hint">– {{ t.expenses }}</span>
          </div>
          <div class="folder-item">
            <span class="folder-icon">📁</span>
            <span class="folder-name">Rechnungen/</span>
            <span class="folder-hint">– {{ t.invoices }}</span>
          </div>
        </div>

        <div class="date-range">
          <div class="date-field">
            <label>{{ t.exportStartDate }}</label>
            <input type="date" [(ngModel)]="startDate" />
          </div>
          <div class="date-separator">–</div>
          <div class="date-field">
            <label>{{ t.exportEndDate }}</label>
            <input type="date" [(ngModel)]="endDate" />
          </div>
        </div>

        <button
          class="btn-export"
          (click)="download()"
          [disabled]="downloading || !startDate || !endDate"
        >
          <svg *ngIf="!downloading" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span *ngIf="!downloading">{{ t.exportDownloadZip }}</span>
          <span *ngIf="downloading" class="spinner"></span>
          <span *ngIf="downloading">{{ t.exportDownloading }}</span>
        </button>

        <div class="message success" *ngIf="successMsg">{{ successMsg }}</div>
        <div class="message error" *ngIf="errorMsg">{{ errorMsg }}</div>
      </div>
    </div>
  `,
  styles: [`
    .export-page {
      max-width: 700px;
      margin: 0 auto;
      animation: fadeIn 0.4s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .page-header {
      margin-bottom: 24px;
    }
    .page-header h1 {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }

    .export-card {
      background: var(--bg-card, #fff);
      border: 1.5px solid var(--border-light, #e2e8f0);
      border-radius: var(--radius-lg, 16px);
      padding: 32px;
      text-align: center;
    }

    .card-icon {
      color: var(--accent-primary, #6366f1);
      margin-bottom: 16px;
    }

    .export-desc {
      color: var(--text-secondary, #64748b);
      font-size: 0.95rem;
      margin-bottom: 24px;
      line-height: 1.6;
    }

    .folder-list {
      text-align: left;
      background: var(--bg-secondary, #f8fafc);
      border: 1px solid var(--border-light, #e2e8f0);
      border-radius: var(--radius-md, 10px);
      padding: 16px 20px;
      margin-bottom: 28px;
    }
    .folder-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
      font-size: 0.9rem;
    }
    .folder-icon { font-size: 1.1rem; }
    .folder-name {
      font-weight: 600;
      color: var(--text-primary);
      font-family: 'Courier New', monospace;
    }
    .folder-hint {
      color: var(--text-secondary, #64748b);
      font-size: 0.85rem;
    }

    .date-range {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      justify-content: center;
      margin-bottom: 24px;
    }
    .date-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .date-field label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .date-field input {
      padding: 10px 14px;
      border: 1.5px solid var(--border-light, #e2e8f0);
      border-radius: var(--radius-md, 10px);
      font-size: 0.92rem;
      background: var(--bg-card, #fff);
      color: var(--text-primary);
      min-width: 160px;
    }
    .date-field input:focus {
      outline: none;
      border-color: var(--accent-primary, #6366f1);
      box-shadow: 0 0 0 3px var(--accent-primary-light, rgba(99,102,241,0.1));
    }
    .date-separator {
      font-size: 1.2rem;
      color: var(--text-secondary, #64748b);
      padding-bottom: 10px;
    }

    .btn-export {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 28px;
      background: var(--accent-primary, #6366f1);
      color: #fff;
      border: none;
      border-radius: var(--radius-md, 10px);
      cursor: pointer;
      font-weight: 700;
      font-size: 0.95rem;
      transition: var(--transition-fast);
    }
    .btn-export:hover:not(:disabled) {
      background: var(--accent-primary-hover, #4f46e5);
      transform: translateY(-1px);
    }
    .btn-export:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2.5px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .message {
      margin-top: 16px;
      padding: 10px 16px;
      border-radius: var(--radius-md, 10px);
      font-size: 0.88rem;
      font-weight: 500;
    }
    .message.success {
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .message.error {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    @media (max-width: 500px) {
      .date-range {
        flex-direction: column;
        align-items: stretch;
      }
      .date-separator { text-align: center; }
      .date-field input { min-width: auto; width: 100%; }
      .export-card { padding: 20px; }
    }
  `],
})
export class ExportComponent {
  private readonly exportService = inject(ExportService);
  private readonly translationService = inject(TranslationService);

  startDate = '';
  endDate = '';
  downloading = false;
  successMsg = '';
  errorMsg = '';

  get t() {
    return this.translationService.translations();
  }

  download() {
    if (!this.startDate || !this.endDate) return;

    this.downloading = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.exportService.downloadZip(this.startDate, this.endDate).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Belege_${this.startDate}_bis_${this.endDate}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.successMsg = this.t.exportSuccess;
        this.downloading = false;
      },
      error: () => {
        this.errorMsg = this.t.exportError;
        this.downloading = false;
      },
    });
  }
}
