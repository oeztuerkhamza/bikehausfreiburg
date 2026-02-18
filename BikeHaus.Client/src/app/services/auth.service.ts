import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  displayName: string;
  role: string;
  expiresAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private url = `${environment.apiUrl}/auth`;
  isLoggedIn = signal(this.hasValidToken());
  displayName = signal(localStorage.getItem('displayName') || '');

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/login`, request).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('displayName', res.displayName);
        localStorage.setItem('role', res.role);
        localStorage.setItem('expiresAt', res.expiresAt);
        this.isLoggedIn.set(true);
        this.displayName.set(res.displayName);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('displayName');
    localStorage.removeItem('role');
    localStorage.removeItem('expiresAt');
    this.isLoggedIn.set(false);
    this.displayName.set('');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('expiresAt');
    if (!token || !expiresAt) return false;
    return new Date(expiresAt) > new Date();
  }
}
