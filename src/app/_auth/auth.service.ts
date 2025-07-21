import { Injectable } from '@angular/core';
import { CacheService } from './cache.service';
import jwt_decode from 'jwt-decode';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends CacheService {
  private apiUrl = 'https://votre-api.com/auth';
  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private  http:HttpClient, private router:Router) {
    super();
   
   }

   getToken(): string {
    return this.getItem('jwt') ?? '';
  }
  
  protected setToken(jwt: string) {
    this.setItem('jwt', jwt);
  } 

  protected clearToken() {
    this.removeItem('jwt');
  }
  protected hasExpiredToken(): boolean {
    const jwt = this.getToken();

    if (jwt) {
      const payload = jwt_decode(jwt) as any;
      return Date.now() >= payload.exp * 1000;
    }

    return true;
  }
  login(netId: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { netId, password });
  }

  handleLoginResponse(response: any): void {
    if (response.resultCode === 1) {
      this.loggedIn.next(true);
      localStorage.setItem('authToken', response.token);
      this.router.navigate(['/application/profile']);
    } else if (response.resultCode === -1) {
      throw new Error('Invalid credentials');
    } else if (response.resultCode === -2) {
      throw new Error('Account locked - too many failed attempts');
    }
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }
}
