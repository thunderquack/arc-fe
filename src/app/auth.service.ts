import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn = false;

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<boolean> {
    // Stub follows
    if (username === 'user' && password === 'password') {
      this.isLoggedIn = true;
      return of(true);
    } else {
      return of(false);
    }
  }

  logout() {
    this.isLoggedIn = false;
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }
}
