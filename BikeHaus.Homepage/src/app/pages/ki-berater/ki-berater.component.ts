import {
  Component, OnInit, OnDestroy, inject, signal, computed,
  PLATFORM_ID, ElementRef, ViewChild, afterNextRender,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';
import { ChatMessage, PublicBicycle, KleinanzeigenCard, BikeAdviserSseEvent, BikeAdviserShopCta } from '../../models/models';

@Component({
  selector: 'app-ki-berater',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="ki-berater-page">

      <!-- Hero -->
      <section class="hero">
        <div class="hero-content">
          <span class="label">KI · Fahrrad · Berater</span>
          <h1>{{ t().kiBeraterTitle }}</h1>
          <p class="subtitle">{{ t().kiBeraterSubtitle }}</p>
        </div>
      </section>

      <!-- Chat area -->
      <section class="chat-section">
        <div class="chat-wrapper">

          <!-- Quick-start chips (shown only before first message) -->
          @if (messages().length === 0) {
            <div class="welcome">
              <div class="welcome-icon">🚲</div>
              <h2>{{ t().kiBeraterWelcome }}</h2>
              <p>{{ t().kiBeraterWelcomeSub }}</p>
              <div class="chips">
                <button class="chip" (click)="sendQuick(t().kiBeraterQuick1)">{{ t().kiBeraterQuick1 }}</button>
                <button class="chip" (click)="sendQuick(t().kiBeraterQuick2)">{{ t().kiBeraterQuick2 }}</button>
                <button class="chip" (click)="sendQuick(t().kiBeraterQuick3)">{{ t().kiBeraterQuick3 }}</button>
                <button class="chip" (click)="sendQuick(t().kiBeraterQuick4)">{{ t().kiBeraterQuick4 }}</button>
              </div>
            </div>
          }

          <!-- Message list -->
          <div class="messages" #messagesContainer>
            @for (msg of messages(); track $index) {
              <div class="message" [class.user]="msg.role === 'user'" [class.assistant]="msg.role === 'assistant'">
                @if (msg.role === 'assistant') {
                  <div class="avatar">🤖</div>
                }
                <div class="message-body">
                  <div class="bubble" [innerHTML]="formatText(msg.content)"></div>

                  <!-- Kleinanzeigen cards -->
                  @if (msg.listings && msg.listings.length > 0) {
                    <div class="bike-cards">
                      @for (listing of msg.listings; track listing.id) {
                        <a [href]="listing.externalUrl" target="_blank" rel="noopener noreferrer" class="bike-card">
                          @if (listing.imageUrl) {
                            <img
                              [src]="listing.imageUrl"
                              [alt]="listing.title"
                              class="bike-img"
                              loading="lazy"
                              (error)="onImgError($event)"
                            />
                          } @else {
                            <div class="bike-img-placeholder">🚲</div>
                          }
                          <div class="bike-info">
                            <div class="bike-name">{{ listing.title }}</div>
                            @if (listing.category) {
                              <div class="bike-type">{{ listing.category }}</div>
                            }
                            <div class="bike-price">
                              {{ listing.price ? (listing.price | number:'1.0-0') + ' €' : (listing.priceText || t().kiBeraterPriceOnRequest) }}
                            </div>
                            <span class="bike-link">{{ t().kiBeraterViewBike }} →</span>
                          </div>
                        </a>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Streaming indicator -->
            @if (isStreaming()) {
              <div class="message assistant">
                <div class="avatar">🤖</div>
                <div class="message-body">
                  <div class="bubble typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Shop CTA -->
          @if (shopCta()?.show) {
            <div class="shop-cta">
              <div class="shop-cta-icon">📍</div>
              <div class="shop-cta-text">
                <strong>{{ t().kiBeraterShopCtaTitle }}</strong>
                <p>{{ t().kiBeraterShopCtaText }}</p>
              </div>
              <div class="shop-cta-actions">
                <a [routerLink]="['/', lang(), 'showroom']" class="btn-cta primary">
                  {{ t().kiBeraterShopCtaBtn }}
                </a>
                <a [routerLink]="['/', lang(), 'contact']" class="btn-cta secondary">
                  {{ t().kiBeraterContactCtaBtn }}
                </a>
              </div>
            </div>
          }

          <!-- Error -->
          @if (hasError()) {
            <div class="error-bar">{{ t().kiBeraterError }}</div>
          }

          <!-- Input -->
          <div class="input-area">
            <input
              type="text"
              [(ngModel)]="inputText"
              [placeholder]="t().kiBeraterInputPlaceholder"
              (keyup.enter)="send()"
              [disabled]="isStreaming()"
              class="chat-input"
            />
            <button
              class="send-btn"
              (click)="send()"
              [disabled]="isStreaming() || !inputText.trim()"
            >
              <span>{{ t().kiBeraterSend }}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>

          @if (messages().length > 0 && !isStreaming()) {
            <button class="clear-btn" (click)="clearChat()">{{ t().kiBeraterClearChat }}</button>
          }

        </div>
      </section>
    </div>
  `,
  styles: [`
    .ki-berater-page {
      min-height: 100vh;
      background: #f8f9fa;
      font-family: inherit;
    }

    /* ── Hero ── */
    .hero {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      padding: 80px 24px 64px;
      text-align: center;
      color: #fff;
    }
    .hero .label {
      display: inline-block;
      background: rgba(255,255,255,0.12);
      color: rgba(255,255,255,0.85);
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 12px;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .hero h1 {
      font-size: clamp(28px, 5vw, 52px);
      font-weight: 700;
      margin: 0 0 16px;
      line-height: 1.2;
    }
    .hero .subtitle {
      font-size: clamp(15px, 2vw, 18px);
      opacity: 0.8;
      max-width: 560px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* ── Chat section ── */
    .chat-section {
      max-width: 820px;
      margin: 0 auto;
      padding: 32px 16px 64px;
    }
    .chat-wrapper {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    /* ── Welcome ── */
    .welcome {
      padding: 40px 32px 24px;
      text-align: center;
      border-bottom: 1px solid #f0f0f0;
    }
    .welcome-icon { font-size: 48px; margin-bottom: 16px; }
    .welcome h2 { font-size: 20px; font-weight: 600; margin: 0 0 8px; color: #1a1a2e; }
    .welcome p { color: #666; margin: 0 0 24px; font-size: 15px; }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
    }
    .chip {
      background: #f0f4ff;
      color: #0f3460;
      border: 1.5px solid #d0daf5;
      border-radius: 100px;
      padding: 8px 18px;
      font-size: 13.5px;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }
    .chip:hover { background: #0f3460; color: #fff; border-color: #0f3460; }

    /* ── Messages ── */
    .messages {
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-height: 100px;
      max-height: 520px;
      overflow-y: auto;
    }
    .message {
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }
    .message.user { flex-direction: row-reverse; }
    .avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: #f0f4ff;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    .message-body { max-width: 75%; display: flex; flex-direction: column; gap: 12px; }
    .message.user .message-body { align-items: flex-end; }

    .bubble {
      background: #f0f4ff;
      padding: 12px 16px;
      border-radius: 18px 18px 18px 4px;
      font-size: 14.5px;
      line-height: 1.6;
      color: #222;
      white-space: pre-wrap;
    }
    .message.user .bubble {
      background: #0f3460;
      color: #fff;
      border-radius: 18px 18px 4px 18px;
    }

    /* Typing indicator */
    .bubble.typing {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 14px 20px;
      width: fit-content;
    }
    .bubble.typing span {
      display: block; width: 8px; height: 8px;
      border-radius: 50%; background: #0f3460;
      animation: bounce 1.2s infinite;
    }
    .bubble.typing span:nth-child(2) { animation-delay: 0.2s; }
    .bubble.typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }

    /* ── Bike cards ── */
    .bike-cards {
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
    }
    .bike-card {
      display: flex;
      gap: 12px;
      background: #f9faff;
      border: 1.5px solid #e0e8f5;
      border-radius: 12px;
      overflow: hidden;
      transition: box-shadow 0.2s, border-color 0.2s;
      text-decoration: none;
      color: inherit;
    }
    .bike-card:hover { box-shadow: 0 4px 16px rgba(15,52,96,0.12); border-color: #b0c4e8; }
    .bike-img {
      width: 90px; height: 80px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .bike-img-placeholder {
      width: 90px; height: 80px;
      background: #e8edf5;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px;
      flex-shrink: 0;
    }
    .bike-info {
      padding: 10px 12px 10px 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }
    .bike-name { font-weight: 600; font-size: 14px; color: #1a1a2e; }
    .bike-type { font-size: 12px; color: #666; }
    .bike-price { font-size: 15px; font-weight: 700; color: #0f3460; }
    .bike-link {
      font-size: 12.5px; color: #0f3460; text-decoration: none; font-weight: 500;
      margin-top: 2px;
    }
    .bike-link:hover { text-decoration: underline; }

    /* ── Shop CTA ── */
    .shop-cta {
      margin: 0 20px 20px;
      background: linear-gradient(135deg, #f0f4ff, #e8eefa);
      border: 1.5px solid #c5d0ef;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }
    .shop-cta-icon { font-size: 32px; }
    .shop-cta-text { flex: 1; min-width: 160px; }
    .shop-cta-text strong { display: block; font-size: 15px; color: #1a1a2e; margin-bottom: 4px; }
    .shop-cta-text p { font-size: 13px; color: #555; margin: 0; }
    .shop-cta-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .btn-cta {
      padding: 9px 18px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-cta.primary { background: #0f3460; color: #fff; }
    .btn-cta.primary:hover { background: #1a4a7a; }
    .btn-cta.secondary { background: #fff; color: #0f3460; border: 1.5px solid #0f3460; }
    .btn-cta.secondary:hover { background: #0f3460; color: #fff; }

    /* ── Error ── */
    .error-bar {
      margin: 0 20px 12px;
      padding: 10px 16px;
      background: #fff0f0;
      border: 1px solid #f5c2c7;
      border-radius: 8px;
      color: #842029;
      font-size: 13.5px;
    }

    /* ── Input ── */
    .input-area {
      display: flex;
      gap: 10px;
      padding: 16px 20px;
      border-top: 1px solid #f0f0f0;
    }
    .chat-input {
      flex: 1;
      border: 1.5px solid #dde2f0;
      border-radius: 10px;
      padding: 11px 16px;
      font-size: 14.5px;
      font-family: inherit;
      outline: none;
      transition: border-color 0.2s;
    }
    .chat-input:focus { border-color: #0f3460; }
    .chat-input:disabled { background: #f5f5f5; }
    .send-btn {
      background: #0f3460;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 11px 20px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      display: flex; align-items: center; gap: 8px;
      transition: background 0.2s;
      font-family: inherit;
    }
    .send-btn:hover:not(:disabled) { background: #1a4a7a; }
    .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .clear-btn {
      display: block;
      margin: 0 auto 16px;
      background: none;
      border: none;
      color: #888;
      font-size: 12.5px;
      cursor: pointer;
      text-decoration: underline;
      font-family: inherit;
    }
    .clear-btn:hover { color: #333; }

    @media (max-width: 600px) {
      .hero { padding: 60px 16px 48px; }
      .welcome { padding: 28px 16px 20px; }
      .messages { padding: 16px; max-height: 400px; }
      .message-body { max-width: 88%; }
      .chip { font-size: 12.5px; padding: 7px 14px; }
      .shop-cta { flex-direction: column; }
    }
  `]
})
export class KiBeraterComponent implements OnInit, OnDestroy {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private translationService = inject(TranslationService);
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  private scrollTimeout: ReturnType<typeof setTimeout> | null = null;

  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLElement>;

  t = this.translationService.translations;
  lang = signal<string>('de');

  messages = signal<ChatMessage[]>([]);
  isStreaming = signal(false);
  hasError = signal(false);
  shopCta = signal<BikeAdviserShopCta | null>(null);
  inputText = '';

  private get isBrowser(): boolean { return isPlatformBrowser(this.platformId); }
  private get apiBaseUrl(): string { return environment.apiUrl; }

  ngOnInit(): void {
    const l = this.route.snapshot.paramMap.get('lang') ?? 'de';
    this.lang.set(l);
    this.updateSeo();
  }

  ngOnDestroy(): void {
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
  }

  send(): void {
    const text = this.inputText.trim();
    if (!text || this.isStreaming()) return;
    this.inputText = '';
    this.sendMessage(text);
  }

  sendQuick(text: string): void {
    if (this.isStreaming()) return;
    this.sendMessage(text);
  }

  clearChat(): void {
    this.messages.set([]);
    this.shopCta.set(null);
    this.hasError.set(false);
  }

  imageUrl(bike: PublicBicycle): string {
    if (!bike.images?.length) return '';
    return `${this.apiBaseUrl}/gallery-image/${bike.images[0].filePath}`;
  }

  onImgError(event: Event): void {
    const el = event.target as HTMLImageElement;
    el.style.display = 'none';
  }

  formatText(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  private async sendMessage(text: string): Promise<void> {
    if (!this.isBrowser) return;

    this.hasError.set(false);
    this.shopCta.set(null);

    // Add user message
    this.messages.update(msgs => [...msgs, { role: 'user', content: text }]);

    // Add empty assistant placeholder
    this.messages.update(msgs => [...msgs, { role: 'assistant', content: '', isStreaming: true }]);
    this.isStreaming.set(true);
    this.scrollToBottom();

    try {
      const historyForApi = this.messages()
        .slice(0, -1) // exclude the empty assistant placeholder
        .map(m => ({ role: m.role, content: m.content }));

      const response = await this.apiService.streamBikeChat(historyForApi, this.lang());
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (!json) continue;

          const event = JSON.parse(json) as BikeAdviserSseEvent;
          this.handleSseEvent(event);
        }

        this.scrollToBottom();
      }
    } catch {
      this.hasError.set(true);
      this.messages.update(msgs => {
        const updated = [...msgs];
        updated[updated.length - 1] = { ...updated[updated.length - 1], content: '', isStreaming: false };
        return updated;
      });
    } finally {
      this.isStreaming.set(false);
      // Remove isStreaming flag from last message
      this.messages.update(msgs => {
        const updated = [...msgs];
        if (updated.length > 0)
          updated[updated.length - 1] = { ...updated[updated.length - 1], isStreaming: false };
        return updated;
      });
    }
  }

  private handleSseEvent(event: BikeAdviserSseEvent): void {
    if (event.type === 'delta' && event.text) {
      this.messages.update(msgs => {
        const updated = [...msgs];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = { ...last, content: last.content + event.text };
        return updated;
      });
    } else if (event.type === 'listings' && event.listings) {
      this.messages.update(msgs => {
        const updated = [...msgs];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = { ...last, listings: event.listings };
        return updated;
      });
    } else if (event.type === 'done') {
      if (event.shopCta) this.shopCta.set(event.shopCta);
    }
  }

  private scrollToBottom(): void {
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  private updateSeo(): void {
    const tr = this.t();
    this.titleService.setTitle(tr.kiBeraterMetaTitle);
    this.metaService.updateTag({ name: 'description', content: tr.kiBeraterMetaDescription });
    this.metaService.updateTag({ property: 'og:title', content: tr.kiBeraterTitle });
    this.metaService.updateTag({ property: 'og:description', content: tr.kiBeraterMetaDescription });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });
  }
}
