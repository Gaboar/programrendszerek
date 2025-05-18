import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { User } from '../shared/model/User';
import { UserService } from '../shared/services/user.service';
import { PostService } from '../shared/services/post.service';
import { Router } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { PostCreatorComponent } from '../shared/post-creator/post-creator.component';
import { Post } from '../shared/model/Post';
import { Group } from '../shared/model/Group';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, NavbarComponent, PostCreatorComponent],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss'
})
export class TimelineComponent {
  posts?: Post[];
  friends?: User[] = [];
  groups?: Group[] = [];

  constructor(
    private userService: UserService,
    private postService: PostService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userService.getCurrent().subscribe({
      next: (data) => {
        this.userService.getFriends(data._id).subscribe({
          next: (data) => {
            console.log(data)
            this.friends = data;
          }, error: (err) => {
            console.log(err);
          }
        });
        this.userService.getGroups(data._id).subscribe({
          next: (data) => {
            console.log(data)
            this.groups = data;
          }, error: (err) => {
            console.log(err);
          }
        });
      }, error: (err) => {
        console.log(err);
      }
    });
    this.postService.getUserTimeline().subscribe({
      next: (data) => {
        this.posts = data;
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
