import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Post } from '../model/Post';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Post[]>('http://localhost:5000/app/getAllPosts', {withCredentials: true});
  }

  publish(data: FormData) {
    return this.http.post('http://localhost:5000/app/createPost', data, {withCredentials: true});
  }

  delete(id: string) {
    const body = new URLSearchParams();
    body.set('id', id);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post('http://localhost:5000/app/deletePost', body, {headers: headers, withCredentials: true});
  }

  getByLocation(location: string) {
    const body = new URLSearchParams();
    body.set('location', location);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<Post[]>('http://localhost:5000/app/getPostByLocation', body, {headers: headers, withCredentials: true});
  }

  getPublicByUser(userid: string) {
    const body = new URLSearchParams();
    body.set('userid', userid);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<Post[]>('http://localhost:5000/app/getPublicPostByUser', body, {headers: headers, withCredentials: true});
  }

  getUserTimeline() {
    return this.http.get<Post[]>('http://localhost:5000/app/getUserTimeline', {withCredentials: true});
  }
}
