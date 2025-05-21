import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { User } from '../shared/model/User';
import { Post } from '../shared/model/Post';
import { UserService } from '../shared/services/user.service';
import { PostService } from '../shared/services/post.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { PostCreatorComponent } from '../shared/post-creator/post-creator.component';
import { switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent, PostCreatorComponent, MatButtonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  user?: User;
  currentUser?: User;
  posts?: Post[];
  authors: {[userid: string]: User} = {};
  isFriends?: string;
  sender?: string;

  constructor(
    private userService: UserService,
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.userService.getCurrent().subscribe({
      next: (data) => {
        this.currentUser = data;
      }, error: (err) => {
        console.log(err);
      }
    });
    this.route.params.pipe(
      switchMap(params => this.userService.getById(params['userid']))
    ).subscribe({
      next: (data) => {
        this.user = data;
      }, error: (err) => {
        console.log(err);
      }
    });
    this.route.params.pipe(
      switchMap(params => this.postService.getPublicByUser(params['userid']))
    ).subscribe({
      next: (data) => {
        this.posts = data;
        this.posts.forEach(post => {
          if (!this.authors[post.author]) {
            this.userService.getById(post.author).subscribe({
              next: (data) => {
                this.authors[post.author] = data;
              }, error: (err) => {
                console.log(err);
              }
            });
          }
        });
      }, error: (err) => {
        console.log(err);
      }
    });
    this.route.params.pipe(
      switchMap(params => this.userService.isFriends(params['userid']))
    ).subscribe({
      next: (data) => {
        console.log(data)
        if (data) {
          this.isFriends = data.accepted ? 'true' : 'pending';
          this.sender = data.user1;
        } else {
          this.isFriends = 'false';
          this.sender = this.currentUser?._id;
        }
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  addFriend() {
    this.userService.addFriend(this.route.snapshot.params['userid']).subscribe({
      next: (data) => {
        console.log(data);
        this.updateFriend();
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  removeFriend() {
    this.userService.removeFriend(this.route.snapshot.params['userid']).subscribe({
      next: (data) => {
        console.log(data);
        this.updateFriend();
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  acceptFriend() {
    this.userService.acceptFriend(this.route.snapshot.params['userid']).subscribe({
      next: (data) => {
        console.log(data);
        this.updateFriend();
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  updateFriend() {
    this.userService.isFriends(this.route.snapshot.params['userid']).subscribe({
      next: (data) => {
        console.log(data)
        if (data) {
          this.isFriends = data.accepted ? 'true' : 'pending';
          this.sender = data.user1;
        } else {
          this.isFriends = 'false';
          this.sender = this.currentUser?._id;
        }
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  navigate(dest: string) {
    console.log(`navigate to ${dest}`);
    this.router.navigateByUrl(dest);
  }
}
