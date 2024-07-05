import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'authToken';

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<{ token: string }>(`/api/login`, { username, password })
      .pipe(
        map(response => {
          if (response.token) {
            localStorage.setItem(this.tokenKey, response.token);
            return true;
          }
          return false;
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            console.error('Client-side error:', error.error.message);
          } else {
            console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
          }
          return of(false);
        })
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
