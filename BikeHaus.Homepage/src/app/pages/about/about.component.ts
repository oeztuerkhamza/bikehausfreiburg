import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { PublicShopInfo } from '../../models/models';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="about-page">
      <!-- Header -->
      <header class="page-header">
        <div class="container">
          <span class="label">{{ t().aboutLabel }}</span>
          <h1>{{ t().aboutTitle }}</h1>
        </div>
      </header>

      <div class="container about-body">
        <!-- Hero Intro -->
        <section class="hero-intro">
          <div class="intro-content">
            <div class="intro-badge">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                />
              </svg>
              <span>Familienbetrieb seit 2021</span>
            </div>
            <h2 class="intro-headline">
              Mehr als nur Fahrräder.<br /><span class="accent"
                >Eine Leidenschaft.</span
              >
            </h2>
            <p class="intro-text">
              Was als bescheidene Idee begann, ist heute ein Ort geworden, an
              dem Menschen aller Altersgruppen ihr perfektes Fahrrad finden. Als
              kleines Familienunternehmen in Freiburg glauben wir daran, dass
              jedes Rad eine Geschichte erzählt — und jeder Mensch die Freiheit
              verdient, seine eigene Geschichte auf zwei Rädern zu schreiben.
            </p>
            <div class="intro-features">
              <div class="feature-item">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Rechnung & Kaufvertrag</span>
              </div>
              <div class="feature-item">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
                <span>Persönliche Beratung</span>
              </div>
              <div class="feature-item">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Vertrauen & Qualität</span>
              </div>
            </div>
          </div>
          <div class="intro-visual">
            <div class="visual-card">
              <div class="year-badge">2021</div>
              <div class="visual-content">
                <p class="visual-quote">
                  "Jedes Fahrrad, das wir verkaufen, bringt Freude — und das ist
                  der schönste Lohn."
                </p>
                <span class="visual-author"
                  >— Die Familie hinter Bike Haus</span
                >
              </div>
            </div>
          </div>
        </section>

        <!-- Mission Quote -->
        <section class="mission-section">
          <blockquote class="mission-quote">
            <svg
              class="quote-icon"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"
              />
            </svg>
            <p>{{ t().aboutMission }}</p>
          </blockquote>
        </section>

        <!-- Story Values -->
        <section class="story-section">
          <div class="story-values-grid">
            <div class="sv-card">
              <span class="sv-num">01</span>
              <h3>{{ t().storyValue1Title }}</h3>
              <p>{{ t().storyValue1Desc }}</p>
            </div>
            <div class="sv-card">
              <span class="sv-num">02</span>
              <h3>{{ t().storyValue2Title }}</h3>
              <p>{{ t().storyValue2Desc }}</p>
            </div>
            <div class="sv-card">
              <span class="sv-num">03</span>
              <h3>{{ t().storyValue3Title }}</h3>
              <p>{{ t().storyValue3Desc }}</p>
            </div>
          </div>
        </section>

        <!-- ── Brands Section ── -->
        <section class="brands-section">
          <div class="brands-header">
            <span class="section-label">MARKEN</span>
            <h2>Unsere Marken — Neu &amp; Gebraucht</h2>
            <p class="brands-intro">
              In unserem Geschäft bieten wir eine sorgfältig ausgewählte Auswahl
              an Fahrrädern an. Bitte beachten Sie: Wir sind kein offizieller
              Händler aller Marken, verkaufen jedoch Fahrräder, die wir über
              legale Quellen beziehen.
            </p>
          </div>

          <div class="brands-grid">
            <!-- New Bikes -->
            <div class="brand-card new">
              <div class="brand-card-header">
                <div class="brand-icon">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                </div>
                <h3>Neue Fahrräder</h3>
              </div>
              <ul class="brand-list">
                <li>
                  <strong>Victoria</strong>
                  <span>Robuste und elegante Cityräder</span>
                </li>
                <li>
                  <strong>Conway</strong>
                  <span
                    >Zuverlässige Leistung bei Mountain- und Stadträdern</span
                  >
                </li>
                <li>
                  <strong>Bikestar</strong>
                  <span>Kinder- und Jugendräder</span>
                </li>
                <li>
                  <strong>Pyro</strong>
                  <span>Leichte und schnelle Sportfahrräder</span>
                </li>
                <li>
                  <strong>Xtract</strong>
                  <span>Funktionale und preiswerte Modelle</span>
                </li>
              </ul>
            </div>

            <!-- Used Bikes -->
            <div class="brand-card used">
              <div class="brand-card-header">
                <div class="brand-icon">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <h3>Gebrauchte Fahrräder</h3>
              </div>
              <p class="brand-desc">
                Wir führen gebrauchte Fahrräder bekannter Marken. Diese
                Fahrräder stammen direkt von Privatpersonen oder aus anderen
                legalen Quellen.
              </p>
              <div class="brand-tags">
                <span class="brand-tag" *ngFor="let brand of usedBrands">{{
                  brand
                }}</span>
                <span class="brand-tag more">und viele weitere</span>
              </div>
            </div>
          </div>

          <div class="brands-note">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p>
              <strong>Hinweis:</strong> Wir verwenden die Markennamen zur
              Beschreibung der Produkte. Offizielle Garantie oder
              Serviceleistungen der Markenhersteller können wir ohne
              autorisierte Partnerschaft nicht anbieten.
            </p>
          </div>
        </section>

        <!-- Info Cards -->
        <section class="info-section" *ngIf="shopInfo()">
          <div class="info-grid">
            <div class="info-card">
              <div class="info-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3>{{ t().openingHours }}</h3>
              <div class="hours-table">
                <div class="hour-row">
                  <span>Montag</span><span>11:00 – 17:00</span>
                </div>
                <div class="hour-row">
                  <span>Dienstag</span><span>11:00 – 17:00</span>
                </div>
                <div class="hour-row closed">
                  <span>Mittwoch</span><span>Geschlossen</span>
                </div>
                <div class="hour-row">
                  <span>Donnerstag</span><span>11:00 – 17:00</span>
                </div>
                <div class="hour-row">
                  <span>Freitag</span><span>14:00 – 18:00</span>
                </div>
                <div class="hour-row">
                  <span>Samstag</span><span>11:30 – 17:00</span>
                </div>
                <div class="hour-row closed">
                  <span>Sonntag</span><span>Ruhetag</span>
                </div>
              </div>
            </div>

            <div class="info-card">
              <div class="info-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3>{{ t().findUs }}</h3>
              <p class="address-line">Heckerstraße 27</p>
              <p class="address-line">79114 Freiburg im Breisgau</p>
              <p class="address-line">Stadtteil Haslach</p>
              <p class="address-line muted">Deutschland</p>
              <a
                href="https://maps.google.com/?q=Heckerstra%C3%9Fe+27+Freiburg+im+Breisgau"
                target="_blank"
                rel="noopener"
                class="map-link"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                  />
                </svg>
                Google Maps öffnen
              </a>
            </div>

            <div class="info-card">
              <div class="info-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </div>
              <h3>{{ t().ourShowroom }}</h3>
              <p class="stat-highlight">
                {{ shopInfo()!.totalActiveListings }} {{ t().bikesAvailable }}
              </p>
              <a [routerLink]="['/' + lang(), 'showroom']" class="inline-link">
                {{ t().viewAll }}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <!-- CTA -->
        <section class="about-cta">
          <a [routerLink]="['/' + lang(), 'showroom']" class="btn-primary">
            {{ t().ctaPrimary }}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </section>
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

      .about-body {
        padding-top: 3rem;
        padding-bottom: 4rem;
      }

      /* ── Hero Intro ── */
      .hero-intro {
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: 3rem;
        align-items: center;
        margin-bottom: 4rem;
      }

      .intro-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: rgba(255, 87, 34, 0.1);
        border: 1px solid rgba(255, 87, 34, 0.2);
        border-radius: 50px;
        color: var(--color-accent);
        font-size: 0.82rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
      }

      .intro-badge svg {
        color: var(--color-accent);
      }

      .intro-headline {
        font-size: clamp(1.75rem, 4vw, 2.5rem);
        font-weight: 800;
        color: var(--color-text);
        line-height: 1.2;
        letter-spacing: -0.02em;
        margin: 0 0 1.5rem;
      }

      .intro-headline .accent {
        color: var(--color-accent);
      }

      .intro-text {
        font-size: 1.05rem;
        line-height: 1.85;
        color: var(--color-text-secondary);
        margin: 0 0 2rem;
        max-width: 560px;
      }

      .intro-features {
        display: flex;
        flex-wrap: wrap;
        gap: 1.25rem;
      }

      .feature-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--color-text);
        font-size: 0.9rem;
        font-weight: 500;
      }

      .feature-item svg {
        color: var(--color-accent);
      }

      .intro-visual {
        position: relative;
      }

      .visual-card {
        position: relative;
        background: linear-gradient(
          135deg,
          var(--color-surface) 0%,
          rgba(255, 87, 34, 0.05) 100%
        );
        border: 1px solid var(--color-border);
        border-radius: 20px;
        padding: 2.5rem 2rem;
        overflow: hidden;
      }

      .visual-card::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(
          circle,
          rgba(255, 87, 34, 0.08) 0%,
          transparent 50%
        );
        pointer-events: none;
      }

      .year-badge {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        font-size: 3rem;
        font-weight: 900;
        color: rgba(255, 87, 34, 0.15);
        letter-spacing: -0.05em;
        line-height: 1;
      }

      .visual-content {
        position: relative;
        z-index: 1;
      }

      .visual-quote {
        font-size: 1.1rem;
        font-weight: 500;
        font-style: italic;
        color: var(--color-text);
        line-height: 1.7;
        margin: 0 0 1.5rem;
      }

      .visual-author {
        font-size: 0.85rem;
        color: var(--color-accent);
        font-weight: 600;
      }

      /* ── Mission Section ── */
      .mission-section {
        margin-bottom: 4rem;
        padding: 2.5rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 20px;
      }

      .mission-quote {
        position: relative;
        padding-left: 3.5rem;
        margin: 0;
        border: none;
      }

      .quote-icon {
        position: absolute;
        left: 0;
        top: 0;
        color: var(--color-accent);
        opacity: 0.4;
      }

      .mission-quote p {
        font-size: 1.15rem;
        font-weight: 500;
        color: var(--color-text);
        line-height: 1.8;
        font-style: italic;
        margin: 0;
      }

      /* Intro (old - keep for fallback) */
      .intro-section {
        max-width: 720px;
        margin-bottom: 3.5rem;
      }

      .lead {
        font-size: 1.1rem;
        line-height: 1.85;
        color: var(--color-text-secondary);
        margin: 0 0 2rem;
      }

      /* Story Values */
      .story-values-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        margin-bottom: 3.5rem;
      }

      .sv-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 2rem 1.5rem;
        transition: border-color 0.3s;
      }

      .sv-card:hover {
        border-color: var(--color-accent);
      }

      .sv-num {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--color-accent);
        line-height: 1;
        display: block;
        margin-bottom: 1rem;
      }

      .sv-card h3 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0 0 0.5rem;
      }

      .sv-card p {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
        margin: 0;
      }

      /* ── Brands ── */
      .brands-section {
        margin-bottom: 3.5rem;
      }

      .brands-header {
        margin-bottom: 2rem;
      }

      .brands-header .section-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--color-accent);
        margin-bottom: 0.75rem;
      }

      .brands-header h2 {
        font-size: clamp(1.35rem, 3vw, 1.75rem);
        font-weight: 800;
        color: var(--color-text);
        margin: 0 0 0.75rem;
        letter-spacing: -0.02em;
      }

      .brands-intro {
        font-size: 0.95rem;
        color: var(--color-text-secondary);
        line-height: 1.7;
        max-width: 680px;
        margin: 0;
      }

      .brands-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .brand-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 2rem;
      }

      .brand-card-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
      }

      .brand-icon {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: rgba(255, 87, 34, 0.1);
        color: var(--color-accent);
      }

      .brand-card-header h3 {
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0;
      }

      .brand-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .brand-list li {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--color-border);
      }

      .brand-list li:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }

      .brand-list strong {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--color-text);
      }

      .brand-list span {
        font-size: 0.82rem;
        color: var(--color-text-secondary);
      }

      .brand-desc {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
        margin: 0 0 1.25rem;
      }

      .brand-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }

      .brand-tag {
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 0.35rem 0.75rem;
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--color-text);
      }

      .brand-tag.more {
        background: transparent;
        border-color: transparent;
        color: var(--color-text-muted);
        font-weight: 500;
        font-style: italic;
      }

      .brands-note {
        display: flex;
        gap: 0.6rem;
        align-items: flex-start;
        padding: 1rem 1.25rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 12px;
      }

      .brands-note svg {
        flex-shrink: 0;
        margin-top: 2px;
        color: var(--color-text-muted);
      }

      .brands-note p {
        font-size: 0.82rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
        margin: 0;
      }

      .brands-note strong {
        color: var(--color-text);
      }

      /* ── Info Cards ── */
      .info-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        margin-bottom: 3rem;
      }

      .info-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 16px;
        padding: 2rem 1.5rem;
      }

      .info-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(255, 87, 34, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
        color: var(--color-accent);
      }

      .info-card h3 {
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-secondary);
        margin: 0 0 0.75rem;
      }

      .info-card p,
      .address-line {
        color: var(--color-text);
        line-height: 1.6;
        margin: 0 0 0.2rem;
        font-size: 0.95rem;
      }

      .address-line.muted {
        color: var(--color-text-secondary);
      }

      .map-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        margin-top: 0.75rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-accent);
        text-decoration: none;
        transition: opacity 0.2s;
      }

      .map-link:hover {
        opacity: 0.8;
      }

      .inline-link {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        margin-top: 0.5rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-accent);
        text-decoration: none;
        transition: gap 0.2s;
      }

      .inline-link:hover {
        gap: 0.55rem;
      }

      .stat-highlight {
        font-size: 1.25rem !important;
        font-weight: 700;
        color: var(--color-accent) !important;
      }

      /* Hours Table */
      .hours-table {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .hour-row {
        display: flex;
        justify-content: space-between;
        padding: 0.4rem 0;
        font-size: 0.9rem;
        border-bottom: 1px solid var(--color-border);
      }

      .hour-row:last-child {
        border-bottom: none;
      }

      .hour-row span:first-child {
        font-weight: 500;
        color: var(--color-text);
      }

      .hour-row span:last-child {
        color: var(--color-text-secondary);
        font-weight: 500;
      }

      .hour-row.closed span:last-child {
        color: var(--color-text-muted);
      }

      /* CTA */
      .about-cta {
        text-align: center;
      }

      .about-cta .btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
      }

      @media (max-width: 900px) {
        .hero-intro {
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .intro-visual {
          order: -1;
        }

        .visual-card {
          max-width: 400px;
        }
      }

      @media (max-width: 768px) {
        .page-header {
          padding: 6rem 0 2rem;
        }

        .hero-intro {
          margin-bottom: 3rem;
        }

        .intro-headline {
          font-size: 1.5rem;
        }

        .intro-features {
          flex-direction: column;
          gap: 0.75rem;
        }

        .mission-section {
          padding: 1.5rem;
        }

        .mission-quote {
          padding-left: 2.5rem;
        }

        .quote-icon {
          width: 24px;
          height: 24px;
        }

        .story-values-grid {
          grid-template-columns: 1fr;
        }
        .brands-grid {
          grid-template-columns: 1fr;
        }
        .info-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AboutComponent implements OnInit {
  private translationService = inject(TranslationService);
  private apiService = inject(ApiService);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;
  shopInfo = signal<PublicShopInfo | null>(null);

  usedBrands = [
    'Cube',
    'Ghost',
    'Bulls',
    'Naloo',
    'Woom',
    'Puky',
    'Scott',
    'Pegasus',
  ];

  ngOnInit(): void {
    this.apiService.getShopInfo().subscribe({
      next: (data) => this.shopInfo.set(data),
    });
  }
}
