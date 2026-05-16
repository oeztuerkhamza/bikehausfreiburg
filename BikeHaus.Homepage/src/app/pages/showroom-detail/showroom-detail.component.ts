import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../../services/translation.service';
import { ApiService } from '../../services/api.service';
import { CheckoutCartService } from '../../services/checkout-cart.service';
import {
  HomepageAccessory,
  KleinanzeigenListing,
  PublicBicycle,
} from '../../models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-showroom-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
      <!-- Breadcrumb Bar -->
      <nav class="breadcrumb-bar">
        <div class="container">
          <a [routerLink]="['/' + lang(), 'showroom']" class="back-link">
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
            <span>{{ t().backToShowroom }}</span>
          </a>
        </div>
      </nav>

      <div class="container" *ngIf="listing()">
        <article class="detail-layout">
          <!-- ── LEFT: Gallery ── -->
          <div class="gallery-col">
            <figure class="main-image-wrap">
              <img
                *ngIf="listing()!.images.length > 0"
                [src]="listing()!.images[selectedImage()].imageUrl"
                [alt]="listing()!.title"
                class="main-img"
                width="800"
                height="600"
                fetchpriority="high"
                (error)="onImageError($event)"
              />
              <div *ngIf="listing()!.images.length === 0" class="no-image">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-text-muted)"
                  stroke-width="1"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>

              <!-- Nav Arrows -->
              <button
                *ngIf="listing()!.images.length > 1"
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
                *ngIf="listing()!.images.length > 1"
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
              <span class="img-counter" *ngIf="listing()!.images.length > 1">
                {{ selectedImage() + 1 }} / {{ listing()!.images.length }}
              </span>
            </figure>

            <!-- Thumbnail Strip -->
            <div class="thumb-strip" *ngIf="listing()!.images.length > 1">
              <button
                *ngFor="let img of listing()!.images; let i = index"
                class="thumb"
                [class.active]="selectedImage() === i"
                (click)="selectedImage.set(i)"
              >
                <img
                  [src]="img.imageUrl"
                  [alt]="listing()!.title + ' — Bild ' + (i + 1)"
                  loading="lazy"
                  width="120"
                  height="90"
                />
              </button>
            </div>
          </div>

          <!-- ── RIGHT: Details ── -->
          <aside class="details-col">
            <div class="details-inner">
              <!-- Condition + Category Badges -->
              <div class="badge-row">
                <span class="condition-badge" [class.is-new]="isNew()">{{
                  isNew() ? t().conditionNew : t().conditionUsed
                }}</span>
                <span *ngIf="displayCategory()" class="cat-badge">{{
                  displayCategory()
                }}</span>
              </div>

              <!-- Title -->
              <h1 class="title">{{ listing()!.title }}</h1>

              <!-- Price Card -->
              <div class="price-card" *ngIf="listing()!.priceText">
                <span class="price-value">{{ listing()!.priceText }}</span>
              </div>

              <!-- Meta Info -->
              <div class="meta-list">
                <div *ngIf="listing()!.location" class="meta-row">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-accent)"
                    stroke-width="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{{ listing()!.location }}</span>
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
                  <span>{{ listing()!.images.length }} {{ t().photos }}</span>
                </div>
              </div>

              <!-- CTA: Kleinanzeigen link (only for external listings) -->
              <a
                *ngIf="listing()!.externalUrl"
                [href]="listing()!.externalUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-primary cta-link"
              >
                {{ t().viewOnKleinanzeigen }}
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
              </a>

              <!-- CTA: Buy Now Form (for all bikes with a valid price) -->
              <div *ngIf="listing()!.price" class="buy-section">
                <!-- Collapsed: show button to open form -->
                <button
                  *ngIf="!buyFormOpen()"
                  class="btn-buy-now"
                  (click)="buyFormOpen.set(true)"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path
                      d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"
                    />
                  </svg>
                  Jetzt kaufen — {{ listing()!.priceText }}
                </button>

                <!-- Expanded: checkout form -->
                <div *ngIf="buyFormOpen()" class="checkout-form">
                  <div class="checkout-form-header">
                    <span>Deine Kontaktdaten</span>
                    <button class="form-close" (click)="buyFormOpen.set(false)">
                      ×
                    </button>
                  </div>

                  <div class="form-row">
                    <div class="form-field">
                      <label>Vorname *</label>
                      <input
                        type="text"
                        [(ngModel)]="checkoutVorname"
                        placeholder="Max"
                      />
                    </div>
                    <div class="form-field">
                      <label>Nachname *</label>
                      <input
                        type="text"
                        [(ngModel)]="checkoutNachname"
                        placeholder="Mustermann"
                      />
                    </div>
                  </div>

                  <div class="form-field">
                    <label>E-Mail *</label>
                    <input
                      type="email"
                      [(ngModel)]="checkoutEmail"
                      placeholder="max@beispiel.de"
                    />
                  </div>

                  <div class="form-row">
                    <div class="form-field" style="flex: 2">
                      <label>Straße *</label>
                      <input
                        type="text"
                        [(ngModel)]="checkoutStrasse"
                        placeholder="Musterstraße"
                      />
                    </div>
                    <div class="form-field" style="flex: 1">
                      <label>Nr. *</label>
                      <input
                        type="text"
                        [(ngModel)]="checkoutHausnummer"
                        placeholder="12a"
                      />
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="form-field" style="flex: 1">
                      <label>PLZ *</label>
                      <input
                        type="text"
                        [(ngModel)]="checkoutPlz"
                        placeholder="79108"
                        maxlength="10"
                      />
                    </div>
                    <div class="form-field" style="flex: 2">
                      <label>Ort *</label>
                      <input
                        type="text"
                        [(ngModel)]="checkoutOrt"
                        placeholder="Freiburg im Breisgau"
                      />
                    </div>
                  </div>

                  <div class="form-field">
                    <label>Gewünschter Abholtag *</label>
                    <input
                      type="date"
                      [(ngModel)]="checkoutAbholtag"
                      [min]="minDate"
                      (ngModelChange)="onCheckoutAbholtagChanged($event)"
                    />
                    <small class="checkout-error" *ngIf="checkoutDateError">
                      {{ checkoutDateError }}
                    </small>
                  </div>

                  <div
                    class="form-field"
                    *ngIf="availableCheckoutAccessories().length > 0"
                  >
                    <label>Optionales Zubehör</label>
                    <div class="checkout-accessories">
                      <div
                        class="checkout-accessory-item"
                        *ngFor="let accessory of availableCheckoutAccessories()"
                      >
                        <span class="accessory-name">{{
                          accessory.titel
                        }}</span>
                        <span class="accessory-price"
                          >{{ accessory.preis | number: '1.2-2' }} €</span
                        >
                        <div class="accessory-actions">
                          <button
                            type="button"
                            class="qty-add"
                            *ngIf="
                              getSelectedAccessoryQuantity(accessory.id) === 0
                            "
                            (click)="setAccessoryQuantity(accessory.id, 1)"
                          >
                            Hinzufügen
                          </button>

                          <div
                            class="qty-controls"
                            *ngIf="
                              getSelectedAccessoryQuantity(accessory.id) > 0
                            "
                          >
                            <button
                              type="button"
                              class="qty-btn"
                              (click)="decreaseAccessoryQuantity(accessory.id)"
                            >
                              -
                            </button>
                            <span class="qty-value">{{
                              getSelectedAccessoryQuantity(accessory.id)
                            }}</span>
                            <button
                              type="button"
                              class="qty-btn"
                              (click)="increaseAccessoryQuantity(accessory.id)"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p
                      class="checkout-accessory-total"
                      *ngIf="checkoutAccessoriesTotal > 0"
                    >
                      Zubehör gesamt:
                      {{ checkoutAccessoriesTotal | number: '1.2-2' }} €
                    </p>
                  </div>

                  <div class="checkout-cart-summary">
                    <div class="summary-row">
                      <span>{{ listing()!.title }}</span>
                      <strong>{{ listing()!.priceText || '0.00 €' }}</strong>
                    </div>
                    <div
                      class="summary-row"
                      *ngFor="let selected of selectedCheckoutAccessories()"
                    >
                      <span>
                        {{ selected.titel }} x{{ selected.quantity }}
                      </span>
                      <strong>
                        {{ selected.lineTotal | number: '1.2-2' }} €
                      </strong>
                    </div>
                    <div class="summary-row total-row">
                      <span>Gesamt</span>
                      <strong>{{ checkoutTotalPriceText() }}</strong>
                    </div>
                  </div>

                  <!-- Legal Consent -->
                  <div class="legal-docs">
                    <a
                      href="/assets/docs/fernabsatzvertrag.html"
                      target="_blank"
                      rel="noopener"
                      class="legal-doc-btn"
                      download="Fernabsatzvertrag-BikeHausFreiburg.html"
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
                          d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                        />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <polyline points="9 15 12 18 15 15" />
                      </svg>
                      Fernabsatzvertrag
                    </a>
                    <a
                      href="/assets/docs/datenschutzerklaerung.html"
                      target="_blank"
                      rel="noopener"
                      class="legal-doc-btn"
                      download="Datenschutzerklaerung-BikeHausFreiburg.html"
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
                          d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                        />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <polyline points="9 15 12 18 15 15" />
                      </svg>
                      Datenschutzerklärung
                    </a>
                  </div>

                  <label class="legal-checkbox">
                    <input type="checkbox" [(ngModel)]="legalAccepted" />
                    <span>
                      Ich habe den
                      <a
                        href="/assets/docs/fernabsatzvertrag.html"
                        target="_blank"
                        rel="noopener"
                        >Fernabsatzvertrag</a
                      >
                      sowie die
                      <a
                        href="/assets/docs/datenschutzerklaerung.html"
                        target="_blank"
                        rel="noopener"
                        >Datenschutzerklärung</a
                      >
                      gelesen und akzeptiere sie. *
                    </span>
                  </label>

                  <button
                    class="btn-buy-now"
                    [class.loading]="checkoutLoading()"
                    [disabled]="checkoutLoading() || !checkoutFormValid"
                    (click)="onBuyNow()"
                  >
                    <span
                      class="btn-buy-spinner"
                      *ngIf="checkoutLoading()"
                    ></span>
                    <svg
                      *ngIf="!checkoutLoading()"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    {{
                      checkoutLoading()
                        ? 'Weiterleitung...'
                        : 'Sicher bezahlen — ' + checkoutTotalPriceText()
                    }}
                  </button>
                  <p *ngIf="checkoutError()" class="checkout-error">
                    {{ checkoutError() }}
                  </p>
                </div>
              </div>

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

              <!-- WhatsApp Contact -->
              <div class="whatsapp-contact">
                <div class="whatsapp-header">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#25D366"
                  >
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                    />
                  </svg>
                  <span>{{ t().whatsappTitle }}</span>
                </div>
                <div class="whatsapp-listing-preview">
                  <strong>{{ listing()!.title }}</strong>
                  <span *ngIf="listing()!.price">{{ listing()!.price }}€</span>
                </div>
                <textarea
                  class="whatsapp-textarea"
                  [placeholder]="t().whatsappPlaceholder"
                  [(ngModel)]="userWhatsappMessage"
                  rows="3"
                ></textarea>
                <a
                  [href]="getWhatsappLink()"
                  target="_blank"
                  rel="noopener"
                  class="btn-whatsapp"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                    />
                  </svg>
                  {{ t().whatsappSend }}
                </a>
              </div>
            </div>
          </aside>
        </article>

        <!-- ── Description (full width below) ── -->
        <section *ngIf="listing()!.description" class="desc-section">
          <h2>{{ t().description }}</h2>
          <div
            class="desc-body"
            [innerHTML]="formatDescription(listing()!.description!)"
          ></div>
        </section>

        <!-- ── Ähnliche Fahrräder (Internal Linking) ── -->
        <section *ngIf="relatedListings().length" class="related-section">
          <h2>{{ t().relatedBikes || 'Ähnliche Fahrräder' }}</h2>
          <div class="related-grid">
            <a
              *ngFor="let rel of relatedListings()"
              [routerLink]="['/' + lang(), 'showroom', rel.id]"
              class="related-card"
            >
              <div class="related-img-wrap">
                <img
                  *ngIf="rel.images.length"
                  [src]="rel.images[0].imageUrl"
                  [alt]="rel.title"
                  loading="lazy"
                  width="280"
                  height="210"
                />
              </div>
              <div class="related-info">
                <span class="related-title">{{ rel.title }}</span>
                <span *ngIf="rel.price" class="related-price"
                  >{{ rel.price }} €</span
                >
              </div>
            </a>
          </div>
        </section>

        <!-- ── Ratgeber-Empfehlung (Blog Internal Link) ── -->
        <section class="blog-cta-section">
          <h2>{{ t().ratgeberTitle || 'Ratgeber & Tipps' }}</h2>
          <div class="blog-cta-grid">
            <a
              [routerLink]="[
                '/' + lang(),
                'ratgeber',
                'gebrauchtes-fahrrad-kaufen-tipps',
              ]"
              class="blog-cta-card"
            >
              <span class="blog-cta-icon">📋</span>
              <span class="blog-cta-text">{{
                t().blogCta1 ||
                  'Gebrauchtes Fahrrad kaufen — Tipps & Checkliste'
              }}</span>
            </a>
            <a
              [routerLink]="[
                '/' + lang(),
                'ratgeber',
                'welches-fahrrad-passt-zu-mir',
              ]"
              class="blog-cta-card"
            >
              <span class="blog-cta-icon">🚲</span>
              <span class="blog-cta-text">{{
                t().blogCta2 || 'Welches Fahrrad passt zu mir?'
              }}</span>
            </a>
            <a
              [routerLink]="[
                '/' + lang(),
                'ratgeber',
                'fahrrad-inspektion-kosten',
              ]"
              class="blog-cta-card"
            >
              <span class="blog-cta-icon">🔧</span>
              <span class="blog-cta-text">{{
                t().blogCta3 || 'Fahrrad Inspektion — Was kostet es?'
              }}</span>
            </a>
          </div>
        </section>
      </div>

      <!-- Not Found -->
      <div *ngIf="!listing() && !loading()" class="container not-found-wrap">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-muted)"
          stroke-width="1.5"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <p>{{ t().noResults }}</p>
        <a [routerLink]="['/' + lang(), 'showroom']" class="btn-primary">{{
          t().backToShowroom
        }}</a>
      </div>
    </div>
  `,
  styles: [
    `
      /* ── Loading Skeleton ── */
      .loading-wrap {
        padding: 7rem 0 4rem;
      }

      .sk-layout {
        display: grid;
        grid-template-columns: 1fr 420px;
        gap: 2.5rem;
      }

      .sk-main-img {
        aspect-ratio: 4/3;
        border-radius: 20px;
        background: linear-gradient(
          90deg,
          var(--color-surface) 25%,
          var(--color-surface-alt, #1a1a1a) 50%,
          var(--color-surface) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }

      .sk-details {
        padding-top: 1rem;
      }

      .sk-line {
        height: 16px;
        border-radius: 8px;
        margin-bottom: 1.25rem;
        background: linear-gradient(
          90deg,
          var(--color-surface) 25%,
          var(--color-surface-alt, #1a1a1a) 50%,
          var(--color-surface) 75%
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
        to {
          background-position: -200% 0;
        }
      }

      /* ── Page ── */
      .detail-page {
        padding-bottom: 4rem;
        background:
          radial-gradient(
            circle at top,
            rgba(255, 87, 34, 0.08),
            transparent 32%
          ),
          linear-gradient(180deg, rgba(255, 255, 255, 0.015), transparent 24%),
          var(--color-bg);
      }

      .breadcrumb-bar {
        position: relative;
        padding: 6.75rem 0 1.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 2.5rem;
        overflow: hidden;
      }

      .breadcrumb-bar::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(
            circle at 12% 0%,
            rgba(255, 87, 34, 0.12),
            transparent 22%
          ),
          radial-gradient(
            circle at 88% 0%,
            rgba(255, 255, 255, 0.05),
            transparent 18%
          );
        pointer-events: none;
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        position: relative;
        z-index: 1;
        color: rgba(255, 255, 255, 0.72);
        text-decoration: none;
        font-size: 0.88rem;
        font-weight: 600;
        transition: color 0.2s;
        padding: 0.9rem 1.05rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .back-link:hover {
        color: var(--color-accent);
      }

      /* ── Layout ── */
      .detail-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 420px;
        gap: 2rem;
        align-items: start;
      }

      /* ── Gallery ── */
      .gallery-col {
        min-width: 0;
      }

      .main-image-wrap {
        position: relative;
        border-radius: 28px;
        overflow: hidden;
        background: #0d0d0d;
        border: 1px solid rgba(255, 255, 255, 0.08);
        aspect-ratio: 4/3;
        margin: 0;
        box-shadow: 0 28px 70px rgba(0, 0, 0, 0.22);
      }

      .main-image-wrap::after {
        content: '';
        position: absolute;
        inset: auto 0 0 0;
        height: 36%;
        background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.45));
        pointer-events: none;
      }

      .main-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .no-image {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-surface);
      }

      .g-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(8px);
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition:
          opacity 0.25s,
          background 0.2s;
      }

      .main-image-wrap:hover .g-nav {
        opacity: 1;
      }

      .g-nav:hover {
        background: rgba(0, 0, 0, 0.8);
      }
      .g-prev {
        left: 1rem;
      }
      .g-next {
        right: 1rem;
      }

      .img-counter {
        position: absolute;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(6px);
        color: #fff;
        padding: 0.3rem 0.9rem;
        border-radius: 50px;
        font-size: 0.78rem;
        font-weight: 500;
        letter-spacing: 0.04em;
      }

      /* Thumbnails */
      .thumb-strip {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.75rem;
        overflow-x: auto;
        padding-bottom: 0.25rem;
        scrollbar-width: thin;
        scrollbar-color: var(--color-border) transparent;
      }

      .thumb {
        flex-shrink: 0;
        width: 86px;
        height: 62px;
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        padding: 0;
        background: none;
        transition:
          border-color 0.2s,
          opacity 0.2s,
          transform 0.2s;
        opacity: 0.62;
      }

      .thumb.active {
        border-color: var(--color-accent);
        opacity: 1;
        transform: translateY(-2px);
      }

      .thumb:hover {
        opacity: 1;
      }

      .thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      /* ── Details Column ── */
      .details-col {
        position: sticky;
        top: 6rem;
      }

      .details-inner {
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.045),
            rgba(255, 255, 255, 0.015)
          ),
          var(--color-surface);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 28px;
        padding: 2rem;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
      }

      .badge-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }

      .condition-badge {
        display: inline-block;
        background: rgba(255, 255, 255, 0.05);
        color: var(--color-text-secondary);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 0.42rem 0.95rem;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .condition-badge.is-new {
        background: rgba(76, 175, 80, 0.15);
        color: #4caf50;
      }

      .cat-badge {
        display: inline-block;
        background: rgba(255, 87, 34, 0.1);
        color: var(--color-accent);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        padding: 0.42rem 0.95rem;
        border-radius: 999px;
        border: 1px solid rgba(255, 87, 34, 0.18);
      }

      .title {
        font-size: clamp(1.65rem, 3vw, 2.35rem);
        font-weight: 800;
        color: var(--color-text);
        line-height: 1.05;
        margin: 0 0 1.35rem;
        letter-spacing: -0.035em;
      }

      .price-card {
        background:
          linear-gradient(
            135deg,
            rgba(255, 87, 34, 0.16),
            rgba(255, 87, 34, 0.05)
          ),
          rgba(255, 87, 34, 0.08);
        border: 1px solid rgba(255, 87, 34, 0.2);
        border-radius: 20px;
        padding: 1.15rem 1.3rem;
        margin-bottom: 1.5rem;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
      }

      .price-value {
        font-size: clamp(1.7rem, 3vw, 2.4rem);
        font-weight: 800;
        color: var(--color-accent);
        letter-spacing: -0.04em;
      }

      /* Meta */
      .meta-list {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        margin-bottom: 1.8rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .meta-row {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 0.88rem;
        color: var(--color-text-secondary);
      }

      .meta-row svg {
        flex-shrink: 0;
      }

      /* CTA */
      .cta-link {
        width: 100%;
        justify-content: center;
        text-decoration: none;
        padding: 0.95rem 1.5rem;
        border-radius: 16px;
      }

      .btn-maps {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        margin-top: 0.8rem;
        padding: 0.9rem 1.5rem;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: var(--color-text-secondary);
        font-size: 0.88rem;
        font-weight: 600;
        text-decoration: none;
        transition:
          border-color 0.25s,
          color 0.25s;
      }

      .btn-maps:hover {
        border-color: var(--color-accent);
        color: var(--color-accent);
      }

      .whatsapp-contact {
        margin-top: 1.6rem;
        padding: 1.1rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .whatsapp-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--color-text);
        margin-bottom: 0.85rem;
      }

      .whatsapp-listing-preview {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.85rem;
        background: rgba(0, 0, 0, 0.18);
        border-radius: 14px;
        margin-bottom: 0.85rem;
        font-size: 0.85rem;
      }

      .whatsapp-listing-preview strong {
        color: var(--color-text);
        line-height: 1.4;
      }

      .whatsapp-listing-preview span {
        color: var(--color-accent);
        font-weight: 600;
      }

      .whatsapp-textarea {
        width: 100%;
        padding: 0.85rem;
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(0, 0, 0, 0.18);
        color: var(--color-text);
        font-size: 0.9rem;
        font-family: inherit;
        resize: vertical;
        min-height: 70px;
        margin-bottom: 0.85rem;
        transition: border-color 0.25s;
      }

      .whatsapp-textarea::placeholder {
        color: var(--color-text-muted);
      }

      .whatsapp-textarea:focus {
        outline: none;
        border-color: #25d366;
      }

      .btn-whatsapp {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.9rem 1rem;
        border-radius: 14px;
        background: #25d366;
        color: #fff;
        font-size: 0.9rem;
        font-weight: 600;
        text-decoration: none;
        transition:
          background 0.25s,
          transform 0.15s;
      }

      .btn-whatsapp:hover {
        background: #1eb655;
        transform: translateY(-1px);
      }

      .btn-buy-now {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.55rem;
        width: 100%;
        margin-top: 0.8rem;
        padding: 1rem 1.5rem;
        border-radius: 16px;
        background: linear-gradient(135deg, var(--color-accent), #e64a00);
        border: none;
        color: #fff;
        font-size: 1rem;
        font-weight: 700;
        font-family: var(--font-family);
        cursor: pointer;
        transition:
          opacity 0.2s,
          transform 0.15s,
          box-shadow 0.2s;
        box-shadow: 0 4px 20px rgba(255, 87, 34, 0.35);
        letter-spacing: -0.01em;
      }

      .btn-buy-now:hover:not(:disabled) {
        opacity: 0.92;
        transform: translateY(-2px);
        box-shadow: 0 8px 28px rgba(255, 87, 34, 0.45);
      }

      .btn-buy-now:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .btn-buy-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255, 255, 255, 0.35);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        flex-shrink: 0;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .checkout-error {
        margin-top: 0.6rem;
        font-size: 0.82rem;
        color: #ff5252;
        text-align: center;
      }

      .buy-section {
        margin-top: 0.8rem;
      }

      .checkout-form {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 87, 34, 0.2);
        border-radius: 20px;
        padding: 1.25rem;
        margin-top: 0.8rem;
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .checkout-form-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 1rem;
      }

      .form-close {
        background: none;
        border: none;
        color: var(--color-text-muted);
        font-size: 1.3rem;
        cursor: pointer;
        line-height: 1;
        padding: 0;
        transition: color 0.2s;
      }
      .form-close:hover {
        color: var(--color-text);
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        margin-bottom: 0.75rem;
      }

      .form-field label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .form-field input {
        padding: 0.75rem 0.9rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.25);
        color: var(--color-text);
        font-size: 0.88rem;
        font-family: var(--font-family);
        outline: none;
        transition:
          border-color 0.2s,
          box-shadow 0.2s;
        width: 100%;
        box-sizing: border-box;
      }

      .form-field input:focus {
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.12);
      }

      .form-field input::placeholder {
        color: var(--color-text-muted);
      }

      .form-field input[type='date']::-webkit-calendar-picker-indicator {
        filter: invert(0.6);
        cursor: pointer;
      }

      .legal-docs {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 0.75rem;
      }

      .checkout-accessories {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 220px;
        overflow: auto;
        padding-right: 0.2rem;
      }

      .checkout-accessory-item {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 0.6rem;
        align-items: center;
        padding: 0.55rem 0.65rem;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.02);
      }

      .accessory-name {
        font-size: 0.83rem;
        color: var(--color-text-secondary);
        line-height: 1.3;
      }

      .accessory-price {
        font-size: 0.83rem;
        font-weight: 700;
        color: var(--color-accent);
        white-space: nowrap;
      }

      .checkout-accessory-total {
        margin: 0.6rem 0 0;
        font-size: 0.8rem;
        color: var(--color-text-secondary);
      }

      .accessory-actions {
        justify-self: end;
      }

      .qty-add {
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 8px;
        padding: 0.35rem 0.6rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-text);
        background: rgba(255, 255, 255, 0.04);
        cursor: pointer;
      }

      .qty-controls {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }

      .qty-btn {
        width: 26px;
        height: 26px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.04);
        color: var(--color-text);
        cursor: pointer;
        font-size: 1rem;
        line-height: 1;
      }

      .qty-value {
        min-width: 20px;
        text-align: center;
        font-size: 0.8rem;
        color: var(--color-text-secondary);
      }

      .checkout-cart-summary {
        margin: 0.9rem 0 1rem;
        padding: 0.8rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.02);
        display: grid;
        gap: 0.45rem;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        font-size: 0.8rem;
        color: var(--color-text-secondary);
      }

      .summary-row strong {
        color: var(--color-text);
      }

      .total-row {
        margin-top: 0.35rem;
        padding-top: 0.45rem;
        border-top: 1px dashed rgba(255, 255, 255, 0.14);
        font-size: 0.9rem;
        color: var(--color-text);
      }

      .legal-doc-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.45rem 0.85rem;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.04);
        color: var(--color-text-secondary);
        font-size: 0.75rem;
        font-weight: 600;
        text-decoration: none;
        transition:
          border-color 0.2s,
          color 0.2s;
        white-space: nowrap;
      }

      .legal-doc-btn:hover {
        border-color: var(--color-accent);
        color: var(--color-accent);
      }

      .legal-checkbox {
        display: flex;
        align-items: flex-start;
        gap: 0.6rem;
        margin-bottom: 0.85rem;
        cursor: pointer;
      }

      .legal-checkbox input[type='checkbox'] {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
        margin-top: 2px;
        accent-color: var(--color-accent);
        cursor: pointer;
      }

      .legal-checkbox span {
        font-size: 0.78rem;
        color: var(--color-text-muted);
        line-height: 1.5;
      }

      .legal-checkbox span a {
        color: var(--color-accent);
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      @media (max-width: 520px) {
        .form-row {
          grid-template-columns: 1fr;
        }
      }

      .desc-section {
        margin-top: 3rem;
        padding-top: 2.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        max-width: 800px;
      }

      .desc-section h2 {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 1rem;
      }

      .desc-body {
        font-size: 0.95rem;
        line-height: 1.8;
        color: var(--color-text-secondary);
        white-space: pre-wrap;
        word-break: break-word;
      }

      .related-section {
        margin-top: 3rem;
        padding-top: 2.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .related-section h2 {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 1.25rem;
      }

      .related-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
      }

      .related-card {
        text-decoration: none;
        border-radius: 20px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background:
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.045),
            rgba(255, 255, 255, 0.015)
          ),
          var(--color-surface);
        transition:
          border-color 0.25s,
          transform 0.15s;
      }

      .related-card:hover {
        border-color: var(--color-accent);
        transform: translateY(-2px);
      }

      .related-img-wrap {
        aspect-ratio: 4/3;
        overflow: hidden;
        background: #0d0d0d;
      }

      .related-img-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .related-info {
        padding: 0.75rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .related-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-text);
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .related-price {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--color-accent);
      }

      /* ── Blog CTA Section ── */
      .blog-cta-section {
        margin-top: 2.5rem;
        padding-top: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .blog-cta-section h2 {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--color-text);
        margin-bottom: 1rem;
      }

      .blog-cta-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 0.75rem;
      }

      .blog-cta-card {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        border-radius: 12px;
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        text-decoration: none;
        transition:
          border-color 0.25s,
          background 0.2s;
      }

      .blog-cta-card:hover {
        border-color: var(--color-accent);
        background: rgba(255, 87, 34, 0.05);
      }

      .blog-cta-icon {
        font-size: 1.3rem;
        flex-shrink: 0;
      }

      .blog-cta-text {
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--color-text);
        line-height: 1.35;
      }

      /* ── Not Found ── */
      .not-found-wrap {
        text-align: center;
        padding: 8rem 1rem;
      }

      .not-found-wrap svg {
        margin-bottom: 1rem;
      }
      .not-found-wrap p {
        color: var(--color-text-secondary);
        margin-bottom: 1.5rem;
      }

      /* ── Responsive ── */
      @media (max-width: 960px) {
        .detail-layout {
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .sk-layout {
          grid-template-columns: 1fr;
        }

        .details-col {
          position: static;
        }

        .details-inner {
          padding: 1.5rem;
        }

        .breadcrumb-bar {
          padding-top: 5.5rem;
          margin-bottom: 1.5rem;
        }
      }

      @media (max-width: 640px) {
        .main-image-wrap {
          border-radius: 14px;
        }

        .title {
          font-size: 1.15rem;
        }

        .price-value {
          font-size: 1.3rem;
        }

        .g-nav {
          opacity: 1;
          width: 36px;
          height: 36px;
        }
      }
    `,
  ],
})
export class ShowroomDetailComponent implements OnInit, OnDestroy {
  private translationService = inject(TranslationService);
  private apiService = inject(ApiService);
  private checkoutCart = inject(CheckoutCartService);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private document = inject(DOCUMENT);

  private productSchemaElement: HTMLScriptElement | null = null;

  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;

  listing = signal<KleinanzeigenListing | null>(null);
  relatedListings = signal<KleinanzeigenListing[]>([]);
  loading = signal(true);
  selectedImage = signal(0);
  checkoutLoading = signal(false);
  checkoutError = signal<string | null>(null);
  buyFormOpen = signal(false);
  checkoutVorname = '';
  checkoutNachname = '';
  checkoutEmail = '';
  checkoutStrasse = '';
  checkoutHausnummer = '';
  checkoutPlz = '';
  checkoutOrt = '';
  checkoutAbholtag = '';
  checkoutDateError: string | null = null;
  availableCheckoutAccessories = signal<HomepageAccessory[]>([]);
  selectedCheckoutAccessoryQuantities = signal<Record<number, number>>({});
  legalAccepted = false;
  private bwHolidayCache = new Map<number, Set<string>>();
  minDate = this.getNextOpenDayIso(new Date());
  userWhatsappMessage = '';
  private whatsappPhone = '4915566300011';

  isBikeHausBike = computed(
    () => this.listing()?.externalId?.startsWith('bike-') ?? false,
  );

  get checkoutFormValid(): boolean {
    return (
      this.checkoutVorname.trim().length > 0 &&
      this.checkoutNachname.trim().length > 0 &&
      this.checkoutEmail.trim().includes('@') &&
      this.checkoutStrasse.trim().length > 0 &&
      this.checkoutHausnummer.trim().length > 0 &&
      this.checkoutPlz.trim().length > 0 &&
      this.checkoutOrt.trim().length > 0 &&
      this.checkoutAbholtag.length > 0 &&
      !this.isClosedDayFromIso(this.checkoutAbholtag) &&
      this.legalAccepted
    );
  }

  get checkoutAccessoriesTotal(): number {
    const quantities = this.selectedCheckoutAccessoryQuantities();
    return this.availableCheckoutAccessories().reduce(
      (sum, item) => sum + item.preis * (quantities[item.id] || 0),
      0,
    );
  }

  get checkoutTotalAmount(): number {
    return (this.listing()?.price || 0) + this.checkoutAccessoriesTotal;
  }

  checkoutTotalPriceText(): string {
    const total = this.checkoutTotalAmount;
    return `${total.toFixed(2)} €`;
  }

  selectedCheckoutAccessories(): Array<{
    id: number;
    titel: string;
    quantity: number;
    lineTotal: number;
  }> {
    const quantities = this.selectedCheckoutAccessoryQuantities();
    return this.availableCheckoutAccessories()
      .map((item) => {
        const quantity = quantities[item.id] || 0;
        return {
          id: item.id,
          titel: item.titel,
          quantity,
          lineTotal: quantity * item.preis,
        };
      })
      .filter((item) => item.quantity > 0);
  }

  getSelectedAccessoryQuantity(accessoryId: number): number {
    return this.selectedCheckoutAccessoryQuantities()[accessoryId] || 0;
  }

  setAccessoryQuantity(accessoryId: number, quantity: number): void {
    const safeQuantity = Math.max(0, Math.min(quantity, 10));
    this.checkoutCart.setAccessoryQuantity(accessoryId, safeQuantity);
    this.selectedCheckoutAccessoryQuantities.update((current) => {
      const next = { ...current };
      if (safeQuantity === 0) {
        delete next[accessoryId];
      } else {
        next[accessoryId] = safeQuantity;
      }
      return next;
    });
  }

  increaseAccessoryQuantity(accessoryId: number): void {
    this.setAccessoryQuantity(
      accessoryId,
      this.getSelectedAccessoryQuantity(accessoryId) + 1,
    );
  }

  decreaseAccessoryQuantity(accessoryId: number): void {
    this.setAccessoryQuantity(
      accessoryId,
      this.getSelectedAccessoryQuantity(accessoryId) - 1,
    );
  }

  private static readonly NEW_PATTERN =
    /\b(neue?[smrn]?|nagelneu|brandneu|unbenutzt|originalverpackt|\bovp\b)\b/i;

  isNew = () =>
    ShowroomDetailComponent.NEW_PATTERN.test(this.listing()?.title || '');

  displayCategory(): string | null {
    const cat = this.listing()?.category;
    if (!cat || /kleinanzeigen|freiburg/i.test(cat)) return null;
    return cat;
  }

  getWhatsappLink(): string {
    const listing = this.listing();
    if (!listing) return '';

    const t = this.t();
    const priceText = listing.price ? ` - ${listing.price}€` : '';
    const listingUrl = `https://bikehausfreiburg.com/${this.lang()}/showroom/${listing.id}`;
    const baseText = `${listingUrl}\n\n${t.whatsappInterested}\n${listing.title}${priceText}\n\n`;
    const userMsg = this.userWhatsappMessage.trim();
    const fullText =
      baseText + (userMsg ? `${t.whatsappQuestion}\n${userMsg}` : '');

    return `https://wa.me/${this.whatsappPhone}?text=${encodeURIComponent(fullText)}`;
  }

  ngOnInit(): void {
    this.apiService.getHomepageAccessories().subscribe({
      next: (items) => {
        const available = items.filter(
          (item) => item.isActive && item.preis > 0,
        );
        this.availableCheckoutAccessories.set(available);

        const saved = this.checkoutCart.getAccessoryQuantities();
        const availableIds = new Set(available.map((item) => item.id));
        const initial: Record<number, number> = {};

        for (const [key, qty] of Object.entries(saved)) {
          const id = Number(key);
          if (availableIds.has(id) && qty > 0) {
            initial[id] = qty;
          }
        }

        this.selectedCheckoutAccessoryQuantities.set(initial);
      },
      error: () => {
        this.availableCheckoutAccessories.set([]);
      },
    });

    this.apiService.getShopInfo().subscribe({
      next: (data) => {
        if (data?.telefon) {
          this.whatsappPhone = data.telefon.replace(/[^0-9]/g, '');
        }
      },
    });

    this.route.params.subscribe((params) => {
      const id = +params['id'];
      if (id) {
        this.loadListing(id);
      }
    });
  }

  private loadListing(id: number): void {
    // ID >= 900000 means BikeHaus bicycle (offset to avoid collision with KA IDs)
    const BIKEHAUS_ID_OFFSET = 900000;

    if (id >= BIKEHAUS_ID_OFFSET) {
      // BikeHaus bicycle - get from gebrauchte-fahrraeder endpoint
      const realId = id - BIKEHAUS_ID_OFFSET;
      this.apiService.getGebrauchteFahrradById(realId).subscribe({
        next: (bike) => {
          // Convert PublicBicycle to KleinanzeigenListing format
          const listing = this.convertBicycleToListing(bike, id);
          this.listing.set(listing);
          this.loading.set(false);
          this.updateSeoMeta(listing, id);
          this.loadRelated(listing);
        },
        error: () => this.loading.set(false),
      });
    } else {
      // Kleinanzeigen listing
      this.apiService.getListingById(id).subscribe({
        next: (data) => {
          this.listing.set(data);
          this.loading.set(false);
          this.updateSeoMeta(data, id);
          this.loadRelated(data);
        },
        error: () => this.loading.set(false),
      });
    }
  }

  private loadRelated(current: KleinanzeigenListing): void {
    this.apiService.getListings().subscribe({
      next: (all) => {
        const category = current.category?.toLowerCase() || '';
        const related = all
          .filter(
            (l) =>
              l.id !== current.id &&
              l.category?.toLowerCase() === category &&
              l.images.length > 0,
          )
          .slice(0, 4);
        // If not enough in same category, fill with random others
        if (related.length < 4) {
          const others = all
            .filter(
              (l) =>
                l.id !== current.id &&
                !related.find((r) => r.id === l.id) &&
                l.images.length > 0,
            )
            .slice(0, 4 - related.length);
          related.push(...others);
        }
        this.relatedListings.set(related);
      },
    });
  }

  private convertBicycleToListing(
    bike: PublicBicycle,
    displayId: number,
  ): KleinanzeigenListing {
    const titleParts = [bike.marke, bike.modell];
    if (bike.fahrradtyp) titleParts.push(bike.fahrradtyp);
    if (bike.reifengroesse) titleParts.push(`${bike.reifengroesse} Zoll`);
    if (bike.rahmengroesse) titleParts.push(`${bike.rahmengroesse} cm`);

    const baseUrl = environment.apiUrl;

    return {
      id: displayId,
      externalId: `bike-${bike.id}`,
      title: titleParts.join(' '),
      description: bike.beschreibung || '',
      price: bike.preis || undefined,
      priceText: bike.preis ? `${bike.preis} €` : 'VB',
      category: this.mapArtToCategory(bike.art),
      location: 'Freiburg',
      externalUrl: '',
      isActive: true,
      firstScrapedAt: bike.createdAt,
      lastScrapedAt: bike.createdAt,
      images: bike.images.map((img, idx) => ({
        id: img.id,
        kleinanzeigenListingId: displayId,
        imageUrl: `${baseUrl}/gallery-image/${img.filePath}`,
        localPath: img.filePath,
        sortOrder: img.sortOrder,
      })),
    };
  }

  private mapArtToCategory(art?: string): string {
    if (!art) return 'Sonstige Fahrräder';
    const lower = art.toLowerCase();
    if (lower.includes('herren')) return 'Herren Fahrräder';
    if (lower.includes('damen')) return 'Damen Fahrräder';
    if (lower.includes('kinder')) return 'Kinder Fahrräder';
    if (lower.includes('unisex')) return 'Sonstige Fahrräder';
    return 'Sonstige Fahrräder';
  }

  private updateSeoMeta(data: KleinanzeigenListing, id: number): void {
    if (data) {
      const title = `${data.title} — Bike Haus Freiburg`;
      const price = data.price ? `${data.price}€` : '';
      const desc = `${data.title} ${price}. ${this.t().detailMetaDescSuffix}`;

      this.titleService.setTitle(title);
      this.metaService.updateTag({ name: 'description', content: desc });
      this.metaService.updateTag({ property: 'og:title', content: title });
      this.metaService.updateTag({
        property: 'og:description',
        content: desc,
      });
      this.metaService.updateTag({
        property: 'og:url',
        content: `https://bikehausfreiburg.com/showroom/${id}`,
      });
      if (data.images?.length) {
        this.metaService.updateTag({
          property: 'og:image',
          content: data.images[0].imageUrl,
        });
      }

      // Add Product Schema.org for SEO
      this.addProductSchema(data, id);
    }
  }

  private addProductSchema(data: KleinanzeigenListing, id: number): void {
    // Remove existing schema if any
    this.removeProductSchema();

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `https://bikehausfreiburg.com/${this.lang()}/showroom/${id}#product`,
      name: data.title,
      description: data.description || data.title,
      image: data.images?.map((img) => img.imageUrl) || [],
      url: `https://bikehausfreiburg.com/${this.lang()}/showroom/${id}`,
      brand: {
        '@type': 'Brand',
        name: 'Bike Haus Freiburg',
      },
      seller: {
        '@type': 'LocalBusiness',
        name: 'Bike Haus Freiburg',
        url: 'https://bikehausfreiburg.com',
      },
      offers: {
        '@type': 'Offer',
        url: `https://bikehausfreiburg.com/${this.lang()}/showroom/${id}`,
        priceCurrency: 'EUR',
        price: data.price || 0,
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        availability: 'https://schema.org/InStock',
        itemCondition: this.isNew()
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/UsedCondition',
        seller: {
          '@type': 'LocalBusiness',
          name: 'Bike Haus Freiburg',
        },
      },
      category: data.category || this.t().bikeFallbackCategory,
    };

    this.productSchemaElement = this.document.createElement('script');
    this.productSchemaElement.type = 'application/ld+json';
    this.productSchemaElement.text = JSON.stringify(schema);
    this.document.head.appendChild(this.productSchemaElement);
  }

  private removeProductSchema(): void {
    if (this.productSchemaElement && this.productSchemaElement.parentNode) {
      this.productSchemaElement.parentNode.removeChild(
        this.productSchemaElement,
      );
      this.productSchemaElement = null;
    }
  }

  ngOnDestroy(): void {
    this.removeProductSchema();
  }

  onBuyNow(): void {
    const listing = this.listing();
    if (!listing || !this.checkoutFormValid) return;

    if (this.isClosedDayFromIso(this.checkoutAbholtag)) {
      this.checkoutDateError =
        'An Sonn- und Feiertagen ist keine Abholung moeglich. Bitte waehle einen anderen Tag.';
      return;
    }

    const realId = this.isBikeHausBike()
      ? parseInt(listing.externalId.replace('bike-', ''), 10)
      : 0;
    const selectedAccessories = this.selectedCheckoutAccessories().map(
      (item) => ({
        accessoryId: item.id,
        quantity: item.quantity,
      }),
    );

    this.checkoutLoading.set(true);
    this.checkoutError.set(null);

    this.apiService
      .createCheckoutSession({
        bikeId: realId,
        listingDisplayId: listing.id,
        lang: this.lang(),
        vorname: this.checkoutVorname.trim(),
        nachname: this.checkoutNachname.trim(),
        email: this.checkoutEmail.trim(),
        adresse: `${this.checkoutStrasse.trim()} ${this.checkoutHausnummer.trim()}, ${this.checkoutPlz.trim()} ${this.checkoutOrt.trim()}`,
        abholtag: this.checkoutAbholtag,
        accessories: selectedAccessories,
      })
      .subscribe({
        next: (res) => {
          this.checkoutCart.clearAccessories();
          if (res.paymentId) {
            localStorage.setItem('pending_payment_id', res.paymentId);
          }
          window.location.href = res.checkoutUrl;
        },
        error: () => {
          this.checkoutLoading.set(false);
          this.checkoutError.set(
            'Zahlung konnte nicht gestartet werden. Bitte versuche es erneut.',
          );
        },
      });
  }

  prevImage(): void {
    const images = this.listing()?.images || [];
    const current = this.selectedImage();
    this.selectedImage.set(current === 0 ? images.length - 1 : current - 1);
  }

  nextImage(): void {
    const images = this.listing()?.images || [];
    const current = this.selectedImage();
    this.selectedImage.set(current === images.length - 1 ? 0 : current + 1);
  }

  formatDescription(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  onCheckoutAbholtagChanged(value: string): void {
    if (!value) {
      this.checkoutDateError = null;
      return;
    }

    this.checkoutDateError = this.isClosedDayFromIso(value)
      ? 'An Sonn- und Feiertagen ist keine Abholung moeglich.'
      : null;
  }

  private getNextOpenDayIso(start: Date): string {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    while (this.isClosedDay(d)) {
      d.setDate(d.getDate() + 1);
    }
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private isClosedDayFromIso(value: string): boolean {
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return false;
    return this.isClosedDay(new Date(y, m - 1, d));
  }

  private easterDate(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
  }

  private getBWHolidays(year: number): Set<string> {
    this.bwHolidayCache ??= new Map<number, Set<string>>();
    if (this.bwHolidayCache.has(year)) return this.bwHolidayCache.get(year)!;
    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const add = (d: Date, days: number) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
    const easter = this.easterDate(year);
    const holidays = new Set<string>([
      fmt(new Date(year, 0, 1)),
      fmt(new Date(year, 0, 6)),
      fmt(new Date(year, 4, 1)),
      fmt(new Date(year, 9, 3)),
      fmt(new Date(year, 10, 1)),
      fmt(new Date(year, 11, 25)),
      fmt(new Date(year, 11, 26)),
      fmt(add(easter, -2)),
      fmt(easter),
      fmt(add(easter, 1)),
      fmt(add(easter, 39)),
      fmt(add(easter, 49)),
      fmt(add(easter, 50)),
      fmt(add(easter, 60)),
    ]);
    this.bwHolidayCache.set(year, holidays);
    return holidays;
  }

  private isClosedDay(date: Date): boolean {
    if (date.getDay() === 0) return true;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return this.getBWHolidays(date.getFullYear()).has(key);
  }
}
