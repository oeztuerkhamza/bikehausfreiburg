import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-datenschutz',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-page">
      <header class="page-header">
        <div class="container">
          <span class="label">LEGAL</span>
          <h1>{{ t().privacy }}</h1>
        </div>
      </header>

      <div class="container legal-body">
        <article class="legal-content">
          <section>
            <h2>1. Datenschutz auf einen Blick</h2>
            <h3>Allgemeine Hinweise</h3>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber,
              was mit Ihren personenbezogenen Daten passiert, wenn Sie diese
              Website besuchen. Personenbezogene Daten sind alle Daten, mit
              denen Sie persönlich identifiziert werden können. Ausführliche
              Informationen zum Thema Datenschutz entnehmen Sie unserer
              nachfolgend aufgeführten Datenschutzerklärung.
            </p>

            <h3>Datenerfassung auf dieser Website</h3>
            <p>
              <strong
                >Wer ist verantwortlich für die Datenerfassung auf dieser
                Website?</strong
              ><br />
              Die Datenverarbeitung auf dieser Website erfolgt durch den
              Websitebetreiber:
            </p>
            <p>
              Bike Haus Freiburg<br />
              Heckerstraße 27<br />
              79114 Freiburg im Breisgau<br />
              E-Mail: bikehausfreiburg&#64;gmail.com
            </p>
          </section>

          <section>
            <h2>2. Hosting</h2>
            <p>
              Wir hosten die Inhalte unserer Website bei folgendem Anbieter. Die
              personenbezogenen Daten, die auf dieser Website erfasst werden,
              werden auf den Servern des Hosters gespeichert. Hierbei kann es
              sich v. a. um IP-Adressen, Kontaktanfragen, Meta- und
              Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen,
              Websitezugriffe und sonstige Daten, die über eine Website
              generiert werden, handeln.
            </p>
            <p>
              Der Einsatz des Hosters erfolgt im Interesse einer sicheren,
              schnellen und effizienten Bereitstellung unseres Online-Angebots
              durch einen professionellen Anbieter (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
          </section>

          <section>
            <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
            <h3>Datenschutz</h3>
            <p>
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen
              Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten
              vertraulich und entsprechend den gesetzlichen
              Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>
            <p>
              Wenn Sie diese Website benutzen, werden verschiedene
              personenbezogene Daten erhoben. Personenbezogene Daten sind Daten,
              mit denen Sie persönlich identifiziert werden können. Die
              vorliegende Datenschutzerklärung erläutert, welche Daten wir
              erheben und wofür wir sie nutzen. Sie erläutert auch, wie und zu
              welchem Zweck das geschieht.
            </p>
            <p>
              Wir weisen darauf hin, dass die Datenübertragung im Internet (z.
              B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen
              kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch
              Dritte ist nicht möglich.
            </p>

            <h3>Hinweis zur verantwortlichen Stelle</h3>
            <p>
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser
              Website ist:
            </p>
            <p>
              Bike Haus Freiburg<br />
              Heckerstraße 27<br />
              79114 Freiburg im Breisgau<br />
              E-Mail: bikehausfreiburg&#64;gmail.com<br />
              WhatsApp: +49 155 6630 0011
            </p>
            <p>
              Verantwortliche Stelle ist die natürliche oder juristische Person,
              die allein oder gemeinsam mit anderen über die Zwecke und Mittel
              der Verarbeitung von personenbezogenen Daten (z. B. Namen,
              E-Mail-Adressen o. Ä.) entscheidet.
            </p>

            <h3>Speicherdauer</h3>
            <p>
              Soweit innerhalb dieser Datenschutzerklärung keine speziellere
              Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen
              Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt.
              Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine
              Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten
              gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für
              die Speicherung Ihrer personenbezogenen Daten haben.
            </p>

            <h3>Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
            <p>
              Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen
              Einwilligung möglich. Sie können eine bereits erteilte
              Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum
              Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf
              unberührt.
            </p>

            <h3>Recht auf Datenübertragbarkeit</h3>
            <p>
              Sie haben das Recht, Daten, die wir auf Grundlage Ihrer
              Einwilligung oder in Erfüllung eines Vertrags automatisiert
              verarbeiten, an sich oder an einen Dritten in einem gängigen,
              maschinenlesbaren Format aushändigen zu lassen. Sofern Sie die
              direkte Übertragung der Daten an einen anderen Verantwortlichen
              verlangen, erfolgt dies nur, soweit es technisch machbar ist.
            </p>

            <h3>Auskunft, Löschung und Berichtigung</h3>
            <p>
              Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen
              jederzeit das Recht auf unentgeltliche Auskunft über Ihre
              gespeicherten personenbezogenen Daten, deren Herkunft und
              Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht
              auf Berichtigung oder Löschung dieser Daten. Hierzu sowie zu
              weiteren Fragen zum Thema personenbezogene Daten können Sie sich
              jederzeit an uns wenden.
            </p>
          </section>

          <section>
            <h2>4. Datenerfassung auf dieser Website</h2>
            <h3>Server-Log-Dateien</h3>
            <p>
              Der Provider der Seiten erhebt und speichert automatisch
              Informationen in so genannten Server-Log-Dateien, die Ihr Browser
              automatisch an uns übermittelt. Dies sind:
            </p>
            <ul>
              <li>Browsertyp und Browserversion</li>
              <li>verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse</li>
            </ul>
            <p>
              Eine Zusammenführung dieser Daten mit anderen Datenquellen wird
              nicht vorgenommen. Die Erfassung dieser Daten erfolgt auf
              Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
            </p>

            <h3>Lokale Speicherung (LocalStorage)</h3>
            <p>
              Diese Website verwendet den lokalen Speicher (LocalStorage) Ihres
              Browsers, um Ihre Spracheinstellung zu speichern. Dabei werden
              keine personenbezogenen Daten an unsere Server übertragen. Die
              Daten verbleiben ausschließlich in Ihrem Browser.
            </p>
          </section>

          <section>
            <h2>5. Externe Dienste</h2>
            <h3>Google Maps</h3>
            <p>
              Diese Seite nutzt den Kartendienst Google Maps. Anbieter ist die
              Google Ireland Limited („Google"), Gordon House, Barrow Street,
              Dublin 4, Irland. Beim Laden der Karte werden Daten an
              Google-Server übertragen. Weitere Informationen finden Sie in der
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener"
              >
                Google Datenschutzerklärung </a
              >.
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

      .legal-content h3 {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--color-text);
        margin: 1.25rem 0 0.5rem;
      }

      .legal-content h3:first-child {
        margin-top: 0;
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

      .legal-content ul {
        padding-left: 1.5rem;
        margin: 0.5rem 0 1rem;
      }

      .legal-content li {
        font-size: 0.92rem;
        color: var(--color-text-secondary);
        line-height: 1.75;
        margin-bottom: 0.25rem;
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
export class DatenschutzComponent {
  private translationService = inject(TranslationService);
  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;
}
