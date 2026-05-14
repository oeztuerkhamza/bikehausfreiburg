import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-widerrufsbelehrung',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-page">
      <header class="page-header">
        <div class="container">
          <span class="label">RECHTLICHES</span>
          <h1>Fernabsatzvertrag</h1>
          <p class="subtitle">
            inkl. Widerrufsbelehrung – Bike Haus Freiburg Online-Fahrradverkauf
          </p>
        </div>
      </header>

      <div class="container legal-body">
        <article class="legal-content">
          <section>
            <h2>1. Vertragsparteien und Vertragsschluss</h2>
            <p>Anbieter und Verkäufer ist:</p>
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
            <p>
              Der Kaufvertrag kommt zustande, sobald der Käufer den
              Bestellvorgang auf der Website abschließt, den Zahlungsvorgang
              über den Zahlungsdienstleister Mollie B.V. erfolgreich durchführt
              und die Zahlung beim Verkäufer eingegangen ist. Eine automatische
              Bestätigungs-E-Mail wird an die angegebene E-Mail-Adresse
              versandt.
            </p>
          </section>

          <section>
            <h2>2. Kaufgegenstand</h2>
            <p>
              Gegenstand des Vertrags sind gebrauchte Fahrräder, die auf der
              Website
              <a
                href="https://bikehausfreiburg.com"
                target="_blank"
                rel="noopener"
                >bikehausfreiburg.com</a
              >
              im Showroom angeboten werden. Jedes Fahrrad wird mit individueller
              Beschreibung, Fotos und Preisangabe dargestellt.
            </p>
            <p>
              Der angegebene Preis in Euro (€) ist der Endpreis inklusive der
              gesetzlichen Umsatzsteuer (sofern zutreffend) und sonstiger
              Preisbestandteile.
            </p>
          </section>

          <section>
            <h2>3. Zahlung</h2>
            <p>
              Die Zahlung erfolgt ausschließlich über den Zahlungsdienstleister
              <strong>Mollie B.V.</strong> (Keizersgracht 126, 1015 CW
              Amsterdam, Niederlande). Es werden gängige Zahlungsarten wie
              Kreditkarte, SEPA-Lastschrift, iDEAL, PayPal u. a. angeboten, je
              nach Verfügbarkeit im Checkout.
            </p>
            <p>
              Die Zahlung ist unmittelbar nach Abschluss des Bestellvorgangs
              fällig. Erst nach erfolgreicher Zahlung gilt der Kaufvertrag als
              abgeschlossen.
            </p>
          </section>

          <section>
            <h2>4. Übergabe / Abholung</h2>
            <p>
              Das Fahrrad wird <strong>nicht versandt</strong>. Die Übergabe
              erfolgt ausschließlich durch persönliche Abholung im
              Ladengeschäft:
            </p>
            <address>
              Bike Haus Freiburg, Heckerstraße 27, 79114 Freiburg im Breisgau
            </address>
            <p>
              Der Käufer gibt beim Bestellvorgang einen gewünschten Abholtag an.
              Das Fahrrad wird ab dem vereinbarten Abholtag zur Abholung
              bereitgestellt. Bitte nehmen Sie bei Fragen telefonisch oder per
              E-Mail Kontakt auf, um den genauen Abholtag zu bestätigen.
            </p>
          </section>

          <section>
            <h2>5. Eigentumsvorbehalt</h2>
            <p>
              Das Fahrrad bleibt bis zur vollständigen Bezahlung des Kaufpreises
              Eigentum von Bike Haus Freiburg.
            </p>
          </section>

          <section>
            <h2>6. Zustand der Ware / Gewährleistung</h2>
            <p>
              Bike Haus Freiburg bietet sowohl gebrauchte als auch neue
              Fahrräder an. Zustand und etwaige Mängel gebrauchter Waren werden
              in der Produktbeschreibung und den Fotos so vollständig wie
              möglich dargestellt.
            </p>
            <p>Es gelten folgende Gewährleistungsfristen ab Übergabe:</p>
            <ul>
              <li>
                <strong>Gebrauchte Fahrräder:</strong> 3 Monate (gemäß § 476
                Abs. 2 BGB, verkürzte Frist für gebrauchte Sachen im
                B2C-Handel).
              </li>
              <li>
                <strong>Neue Fahrräder:</strong> 2 Jahre (gesetzliche
                Gewährleistungsfrist gemäß § 438 Abs. 1 Nr. 3 BGB).
              </li>
            </ul>
          </section>

          <section>
            <h2>7. Widerrufsbelehrung</h2>

            <div class="widerruf-box">
              <h3>Widerrufsrecht</h3>
              <p>
                Sie haben das Recht, binnen <strong>vierzehn Tagen</strong> ohne
                Angabe von Gründen diesen Vertrag zu widerrufen.
              </p>
              <p>
                Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie
                oder ein von Ihnen benannter Dritter, der nicht der Beförderer
                ist, die Waren in Besitz genommen haben bzw. hat.
              </p>
              <p>
                Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (<strong
                  >Bike Haus Freiburg</strong
                >, Heckerstraße 27, 79108 Freiburg im Breisgau, E-Mail:
                <a href="mailto:info&#64;bikehausfreiburg.com"
                  >info&#64;bikehausfreiburg.com</a
                >) mittels einer eindeutigen Erklärung (z. B. ein mit der Post
                versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen
                Vertrag zu widerrufen, informieren. Sie können dafür das
                beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht
                vorgeschrieben ist.
              </p>
              <p>
                Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die
                Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der
                Widerrufsfrist absenden.
              </p>

              <h3>Folgen des Widerrufs</h3>
              <p>
                Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle
                Zahlungen, die wir von Ihnen erhalten haben, einschließlich der
                Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich
                daraus ergeben, dass Sie eine andere Art der Lieferung als die
                von uns angebotene, günstigste Standardlieferung gewählt haben),
                unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag
                zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses
                Vertrags bei uns eingegangen ist. Für diese Rückzahlung
                verwenden wir dasselbe Zahlungsmittel, das Sie bei der
                ursprünglichen Transaktion eingesetzt haben, es sei denn, mit
                Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem
                Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
              </p>
              <p>
                Wir können die Rückzahlung verweigern, bis wir die Waren wieder
                zurückerhalten haben oder bis Sie den Nachweis erbracht haben,
                dass Sie die Waren zurückgesandt haben, je nachdem, welches der
                frühere Zeitpunkt ist.
              </p>
              <p>
                Sie haben die Waren unverzüglich und in jedem Fall spätestens
                binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den
                Widerruf dieses Vertrags unterrichten, an uns zurückzusenden
                oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor
                Ablauf der Frist von vierzehn Tagen absenden.
              </p>
              <p>
                Da es sich um gebrauchte Waren handelt und die Übergabe
                persönlich im Ladengeschäft erfolgt, trägt der Käufer die
                unmittelbaren Kosten der Rücksendung.
              </p>
              <p>
                Sie müssen für einen etwaigen Wertverlust der Waren nur
                aufkommen, wenn dieser Wertverlust auf einen zur Prüfung der
                Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht
                notwendigen Umgang mit ihnen zurückzuführen ist.
              </p>
            </div>
          </section>

          <section>
            <h2>8. Muster-Widerrufsformular</h2>
            <div class="formular-box">
              <p>
                <em
                  >(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie
                  bitte dieses Formular aus und senden Sie es zurück.)</em
                >
              </p>
              <p>
                An:<br />
                Bike Haus Freiburg<br />
                Heckerstraße 27<br />
                79114 Freiburg im Breisgau<br />
                E-Mail: info&#64;bikehausfreiburg.com
              </p>
              <p>
                Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*)
                abgeschlossenen Vertrag über den Kauf der folgenden Waren (*):
              </p>
              <p>
                Bestellt am (*) / erhalten am (*):<br />
                Name des/der Verbraucher(s):<br />
                Anschrift des/der Verbraucher(s):<br />
                Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf
                Papier):<br />
                Datum:
              </p>
              <p><small>(*) Unzutreffendes streichen.</small></p>
            </div>
          </section>

          <section>
            <h2>9. Streitbeilegung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur
              Online-Streitbeilegung (OS) bereit:
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://ec.europa.eu/consumers/odr/ </a
              >.
            </p>
            <p>
              Wir sind weder bereit noch verpflichtet, an
              Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
              teilzunehmen.
            </p>
          </section>

          <section>
            <h2>10. Anwendbares Recht</h2>
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss
              des UN-Kaufrechts. Bei Verbrauchern gilt diese Rechtswahl nur
              insoweit, als dass dem Verbraucher keine zwingenden gesetzlichen
              Bestimmungen des Staates entzogen werden, in dem er seinen
              gewöhnlichen Aufenthalt hat.
            </p>
            <p class="last-updated">Stand: Mai 2025</p>
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
        margin: 1.25rem 0 0.6rem;
      }

      p {
        font-size: 0.93rem;
        line-height: 1.8;
        color: var(--color-text-secondary);
        margin: 0 0 0.9rem;
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

      .widerruf-box {
        background: rgba(255, 87, 34, 0.05);
        border: 1px solid rgba(255, 87, 34, 0.15);
        border-radius: 16px;
        padding: 1.5rem 1.75rem;
        margin-top: 0.5rem;
      }

      .formular-box {
        background: rgba(255, 255, 255, 0.03);
        border: 1px dashed rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        padding: 1.5rem 1.75rem;
        margin-top: 0.5rem;
      }

      .formular-box p {
        margin-bottom: 0.75rem;
      }

      .last-updated {
        font-size: 0.82rem;
        color: var(--color-text-muted);
        margin-top: 1rem;
      }

      small {
        font-size: 0.8rem;
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
export class WiderrufsbelehrungComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit(): void {
    this.titleService.setTitle('Fernabsatzvertrag — Bike Haus Freiburg');
    this.metaService.updateTag({
      name: 'description',
      content:
        'Fernabsatzvertrag und Widerrufsbelehrung für den Online-Kauf gebrauchter Fahrräder bei Bike Haus Freiburg.',
    });
  }
}
