import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post('http://localhost:5000/app/login', body, {headers: headers, withCredentials: true});
  }

  register(user: User) {
    const body = new URLSearchParams();
    body.set('name', user.name);
    body.set('birthday', user.birthday);
    body.set('email', user.email);
    body.set('password', user.password);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post('http://localhost:5000/app/register', body, {headers: headers});
  }

  logout() {
    return this.http.post('http://localhost:5000/app/logout', {}, {withCredentials: true, responseType: 'text'});
  }

  checkAuth() {
    return this.http.get<boolean>('http://localhost:5000/app/checkAuth', {withCredentials: true});
  }

  checkAdmin() {
    return this.http.get<boolean>('http://localhost:5000/app/checkAdmin', {withCredentials: true});
  }
}
