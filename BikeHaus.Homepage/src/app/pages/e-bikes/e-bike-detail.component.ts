import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { EBike, PublicShopInfo } from '../../models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-e-bike-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Loading -->
    <div *ngIf="loading()" class="loading-wrap">
      <div class="container">
        <div class="sk-layout">
          <div class="sk-gallery"><div class="sk-main-img"></div></div>
          <div class="sk-details">
            <div class="sk-line w30"></div>
            <div class="sk-line w90"></div>
            <div class="sk-line w50"></div>
            <div class="sk-line w70"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-page" *ngIf="!loading()">
      <!-- Breadcrumb -->
      <nav class="breadcrumb-bar">
        <div class="container">
          <a [routerLink]="['/' + lang(), 'e-bikes']" class="back-link">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>{{ t().eBikesBackToList }}</span>
          </a>
        </div>
      </nav>

      <div class="container" *ngIf="bike()">
        <article class="detail-layout">
          <!-- ── LEFT: Gallery ── -->
          <div class="gallery-col">
            <figure class="main-image-wrap">
              <img
                *ngIf="bike()!.images.length > 0"
                [src]="getImageUrl(bike()!.images[selectedImage()].filePath)"
                [alt]="bike()!.titel"
                class="main-img"
                (error)="onImageError($event)"
              />
              <div *ngIf="bike()!.images.length === 0" class="no-image">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-text-muted)"
                  stroke-width="1"
                >
                  <circle cx="5.5" cy="17.5" r="3.5" />
                  <circle cx="18.5" cy="17.5" r="3.5" />
                  <path d="M15 6l-4 8h6l-2 3.5" />
                  <path d="M5.5 17.5L9 9h3" />
                </svg>
              </div>

              <!-- Nav Arrows -->
              <button
                *ngIf="bike()!.images.length > 1"
                class="g-nav g-prev"
                (click)="prevImage()"
                aria-label="Previous"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                *ngIf="bike()!.images.length > 1"
                class="g-nav g-next"
                (click)="nextImage()"
                aria-label="Next"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <!-- Counter -->
              <span class="img-counter" *ngIf="bike()!.images.length > 1">
                {{ selectedImage() + 1 }} / {{ bike()!.images.length }}
              </span>
            </figure>

            <!-- Thumbnail Strip -->
            <div class="thumb-strip" *ngIf="bike()!.images.length > 1">
              <button
                *ngFor="let img of bike()!.images; let i = index"
                class="thumb"
                [class.active]="selectedImage() === i"
                (click)="selectedImage.set(i)"
              >
                <img [src]="getImageUrl(img.filePath)" [alt]="bike()!.titel + ' — Bild ' + (i + 1)" loading="lazy" />
              </button>
            </div>
          </div>

          <!-- ── RIGHT: Details ── -->
          <aside class="details-col">
            <div class="details-inner">
              <!-- Badges -->
              <div class="badge-row">
                <span class="condition-badge is-ebike">⚡ E-Bike</span>
                <span *ngIf="displayCategory()" class="cat-badge">{{
                  displayCategory()
                }}</span>
              </div>

              <!-- Title -->
              <h1 class="title">{{ bike()!.titel }}</h1>

              <!-- Price -->
              <div
                class="price-card"
                *ngIf="bike()!.preisText || bike()!.preis"
              >
                <ng-container *ngIf="bike()!.angebot && bike()!.angebot! > 0; else normalDetailPrice">
                  <span class="price-old">{{ bike()!.preis | number: '1.0-0' }} €</span>
                  <span class="price-value price-sale">{{ bike()!.preis - bike()!.angebot! | number: '1.0-0' }} €</span>
                  <span class="price-save">Sie sparen {{ bike()!.angebot | number: '1.0-0' }} €</span>
                </ng-container>
                <ng-template #normalDetailPrice>
                  <span class="price-value">{{
                    bike()!.preisText || (bike()!.preis | number: '1.0-0') + ' €'
                  }}</span>
                </ng-template>
              </div>

              <!-- Specs -->
              <div class="meta-list">
                <div *ngIf="bike()!.marke" class="meta-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-accent)"
                    stroke-width="2"
                  >
                    <path
                      d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"
                    />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  <span
                    ><strong>{{ t().neueFahrraederBrand }}:</strong>
                    {{ bike()!.marke }}</span
                  >
                </div>
                <div *ngIf="bike()!.modell" class="meta-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-accent)"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span
                    ><strong>{{ t().neueFahrraederModel }}:</strong>
                    {{ bike()!.modell }}</span
                  >
                </div>

                <!-- ── E-Bike specific specs ── -->
                <div *ngIf="bike()!.motorMarke" class="meta-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-success)"
                    stroke-width="2"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  <span
                    ><strong>{{ t().eBikeMotorBrand }}:</strong>
                    {{ bike()!.motorMarke }}</span
                  >
                </div>
                <div *ngIf="bike()!.motorPosition" class="meta-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-success)"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
                  </svg>
                  <span
                    ><strong>{{ t().eBikeMotorPosition }}:</strong>
                    {{ bike()!.motorPosition }}</span
                  >
                </div>
                <div *ngIf="bike()!.akkuKapazitaetWh" class="meta-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-success)"
                    stroke-width="2"
                  >
                    <rect x="2" y="7" width="16" height="10" rx="2" />
                    <line x1="22" y1="11" x2="22" y2="13" />
                  </svg>
                  <span
                    ><strong>{{ t().eBikeBatteryCapacity }}:</strong>
                    {{ bike()!.akkuKapazitaetWh }} Wh</span
                  >
                </div>
                <div *ngIf="bike()!.reichweiteKm" class="meta-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-success)"
                    stroke-width="2"
                  >
                    <path d="M3 12h18M12 3v18" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  <span
                    ><strong>{{ t().eBikeRange }}:</strong>
                    {{ bike()!.reichweiteKm }} km</span
                  >
                </div>
                <div *ngIf="bike()!.motorLeistungNm" class="meta-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-success)"
                    stroke-width="2"
                  >
                    <path d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                  <span
                    ><strong>{{ t().eBikeTorque }}:</strong>
                    {{ bike()!.motorLeistungNm }} Nm</span
                  >
                </div>

                <div *ngIf="bike()!.farbe" class="meta-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-accent)"
                    stroke-width="2"
                  >
                    <circle cx="13.5" cy="6.5" r="2.5" />
                    <circle cx="6.5" cy="13.5" r="2.5" />
                    <circle cx="17.5" cy="17.5" r="2.5" />
                  </svg>
                  <span
                    ><strong>{{ t().neueFahrraederColor }}:</strong>
                    {{ bike()!.farbe }}</span
                  >
                </div>
                <div *ngIf="bike()!.rahmengroesse" class="meta-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-accent)"
                    stroke-width="2"
                  >
                    <path d="M21 3H3v18h18V3z" />
                    <path d="M3 9h18M3 15h18M9 3v18" />
                  </svg>
                  <span
                    ><strong>{{ t().neueFahrraederFrameSize }}:</strong>
                    {{ bike()!.rahmengroesse }}</span
                  >
                </div>
                <div *ngIf="bike()!.reifengroesse" class="meta-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-accent)"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  <span
                    ><strong>{{ t().neueFahrraederWheelSize }}:</strong>
                    {{ bike()!.reifengroesse }}</span
                  >
                </div>
                <div *ngIf="bike()!.gangschaltung" class="meta-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-accent)"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path
                      d="M12 1v6m0 6v6m5.66-14.66l-4.24 4.24m-2.84 2.84l-4.24 4.24m14.66 0l-4.24-4.24m-2.84-2.84l-4.24-4.24"
                    />
                  </svg>
                  <span
                    ><strong>{{ t().neueFahrraederGears }}:</strong>
                    {{ bike()!.gangschaltung }}</span
                  >
                </div>
                <div class="meta-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-accent)"
                    stroke-width="2"
                  >
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span
                    ><strong>{{ t().neueFahrraederCondition }}:</strong>
                    {{ bike()!.zustand }}</span
                  >
                </div>
                <div class="meta-row warranty-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-success)"
                    stroke-width="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span class="warranty-text">{{
                    t().neueFahrraederWarranty
                  }}</span>
                </div>
                <div class="meta-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-accent)"
                    stroke-width="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>{{ bike()!.images.length }} {{ t().photos }}</span>
                </div>
              </div>

              <!-- WhatsApp CTA -->
              <a
                [href]="whatsappUrl()"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-whatsapp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                  />
                </svg>
                {{ t().eBikesInterested }}
              </a>

              <!-- Google Maps -->
              <a
                href="https://maps.google.com/?q=Heckerstra%C3%9Fe+27+Freiburg+im+Breisgau"
                target="_blank"
                rel="noopener"
                class="btn-maps"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Google Maps
              </a>
            </div>
          </aside>
        </article>

        <!-- ── Description ── -->
        <section class="description-section" *ngIf="bike()!.beschreibung">
          <h2>{{ t().description }}</h2>
          <div
            class="desc-text"
            [innerHTML]="formatDescription(bike()!.beschreibung!)"
          ></div>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      /* ═══ BREADCRUMB ═══ */
      .breadcrumb-bar {
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        padding: 0.75rem 0;
        margin-top: 4.5rem;
      }
      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        transition: color 0.2s;
      }
      .back-link:hover {
        color: var(--color-accent);
      }

      /* ═══ LAYOUT ═══ */
      .container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 1.5rem;
      }
      .detail-layout {
        display: grid;
        grid-template-columns: 1.3fr 1fr;
        gap: 3rem;
        padding: 2.5rem 0 3rem;
      }

      /* ═══ GALLERY ═══ */
      .main-image-wrap {
        position: relative;
        border-radius: var(--border-radius-lg);
        overflow: hidden;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        margin: 0;
      }
      .main-img {
        width: 100%;
        aspect-ratio: 4/3;
        object-fit: contain;
        display: block;
        background: #0a0a0a;
      }
      .no-image {
        aspect-ratio: 4/3;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-bg-secondary);
      }
      .g-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.6);
        border: none;
        color: #fff;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s;
      }
      .g-nav:hover {
        background: var(--color-accent);
      }
      .g-prev {
        left: 0.75rem;
      }
      .g-next {
        right: 0.75rem;
      }
      .img-counter {
        position: absolute;
        bottom: 0.75rem;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: #fff;
        font-size: 0.75rem;
        padding: 0.25rem 0.75rem;
        border-radius: 50px;
      }
      .thumb-strip {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.75rem;
        overflow-x: auto;
        padding-bottom: 0.5rem;
      }
      .thumb {
        flex-shrink: 0;
        width: 70px;
        height: 52px;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid transparent;
        cursor: pointer;
        background: var(--color-surface);
        transition: border-color 0.2s;
        padding: 0;
      }
      .thumb.active {
        border-color: var(--color-accent);
      }
      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      /* ═══ DETAILS ═══ */
      .details-inner {
        position: sticky;
        top: 5.5rem;
      }
      .badge-row {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }
      .condition-badge,
      .cat-badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.3rem 0.75rem;
        border-radius: 50px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .condition-badge {
        background: rgba(120, 120, 120, 0.2);
        color: var(--color-text-secondary);
      }
      .condition-badge.is-ebike {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
      }
      .cat-badge {
        background: rgba(255, 87, 34, 0.1);
        color: var(--color-accent);
      }
      .title {
        font-size: clamp(1.3rem, 3vw, 1.7rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        margin: 0 0 1rem;
        line-height: 1.3;
      }
      .price-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius);
        padding: 1rem 1.25rem;
        margin-bottom: 1.25rem;
      }
      .price-value {
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--color-accent);
        letter-spacing: -0.02em;
      }
      .price-value.price-sale {
        color: #ef4444;
      }
      .price-old {
        text-decoration: line-through;
        color: var(--color-text-muted);
        font-size: 1.1rem;
        font-weight: 500;
        margin-right: 10px;
      }
      .price-save {
        display: block;
        margin-top: 4px;
        font-size: 0.85rem;
        font-weight: 600;
        color: #10b981;
      }
      .meta-list {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        margin-bottom: 1.5rem;
      }
      .meta-row {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        font-size: 0.88rem;
        color: var(--color-text-secondary);
      }
      .meta-row svg {
        flex-shrink: 0;
      }
      .meta-row strong {
        color: var(--color-text);
        font-weight: 600;
      }
      .warranty-row {
        background: linear-gradient(
          135deg,
          rgba(34, 197, 94, 0.12),
          rgba(34, 197, 94, 0.06)
        );
        padding: 0.65rem 0.85rem;
        border-radius: 8px;
        border: 1px solid rgba(34, 197, 94, 0.25);
      }
      .warranty-text {
        color: var(--color-success);
        font-weight: 700;
      }

      /* ═══ CTAs ═══ */
      .btn-whatsapp {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        width: 100%;
        padding: 0.85rem 1.5rem;
        background: #25d366;
        color: #fff;
        font-size: 0.95rem;
        font-weight: 700;
        border: none;
        border-radius: var(--border-radius);
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s;
        margin-bottom: 0.75rem;
      }
      .btn-whatsapp:hover {
        background: #20bd5a;
        transform: translateY(-1px);
      }
      .btn-maps {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.7rem 1.25rem;
        background: transparent;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius);
        color: var(--color-text-secondary);
        font-size: 0.85rem;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-maps:hover {
        border-color: var(--color-accent);
        color: var(--color-accent);
      }

      /* ═══ DESCRIPTION ═══ */
      .description-section {
        border-top: 1px solid var(--color-border);
        padding: 2.5rem 0 4rem;
      }
      .description-section h2 {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 1rem;
      }
      .desc-text {
        font-size: 0.92rem;
        line-height: 1.7;
        color: var(--color-text-secondary);
        white-space: pre-line;
      }

      /* ═══ SKELETON ═══ */
      .loading-wrap {
        padding-top: 7rem;
      }
      .sk-layout {
        display: grid;
        grid-template-columns: 1.3fr 1fr;
        gap: 3rem;
      }
      .sk-main-img {
        aspect-ratio: 4/3;
        border-radius: var(--border-radius-lg);
        background: linear-gradient(
          90deg,
          var(--color-bg-secondary) 25%,
          rgba(255, 255, 255, 0.04) 50%,
          var(--color-bg-secondary) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      .sk-details {
        padding-top: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .sk-line {
        height: 14px;
        border-radius: 6px;
        background: linear-gradient(
          90deg,
          var(--color-bg-secondary) 25%,
          rgba(255, 255, 255, 0.04) 50%,
          var(--color-bg-secondary) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      .w30 {
        width: 30%;
      }
      .w50 {
        width: 50%;
      }
      .w70 {
        width: 70%;
      }
      .w90 {
        width: 90%;
      }
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      /* ═══ MOBILE ═══ */
      @media (max-width: 900px) {
        .detail-layout,
        .sk-layout {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        .details-inner {
          position: static;
        }
      }

      .detail-page {
        background:
          radial-gradient(circle at top, rgba(255, 87, 34, 0.08), transparent 32%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.015), transparent 24%),
          var(--color-bg);
      }

      .breadcrumb-bar {
        padding: 6.75rem 0 1.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.9rem 1.05rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        text-decoration: none;
      }

      .main-image-wrap {
        border-radius: 28px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 28px 70px rgba(0, 0, 0, 0.22);
      }

      .g-nav,
      .img-counter,
      .thumb,
      .condition-badge,
      .cat-badge {
        backdrop-filter: blur(12px);
      }

      .thumb {
        border-radius: 14px;
        border-color: rgba(255, 255, 255, 0.1);
      }

      .details-inner {
        padding: 2rem;
        border-radius: 28px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.015)),
          var(--color-surface);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
      }

      .price-card {
        border-radius: 20px;
        background:
          linear-gradient(135deg, rgba(255, 87, 34, 0.16), rgba(255, 87, 34, 0.05)),
          rgba(255, 87, 34, 0.08);
        border-color: rgba(255, 87, 34, 0.2);
      }

      .btn-whatsapp,
      .btn-maps {
        border-radius: 16px;
      }

      .description-section {
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
    `,
  ],
})
export class EBikeDetailComponent implements OnInit {
  private apiService = inject(ApiService);
  private translationService = inject(TranslationService);
  private route = inject(ActivatedRoute);
  private title = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  bike = signal<EBike | null>(null);
  loading = signal(true);
  selectedImage = signal(0);
  private shopInfo = signal<PublicShopInfo | null>(null);

  displayCategory = computed(() => {
    const cat = this.bike()?.kategorie;
    if (!cat) return null;
    return this.translateCategory(cat);
  });

  whatsappUrl = computed(() => {
    const b = this.bike();
    if (!b) return '';
    const tel = this.shopInfo()?.telefon || '+49 155 6630 0011';
    const phone = tel.replace(/[^0-9]/g, '');
    const text = `Hallo, ich interessiere mich für das E-Bike: ${b.titel}${b.preis ? ' (' + b.preis + '€)' : ''}. Ist es noch verfügbar?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  });

  ngOnInit(): void {
    this.apiService.getShopInfo().subscribe({
      next: (data) => this.shopInfo.set(data),
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.apiService.getEBikeById(id).subscribe({
        next: (data) => {
          this.bike.set(data);
          this.loading.set(false);
          this.setSeo(data);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  private setSeo(bike: EBike): void {
    const lang = this.lang();
    const baseUrl = 'https://bikehausfreiburg.com';
    const pageUrl = `${baseUrl}/${lang}/e-bikes/${bike.id}`;
    const priceStr = bike.preisText || `${bike.preis} €`;

    // Keyword-rich spec snippet for the meta description.
    const specs = [
      bike.motorMarke
        ? `${bike.motorMarke}${bike.motorPosition ? ' ' + bike.motorPosition : ' Motor'}`
        : null,
      bike.akkuKapazitaetWh ? `${bike.akkuKapazitaetWh} Wh Akku` : null,
      bike.motorLeistungNm ? `${bike.motorLeistungNm} Nm` : null,
    ].filter(Boolean);

    const title = `${bike.titel} – E-Bike kaufen in Freiburg | Bike Haus Freiburg`;
    const description = `${bike.titel}${specs.length ? ': ' + specs.join(', ') : ''} – ${priceStr}. Neues E-Bike kaufen bei Bike Haus Freiburg, Heckerstraße 27. Probefahrt ohne Termin.`;
    const imageUrl = bike.images?.length
      ? this.getImageUrl(bike.images[0].filePath)
      : `${baseUrl}/assets/og-default.jpg`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: pageUrl });
    this.meta.updateTag({ property: 'og:type', content: 'product' });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    let canonical = this.document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      this.document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageUrl);

    this.injectJsonLd(bike, pageUrl, imageUrl, lang, baseUrl);
  }

  private injectJsonLd(
    bike: EBike,
    pageUrl: string,
    imageUrl: string,
    lang: string,
    baseUrl: string,
  ): void {
    this.document
      .querySelectorAll('script[data-e-bike-detail-ld]')
      .forEach((el) => el.remove());

    const props = [
      bike.motorMarke
        ? { '@type': 'PropertyValue', name: 'Motor', value: bike.motorMarke }
        : null,
      bike.motorPosition
        ? { '@type': 'PropertyValue', name: 'Motorposition', value: bike.motorPosition }
        : null,
      bike.akkuKapazitaetWh
        ? { '@type': 'PropertyValue', name: 'Akkukapazität', value: `${bike.akkuKapazitaetWh} Wh`, unitText: 'Wh' }
        : null,
      bike.motorLeistungNm
        ? { '@type': 'PropertyValue', name: 'Drehmoment', value: `${bike.motorLeistungNm} Nm`, unitText: 'Nm' }
        : null,
      bike.rahmengroesse
        ? { '@type': 'PropertyValue', name: 'Rahmengröße', value: bike.rahmengroesse }
        : null,
      bike.reifengroesse
        ? { '@type': 'PropertyValue', name: 'Reifengröße', value: bike.reifengroesse }
        : null,
    ].filter(Boolean);

    const product = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: bike.titel,
      sku: `ebike-${bike.id}`,
      category: bike.kategorie || 'E-Bike',
      ...(bike.beschreibung ? { description: bike.beschreibung } : {}),
      ...(bike.marke ? { brand: { '@type': 'Brand', name: bike.marke } } : {}),
      ...(bike.images?.length ? { image: imageUrl } : {}),
      itemCondition:
        bike.zustand === 'Gebraucht'
          ? 'https://schema.org/UsedCondition'
          : 'https://schema.org/NewCondition',
      ...(props.length ? { additionalProperty: props } : {}),
      offers: {
        '@type': 'Offer',
        price: bike.preis,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: pageUrl,
        itemCondition:
          bike.zustand === 'Gebraucht'
            ? 'https://schema.org/UsedCondition'
            : 'https://schema.org/NewCondition',
        seller: {
          '@type': 'LocalBusiness',
          name: 'Bike Haus Freiburg',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Heckerstraße 27',
            postalCode: '79114',
            addressLocality: 'Freiburg im Breisgau',
            addressCountry: 'DE',
          },
        },
      },
    };

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Bike Haus Freiburg', item: `${baseUrl}/${lang}` },
        { '@type': 'ListItem', position: 2, name: 'E-Bikes', item: `${baseUrl}/${lang}/e-bikes` },
        { '@type': 'ListItem', position: 3, name: bike.titel, item: pageUrl },
      ],
    };

    [product, breadcrumb].forEach((schema) => {
      const script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-e-bike-detail-ld', '');
      script.textContent = JSON.stringify(schema);
      this.document.head.appendChild(script);
    });
  }

  getImageUrl(path: string): string {
    return `${environment.apiUrl.replace('/api/public', '')}${path}`;
  }

  prevImage(): void {
    const images = this.bike()?.images;
    if (!images?.length) return;
    this.selectedImage.set(
      (this.selectedImage() - 1 + images.length) % images.length,
    );
  }

  nextImage(): void {
    const images = this.bike()?.images;
    if (!images?.length) return;
    this.selectedImage.set((this.selectedImage() + 1) % images.length);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  formatDescription(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  private translateCategory(category: string): string {
    const t = this.t();
    const map: Record<string, string> = {
      'Damen-Fahrräder': t.catDamen,
      'Herren-Fahrräder': t.catHerren,
      'Kinder-Fahrräder': t.catKinder,
      'E-Bikes': t.catEBike,
      'Trekkingräder': t.catTrekking,
      Mountainbikes: t.catMountain,
      'Cityräder': t.catCity,
      'Rennräder': t.catRennrad,
      'Sonstige Fahrräder': t.catSonstige,
    };
    return map[category] || category;
  }
}
