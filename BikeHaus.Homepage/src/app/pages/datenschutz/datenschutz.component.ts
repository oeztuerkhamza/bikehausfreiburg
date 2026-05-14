import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-datenschutz',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-page">
      <header class="page-header">
        <div class="container">
          <span class="label">RECHTLICHES</span>
          <h1>Datenschutzerklärung</h1>
          <p class="subtitle">Bike Haus Freiburg – bikehausfreiburg.com</p>
        </div>
      </header>

      <div class="container legal-body">
        <article class="legal-content">
          <section>
            <h2>1. Verantwortliche Stelle</h2>
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist:
            </p>
            <address>
              <strong>Bike Haus Freiburg</strong><br />
              Heckerstraße 27<br />
              79114 Freiburg im Breisgau<br />
              E-Mail:
              <a href="mailto:info&#64;bikehausfreiburg.com"
                >info&#64;bikehausfreiburg.com</a
              ><br />
              Website:
              <a
                href="https://bikehausfreiburg.com"
                target="_blank"
                rel="noopener"
                >bikehausfreiburg.com</a
              >
            </address>
          </section>

          <section>
            <h2>2. Erhebung und Speicherung personenbezogener Daten</h2>

            <h3>2.1 Beim Besuch der Website</h3>
            <p>
              Beim Aufrufen unserer Website werden durch den Browser automatisch
              Informationen an den Server gesendet. Diese umfassen:
            </p>
            <ul>
              <li>IP-Adresse des anfragenden Geräts</li>
              <li>Datum und Uhrzeit der Anfrage</li>
              <li>Name und URL der abgerufenen Datei</li>
              <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
              <li>Verwendeter Browser und ggf. das Betriebssystem</li>
            </ul>
            <p>
              Diese Daten werden zur Sicherstellung eines störungsfreien
              Verbindungsaufbaus, zur Systemsicherheit und für statistische
              Auswertungen verarbeitet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
              DSGVO (berechtigtes Interesse).
            </p>

            <h3>2.2 Bei Online-Käufen (Showroom)</h3>
            <p>
              Wenn Sie ein Fahrrad online kaufen, verarbeiten wir folgende
              Daten, die Sie im Bestellformular angeben:
            </p>
            <ul>
              <li>Vorname und Nachname</li>
              <li>E-Mail-Adresse</li>
              <li>Postanschrift</li>
              <li>Gewünschter Abholtag</li>
            </ul>
            <p>
              Diese Daten werden ausschließlich zur Vertragsabwicklung verwendet
              (Art. 6 Abs. 1 lit. b DSGVO). Nach vollständiger Abwicklung des
              Kaufs werden die Daten entsprechend den gesetzlichen
              Aufbewahrungsfristen gespeichert (in der Regel 10 Jahre gemäß HGB
              / AO) und anschließend gelöscht.
            </p>

            <h3>2.3 Zahlungsabwicklung (Mollie)</h3>
            <p>
              Für die Zahlungsabwicklung nutzen wir den Dienst
              <strong>Mollie B.V.</strong>
              (Keizersgracht 126, 1015 CW Amsterdam, Niederlande). Bei einer
              Zahlung werden die für die Transaktion erforderlichen Daten
              (Betrag, Beschreibung, Metadaten) an Mollie übermittelt. Mollie
              verarbeitet Ihre Zahlungsdaten gemäß seiner eigenen
              Datenschutzrichtlinie, einsehbar unter
              <a
                href="https://www.mollie.com/de/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.mollie.com/de/privacy </a
              >.
            </p>

            <h3>2.4 Kontaktaufnahme (WhatsApp / E-Mail)</h3>
            <p>
              Wenn Sie uns per E-Mail oder WhatsApp kontaktieren, verarbeiten
              wir Ihre Nachricht und die mitgeteilten personenbezogenen Daten
              (Name, Kontaktdaten) ausschließlich zur Bearbeitung Ihrer Anfrage.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO.
            </p>
          </section>

          <section>
            <h2>3. Cookies</h2>
            <p>
              Diese Website verwendet ausschließlich technisch notwendige
              Cookies, die für den Betrieb der Website erforderlich sind. Es
              werden keine Tracking- oder Marketing-Cookies eingesetzt.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </section>

          <section>
            <h2>4. Google Maps</h2>
            <p>
              Diese Website enthält einen Link zu Google Maps (Google Ireland
              Limited, Gordon House, Barrow Street, Dublin 4, Irland). Google
              Maps wird erst beim Anklicken des Links aufgerufen; dabei werden
              Daten an Google übermittelt. Weitere Informationen zum Datenschutz
              finden Sie unter
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                policies.google.com/privacy </a
              >.
            </p>
          </section>

          <section>
            <h2>5. Weitergabe von Daten an Dritte</h2>
            <p>
              Personenbezogene Daten werden nicht an Dritte weitergegeben, es
              sei denn:
            </p>
            <ul>
              <li>
                Sie haben ausdrücklich eingewilligt (Art. 6 Abs. 1 lit. a DSGVO)
              </li>
              <li>
                Die Weitergabe ist zur Vertragserfüllung erforderlich (z. B.
                Mollie für die Zahlung)
              </li>
              <li>
                Eine gesetzliche Verpflichtung besteht (Art. 6 Abs. 1 lit. c
                DSGVO)
              </li>
            </ul>
          </section>

          <section>
            <h2>6. Ihre Rechte</h2>
            <p>
              Sie haben gegenüber uns folgende Rechte hinsichtlich Ihrer
              personenbezogenen Daten:
            </p>
            <ul>
              <li><strong>Auskunftsrecht</strong> (Art. 15 DSGVO)</li>
              <li><strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO)</li>
              <li><strong>Recht auf Löschung</strong> (Art. 17 DSGVO)</li>
              <li>
                <strong>Recht auf Einschränkung der Verarbeitung</strong> (Art.
                18 DSGVO)
              </li>
              <li>
                <strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO)
              </li>
              <li><strong>Widerspruchsrecht</strong> (Art. 21 DSGVO)</li>
            </ul>
            <p>
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an:
              <a href="mailto:info&#64;bikehausfreiburg.com"
                >info&#64;bikehausfreiburg.com</a
              >
            </p>
            <p>
              Sie haben zudem das Recht, sich bei einer
              Datenschutz-Aufsichtsbehörde zu beschweren. Zuständig ist der
              Landesbeauftragte für den Datenschutz und die Informationsfreiheit
              Baden-Württemberg:
              <a
                href="https://www.baden-wuerttemberg.datenschutz.de"
                target="_blank"
                rel="noopener noreferrer"
                >www.baden-wuerttemberg.datenschutz.de</a
              >
            </p>
          </section>

          <section>
            <h2>7. Datensicherheit</h2>
            <p>
              Die Website verwendet eine SSL/TLS-Verschlüsselung (erkennbar am
              „https://" und dem Schloss-Symbol im Browser), um die Übertragung
              Ihrer Daten zu schützen.
            </p>
          </section>

          <section>
            <h2>8. Aktualität dieser Erklärung</h2>
            <p class="last-updated">
              Diese Datenschutzerklärung ist aktuell gültig und hat den Stand:
              <strong>Mai 2025</strong>.
            </p>
          </section>
        </article>
      </div>
    </div>
  `,
  styles: [
    `
      .legal-page {
        padding-bottom: 5rem;
        background: var(--color-bg);
      }

      .page-header {
        padding: 7rem 0 3rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        margin-bottom: 3rem;
        background:
          radial-gradient(
            circle at 20% 0%,
            rgba(255, 87, 34, 0.1),
            transparent 30%
          ),
          var(--color-bg);
      }

      .label {
        display: inline-block;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.15em;
        color: var(--color-accent);
        background: rgba(255, 87, 34, 0.1);
        border: 1px solid rgba(255, 87, 34, 0.2);
        padding: 0.3rem 0.85rem;
        border-radius: 999px;
        margin-bottom: 1rem;
      }

      h1 {
        font-size: clamp(1.8rem, 4vw, 2.8rem);
        font-weight: 800;
        color: var(--color-text);
        letter-spacing: -0.03em;
        margin: 0 0 0.5rem;
      }

      .subtitle {
        color: var(--color-text-secondary);
        font-size: 1rem;
        margin: 0;
      }

      .legal-body {
        max-width: 820px;
      }

      .legal-content section {
        margin-bottom: 2.5rem;
        padding-bottom: 2.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .legal-content section:last-child {
        border-bottom: none;
      }

      h2 {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0 0 1rem;
      }

      h3 {
        font-size: 0.97rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 1.25rem 0 0.5rem;
      }

      p {
        font-size: 0.93rem;
        line-height: 1.8;
        color: var(--color-text-secondary);
        margin: 0 0 0.9rem;
      }

      ul {
        padding-left: 1.4rem;
        margin-bottom: 0.9rem;
      }

      ul li {
        font-size: 0.93rem;
        line-height: 1.8;
        color: var(--color-text-secondary);
        margin-bottom: 0.2rem;
      }

      address {
        font-style: normal;
        font-size: 0.93rem;
        line-height: 1.8;
        color: var(--color-text-secondary);
        margin-bottom: 1rem;
        padding: 1rem 1.25rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 12px;
        display: inline-block;
      }

      a {
        color: var(--color-accent);
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      .last-updated {
        font-size: 0.85rem;
        color: var(--color-text-muted);
      }

      @media (max-width: 640px) {
        .page-header {
          padding: 5.5rem 0 2rem;
        }
      }
    `,
  ],
})
export class DatenschutzComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private translationService = inject(TranslationService);
  t = this.translationService.translations;

  ngOnInit(): void {
    this.titleService.setTitle('Datenschutzerklärung — Bike Haus Freiburg');
    this.metaService.updateTag({
      name: 'description',
      content:
        'Datenschutzerklärung von Bike Haus Freiburg. Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO.',
    });
  }
}
