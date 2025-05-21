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
import { GroupService } from '../shared/services/group.service';
import { Group } from '../shared/model/Group';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [CommonModule, NavbarComponent, PostCreatorComponent, MatButtonModule],
  templateUrl: './group.component.html',
  styleUrl: './group.component.scss'
})
export class GroupComponent {
  group?: Group;
  currentUser?: User;
  posts?: Post[];
  authors: {[userid: string]: User} = {};
  isInGroup?: boolean;

  constructor(
    private userService: UserService,
    private postService: PostService,
    private groupService: GroupService,
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
      switchMap(params => this.groupService.getById(params['groupid']))
    ).subscribe({
      next: (data) => {
        this.group = data;
      }, error: (err) => {
        console.log(err);
      }
    });
    this.route.params.pipe(
      switchMap(params => this.userService.isInGroup(params['groupid']))
    ).subscribe({
      next: (data) => {
        if (data) {
          this.isInGroup = true;
          this.getPosts();
        } else {
          this.isInGroup = false;
          this.posts = [];
          this.authors = {};
        }
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  joinGroup() {
    this.userService.joinGroup(this.route.snapshot.params['groupid']).subscribe({
      next: (data) => {
        console.log(data);
        this.updateMembership();
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  leaveGroup() {
    this.userService.leaveGroup(this.route.snapshot.params['groupid']).subscribe({
      next: (data) => {
        console.log(data);
        this.updateMembership();
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  updateMembership() {
    this.userService.isInGroup(this.route.snapshot.params['groupid']).subscribe({
      next: (data) => {
        if (data) {
          this.isInGroup = true;
          this.getPosts();
        } else {
          this.isInGroup = false;
          this.posts = [];
          this.authors = {};
        }
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  getPosts() {
    this.postService.getByLocation(this.route.snapshot.params['groupid']).subscribe({
      next: (data) => {
        if (data) {
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
