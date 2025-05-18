import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Group } from '../model/Group';
import { User } from '../model/User';
import { Member } from '../model/GroupMember';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Group[]>('http://localhost:5000/app/getAllGroups', {withCredentials: true});
  }

  getAllMembers() {
    return this.http.get<Member[]>('http://localhost:5000/app/getAllMembers', {withCredentials: true});
  }

  delete(id: string) {
    const body = new URLSearchParams();
    body.set('id', id);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post('http://localhost:5000/app/deleteGroup', body, {headers: headers, withCredentials: true});
  }

  deleteMember(id: string) {
    const body = new URLSearchParams();
    body.set('id', id);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post('http://localhost:5000/app/deleteMember', body, {headers: headers, withCredentials: true});
  }

  getById(groupid: string) {
    const body = new URLSearchParams();
    body.set('groupid', groupid);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<Group>('http://localhost:5000/app/getGroupById', body, {headers: headers, withCredentials: true});
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
    return this.http.post<Group[]>('http://localhost:5000/app/getGroupByName', body, {headers: headers, withCredentials: true});
  }

  getMembers(groupid: string) {
    const body = new URLSearchParams();
    body.set('groupid', groupid);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<User[]>('http://localhost:5000/app/getMembers', body, {headers: headers, withCredentials: true});
  }

  create(data: FormData) {
    return this.http.post<Group>('http://localhost:5000/app/createGroup', data, {withCredentials: true});
  }
}
