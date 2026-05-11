import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
})
export class HeroSectionComponent {
  constructor() {}

  // Smooth scroll to next section
  scrollToContent(): void {
    setTimeout(() => {
      const nextSection = document.querySelector('section:not(.hero-2026)');
      nextSection?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
}
