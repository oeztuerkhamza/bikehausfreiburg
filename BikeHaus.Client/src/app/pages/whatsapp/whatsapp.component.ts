import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * WhatsApp asistanı sayfası. Ayrı Node servisini (whatsapp-web.js + Claude)
 * iframe ile gömer. JWT, URL hash üzerinden geçirilir; gömülü uygulama bunu
 * okuyup kendi API/socket isteklerinde kullanır. Servis aynı JWT_SECRET_KEY ile
 * doğrular.
 */
@Component({
  selector: 'app-whatsapp',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wa-wrap">
      <iframe
        *ngIf="src()"
        [src]="src()"
        title="WhatsApp Asistan"
        allow="microphone"
        class="wa-frame"
      ></iframe>
      <div class="wa-missing" *ngIf="!src()">
        <p>Oturum bulunamadı. Lütfen tekrar giriş yap.</p>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
      .wa-wrap {
        height: 100%;
        min-height: calc(100vh - 140px);
        margin: -28px;
      }
      .wa-frame {
        display: block;
        width: 100%;
        height: 100%;
        border: 0;
      }
      .wa-missing {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--text-muted);
      }
      @media (max-width: 768px) {
        .wa-wrap {
          margin: -20px -16px;
          min-height: calc(100vh - 120px);
        }
      }
    `,
  ],
})
export class WhatsappComponent implements OnInit {
  private auth = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  src = signal<SafeResourceUrl | null>(null);

  ngOnInit(): void {
    const token = this.auth.getToken();
    if (!token) return;
    // allow="microphone" (yukarıda) sesli yazdırma için gerekli.
    const url = `${environment.whatsappUrl}#token=${encodeURIComponent(token)}`;
    this.src.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }
}
