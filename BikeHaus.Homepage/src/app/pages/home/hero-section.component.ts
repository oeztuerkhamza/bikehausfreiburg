import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
  computed,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { getRentalBookingPath } from '../../services/language-config';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
})
export class HeroSectionComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heroVideo') videoRef!: ElementRef<HTMLVideoElement>;

  private readonly VIDEO_LIST = [
    'assets/videos/hero-bg-1.mp4',
    'assets/videos/hero-bg-3.mp4',
    'assets/videos/hero-bg-4.mp4',
  ];

  currentIndex = signal(0);
  videoSrc = computed(() => this.VIDEO_LIST[this.currentIndex()]);
  videoEnabled = signal(false);

  private intersectionObserver?: IntersectionObserver;
  private visibilityHandler?: () => void;
  private setupTimer?: ReturnType<typeof setTimeout>;
  private setupRetries = 0;
  private setupDone = false;
  private translationService = inject(TranslationService);
  t = this.translationService.translations;
  lang = this.translationService.currentLanguage;
  /** Lokalisierter Pfad direkt in den Buchungs-Flow (statt Landing-Page). */
  rentalBookingPath = () => getRentalBookingPath(this.lang());

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Skip video on slow/save-data connections
    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (conn) {
      if (
        conn.saveData ||
        conn.effectiveType === 'slow-2g' ||
        conn.effectiveType === '2g'
      ) {
        return;
      }
    }

    // Keep mobile lightweight for better Core Web Vitals
    if (window.innerWidth < 768) {
      return;
    }

    this.videoEnabled.set(true);

    // Delay startup slightly so first paint/hydration can settle.
    this.setupTimer = setTimeout(() => this.setupVideoPlayback(), 1200);
  }

  ngAfterViewInit(): void {
    this.setupVideoPlayback();
  }

  private setupVideoPlayback(): void {
    if (
      !isPlatformBrowser(this.platformId) ||
      !this.videoEnabled() ||
      this.setupDone
    )
      return;

    const video = this.videoRef?.nativeElement;
    if (!video) {
      // On first load/hydration the @if block may render a tick later.
      if (this.setupRetries < 12) {
        this.setupRetries += 1;
        setTimeout(() => this.setupVideoPlayback(), 200);
      }
      return;
    }

    this.setupDone = true;

    // Play only when hero is in the viewport
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              /* autoplay blocked, silent fail */
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 },
    );
    this.intersectionObserver.observe(video.closest('section') ?? video);

    // Pause when tab loses focus — save CPU & bandwidth
    this.visibilityHandler = () => {
      if (document.hidden) {
        video.pause();
      } else {
        if (this.isHeroVisible()) {
          video.play().catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  onVideoReady(): void {
    const video = this.videoRef?.nativeElement;
    if (!video) return;

    if (this.isHeroVisible() && !document.hidden) {
      video.play().catch(() => {});
    }
  }

  /** Cycle to next video when current one ends */
  onVideoEnded(): void {
    this.currentIndex.update((i) => (i + 1) % this.VIDEO_LIST.length);
    // After src changes, give Angular one tick then play
    setTimeout(() => {
      const video = this.videoRef?.nativeElement;
      if (video) {
        video.load();
        video.play().catch(() => {});
      }
    }, 50);
  }

  private isHeroVisible(): boolean {
    const section = this.videoRef?.nativeElement?.closest('section');
    if (!section) return false;
    const rect = section.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  // Smooth scroll to next section
  scrollToContent(): void {
    setTimeout(() => {
      const nextSection = document.querySelector('section:not(.hero-2026)');
      nextSection?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.setupTimer) {
      clearTimeout(this.setupTimer);
    }
    this.intersectionObserver?.disconnect();
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }
}
