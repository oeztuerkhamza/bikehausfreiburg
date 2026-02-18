import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <!-- Animated background shapes -->
      <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>

      <div class="login-card">
        <div class="login-header">
          <div class="logo-wrap">
            <img src="assets/logo.svg" alt="Bike Haus" class="login-logo" />
          </div>
          <h1>BikeHaus</h1>
          <span class="subtitle">Freiburg</span>
          <p>{{ t.welcomeBack }}</p>
        </div>

        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="form-group">
            <label for="username">{{ t.username }}</label>
            <div class="input-wrap">
              <svg
                class="input-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="text"
                id="username"
                [(ngModel)]="username"
                name="username"
                [placeholder]="t.usernameEnter"
                autocomplete="username"
                required
                [class.error]="errorMessage"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">{{ t.password }}</label>
            <div class="input-wrap">
              <svg
                class="input-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type="password"
                id="password"
                [(ngModel)]="password"
                name="password"
                [placeholder]="t.passwordEnter"
                autocomplete="current-password"
                required
                [class.error]="errorMessage"
              />
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn-login" [disabled]="loading">
            <span *ngIf="!loading">{{ t.login }}</span>
            <span *ngIf="loading" class="loading-state">
              <span class="spinner"></span> {{ t.loginLoading }}
            </span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .login-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: linear-gradient(
          135deg,
          #0f172a 0%,
          #1e293b 40%,
          #312e81 100%
        );
        padding: 20px;
        position: relative;
        overflow: hidden;
      }

      /* Animated background shapes */
      .bg-shapes {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
      }
      .shape {
        position: absolute;
        border-radius: 50%;
        opacity: 0.08;
        filter: blur(60px);
      }
      .shape-1 {
        width: 500px;
        height: 500px;
        background: #6366f1;
        top: -10%;
        right: -5%;
        animation: float1 20s ease-in-out infinite;
      }
      .shape-2 {
        width: 400px;
        height: 400px;
        background: #818cf8;
        bottom: -10%;
        left: -5%;
        animation: float2 25s ease-in-out infinite;
      }
      .shape-3 {
        width: 300px;
        height: 300px;
        background: #4f46e5;
        top: 40%;
        left: 30%;
        animation: float3 18s ease-in-out infinite;
      }

      @keyframes float1 {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }
        50% {
          transform: translate(-40px, 30px) scale(1.1);
        }
      }
      @keyframes float2 {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }
        50% {
          transform: translate(30px, -40px) scale(1.15);
        }
      }
      @keyframes float3 {
        0%,
        100% {
          transform: translate(0, 0) scale(1);
        }
        50% {
          transform: translate(-20px, -30px) scale(1.05);
        }
      }

      .login-card {
        background: rgba(255, 255, 255, 0.97);
        backdrop-filter: blur(20px);
        border-radius: 24px;
        padding: 48px 44px;
        width: 100%;
        max-width: 440px;
        box-shadow:
          0 25px 50px rgba(0, 0, 0, 0.25),
          0 0 0 1px rgba(255, 255, 255, 0.1);
        position: relative;
        z-index: 1;
        animation: cardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
      }
      @keyframes cardIn {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .login-header {
        text-align: center;
        margin-bottom: 36px;
      }

      .logo-wrap {
        width: 72px;
        height: 72px;
        margin: 0 auto 18px;
        border-radius: 18px;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
      }
      .login-logo {
        width: 42px;
        height: 42px;
        filter: brightness(0) invert(1);
      }

      .login-header h1 {
        font-size: 1.65rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
        letter-spacing: -0.02em;
      }
      .login-header .subtitle {
        display: block;
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: #6366f1;
        margin-top: 2px;
      }
      .login-header p {
        font-size: 0.88rem;
        color: #64748b;
        margin: 12px 0 0;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 22px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .form-group label {
        font-size: 0.82rem;
        font-weight: 600;
        color: #475569;
        letter-spacing: 0.01em;
      }

      .input-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      .input-icon {
        position: absolute;
        left: 14px;
        color: #94a3b8;
        pointer-events: none;
        transition: color 0.2s;
      }
      .input-wrap:focus-within .input-icon {
        color: #6366f1;
      }
      .form-group input {
        width: 100%;
        padding: 13px 14px 13px 44px;
        border: 1.5px solid #e2e8f0;
        border-radius: 12px;
        font-size: 0.92rem;
        font-family: inherit;
        transition: all 0.2s;
        outline: none;
        background: #f8fafc;
        color: #1e293b;
      }
      .form-group input:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        background: #fff;
      }
      .form-group input.error {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.08);
      }

      .error-message {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #ef4444;
        font-size: 0.84rem;
        font-weight: 500;
        text-align: center;
        padding: 10px 14px;
        background: rgba(239, 68, 68, 0.06);
        border: 1px solid rgba(239, 68, 68, 0.15);
        border-radius: 10px;
        animation: fadeIn 0.25s ease;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .btn-login {
        padding: 14px;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: #fff;
        border: none;
        border-radius: 12px;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        overflow: hidden;
        letter-spacing: 0.01em;
        margin-top: 4px;
      }
      .btn-login::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.12) 0%,
          transparent 100%
        );
        pointer-events: none;
      }
      .btn-login:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
      }
      .btn-login:active:not(:disabled) {
        transform: translateY(0);
      }
      .btn-login:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 480px) {
        .login-card {
          padding: 36px 28px;
          border-radius: 20px;
        }
      }
    `,
  ],
})
export class LoginComponent {
  private translationService = inject(TranslationService);
  username = '';
  password = '';
  errorMessage = '';
  loading = false;

  get t() {
    return this.translationService.translations();
  }

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  onLogin() {
    this.errorMessage = '';
    this.loading = true;

    this.authService
      .login({ username: this.username, password: this.password })
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || this.t.loginFailed;
        },
      });
  }
}
