import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { PublicShopInfo } from '../../models/models';

@Component({
  selector: 'app-impressum',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-page">
      <header class="page-header">
        <div class="container">
          <span class="label">LEGAL</span>
          <h1>{{ t().legalNotice }}</h1>
        </div>
      </header>

      <div class="container legal-body">
        <article class="legal-content">
          <section>
            <h2>Angaben gemäß § 5 TMG</h2>
            <p>
              <strong>{{ shopInfo()?.shopName || 'Bike Haus Freiburg' }}</strong
              ><br />
              {{ shopInfo()?.strasse }} {{ shopInfo()?.hausnummer }}<br />
              {{ shopInfo()?.plz }} {{ shopInfo()?.stadt }}<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2>Kontakt</h2>
            <p>
              E-Mail: {{ shopInfo()?.email || 'bikehausfreiburg@gmail.com'
              }}<br />
              Telefon / WhatsApp:
              {{ shopInfo()?.telefon || '+49 155 6630 0011' }}
            </p>
          </section>

          @if (shopInfo()?.ustIdNr || shopInfo()?.steuernummer) {
            <section>
              <h2>Umsatzsteuer</h2>
              @if (shopInfo()?.ustIdNr) {
                <p>
                  Umsatzsteuer-Identifikationsnummer gemäß § 27a
                  Umsatzsteuergesetz:<br />
                  <strong>{{ shopInfo()!.ustIdNr }}</strong>
                </p>
              }
              @if (shopInfo()?.steuernummer) {
                <p>
                  Steuernummer: <strong>{{ shopInfo()!.steuernummer }}</strong>
                </p>
              }
            </section>
          }

          <section>
            <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>
              {{ shopInfo()?.shopName || 'Bike Haus Freiburg' }}<br />
              {{ shopInfo()?.strasse }} {{ shopInfo()?.hausnummer }}<br />
              {{ shopInfo()?.plz }} {{ shopInfo()?.stadt }}
            </p>
          </section>

          <section>
            <h2>Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit:
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener"
              >
                https://ec.europa.eu/consumers/odr </a
              >.
            </p>
            <p>
              Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht
              bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2>Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
              Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter
              jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die
              auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
              Informationen nach den allgemeinen Gesetzen bleiben hiervon
              unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
              Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
              Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir
              diese Inhalte umgehend entfernen.
            </p>
          </section>

          <section>
            <h2>Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf
              deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
              diese fremden Inhalte auch keine Gewähr übernehmen. Für die
              Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten
              wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
              überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
              Verlinkung nicht erkennbar.
            </p>
            <p>
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist
              jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht
              zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir
              derartige Links umgehend entfernen.
            </p>
          </section>

          <section>
            <h2>Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht. Die
              Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              Downloads und Kopien dieser Seite sind nur für den privaten, nicht
              kommerziellen Gebrauch gestattet.
            </p>
            <p>
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt
              wurden, werden die Urheberrechte Dritter beachtet. Insbesondere
              werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie
              trotzdem auf eine Urheberrechtsverletzung aufmerksam werden,
              bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von
              Rechtsverletzungen werden wir derartige Inhalte umgehend
              entfernen.
            </p>
          </section>

          <section>
            <h2>Markenhinweis</h2>
            <p>
              Die auf dieser Website genannten Markennamen (darunter Victoria,
              Conway, Bikestar, Pyro, Xtract, Cube, Ghost, Bulls, Naloo, Woom,
              Puky, Scott, Pegasus u. a.) dienen ausschließlich der
              Produktbeschreibung. Wir sind kein offizieller Vertragshändler
              aller genannten Marken. Offizielle Garantie- oder
              Serviceleistungen der jeweiligen Hersteller können wir ohne
              autorisierte Partnerschaft nicht erbringen.
            </p>
          </section>
        </article>

        <div class="legal-back">
          <a [routerLink]="['/' + lang()]" class="back-link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {{ t().home }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        padding: 7rem 0 3rem;
        background: var(--color-bg);
        border-bottom: 1px solid var(--color-border);
      }

      .label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--color-accent);
        margin-bottom: 0.75rem;
      }

      .page-header h1 {
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        font-weight: 800;
        color: var(--color-text);
        margin: 0;
        letter-spacing: -0.02em;
      }

      .legal-body {
        padding-top: 3rem;
        padding-bottom: 4rem;
      }

      .legal-content {
        max-width: 740px;
      }

      .legal-content section {
        margin-bottom: 2.5rem;
      }

      .legal-content h2 {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0 0 0.75rem;
      }

      .legal-content p {
        font-size: 0.92rem;
        color: var(--color-text-secondary);
        line-height: 1.75;
        margin: 0 0 0.75rem;
      }

      .legal-content p:last-child {
        margin-bottom: 0;
      }

      .legal-content strong {
        color: var(--color-text);
        font-weight: 700;
      }

      .legal-content a {
        color: var(--color-accent);
        text-decoration: none;
        transition: opacity 0.2s;
      }

      .legal-content a:hover {
        opacity: 0.8;
      }

      .legal-back {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid var(--color-border);
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-decoration: none;
        transition:
          color 0.2s,
          gap 0.2s;
      }

      .back-link:hover {
        color: var(--color-accent);
        gap: 0.6rem;
      }

      @media (max-width: 768px) {
        .page-header {
          padding: 6rem 0 2rem;
        }
      }
    `,
  ],
})
export class ImpressumComponent implements OnInit {
  private translationService = inject(TranslationService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private apiService = inject(ApiService);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;
  shopInfo = signal<PublicShopInfo | null>(null);

  ngOnInit(): void {
    this.apiService.getShopInfo().subscribe({
      next: (data) => this.shopInfo.set(data),
    });
    this.titleService.setTitle('Impressum — Bike Haus Freiburg');
    this.metaService.updateTag({
      name: 'description',
      content:
        'Impressum und rechtliche Angaben von Bike Haus Freiburg gemäß § 5 TMG.',
    });
    this.metaService.updateTag({ name: 'robots', content: 'noindex, follow' });
  }
}
