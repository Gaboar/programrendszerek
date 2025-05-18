import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../model/User';
import { Friend } from '../model/Friend';
import { Member } from '../model/GroupMember';
import { Group } from '../model/Group';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<User[]>('http://localhost:5000/app/getAllUsers', {withCredentials: true});
  }

  getAllFriends() {
    return this.http.get<Friend[]>('http://localhost:5000/app/getAllFriends', {withCredentials: true});
  }

  delete(id: string) {
    const body = new URLSearchParams();
    body.set('id', id);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post('http://localhost:5000/app/deleteUser', body, {headers: headers, withCredentials: true});
  }

  deleteFriend(id: string) {
    const body = new URLSearchParams();
    body.set('id', id);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post('http://localhost:5000/app/deleteFriend', body, {headers: headers, withCredentials: true});
  }

  getCurrent() {
    return this.http.get<User>('http://localhost:5000/app/getCurrentUser', {withCredentials: true});
  }

  getById(userid: string) {
    const body = new URLSearchParams();
    body.set('userid', userid);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<User>('http://localhost:5000/app/getUserById', body, {headers: headers, withCredentials: true});
  }

  getByName(name: string) {
    if (name === '') {
      return [];
    }
    const body = new URLSearchParams();
    body.set('name', name);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<User[]>('http://localhost:5000/app/getUserByName', body, {headers: headers, withCredentials: true});
  }

  update(data: FormData) {
    return this.http.post('http://localhost:5000/app/updateUser', data, {withCredentials: true});
  }

  addFriend(userid: string) {
    const body = new URLSearchParams();
    body.set('userid', userid);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post('http://localhost:5000/app/addFriend', body, {headers: headers, withCredentials: true});
  }

  removeFriend(userid: string) {
    const body = new URLSearchParams();
    body.set('userid', userid);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post('http://localhost:5000/app/removeFriend', body, {headers: headers, withCredentials: true});
  }

  acceptFriend(userid: string) {
    const body = new URLSearchParams();
    body.set('userid', userid);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post('http://localhost:5000/app/acceptFriend', body, {headers: headers, withCredentials: true});
  }

  getFriends(userid: string) {
    const body = new URLSearchParams();
    body.set('userid', userid);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<User[]>('http://localhost:5000/app/getFriends', body, {headers: headers, withCredentials: true});
  }

  isFriends(userid: string) {
    const body = new URLSearchParams();
    body.set('userid', userid);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<Friend>('http://localhost:5000/app/isFriends', body, {headers: headers, withCredentials: true});
  }

  joinGroup(groupid: string) {
    const body = new URLSearchParams();
    body.set('groupid', groupid);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post('http://localhost:5000/app/joinGroup', body, {headers: headers, withCredentials: true});
  }

  leaveGroup(groupid: string) {
    const body = new URLSearchParams();
    body.set('groupid', groupid);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post('http://localhost:5000/app/leaveGroup', body, {headers: headers, withCredentials: true});
  }

  getGroups(userid: string) {
    const body = new URLSearchParams();
    body.set('userid', userid);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<Group[]>('http://localhost:5000/app/getGroups', body, {headers: headers, withCredentials: true});
  }

  isInGroup(groupid: string) {
    const body = new URLSearchParams();
    body.set('groupid', groupid);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<boolean>('http://localhost:5000/app/isInGroup', body, {headers: headers, withCredentials: true});
  }
}
