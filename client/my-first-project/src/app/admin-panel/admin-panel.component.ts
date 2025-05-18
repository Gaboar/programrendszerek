import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../shared/model/User';
import { Group } from '../shared/model/Group';
import { Post } from '../shared/model/Post';
import { Friend } from '../shared/model/Friend';
import { Member } from '../shared/model/GroupMember';
import { UserService } from '../shared/services/user.service';
import { GroupService } from '../shared/services/group.service';
import { PostService } from '../shared/services/post.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent {
  users: User[] = [];
  groups: Group[] = [];
  posts: Post[] = [];
  friends: Friend[] = [];
  members: Member[] = [];

  constructor(
    private userService: UserService,
    private groupService: GroupService,
    private postService: PostService
  ) { }

  ngOnInit() {
    this.getAllUsers();
    this.getAllGroups();
    this.getAllPosts();
    this.getAllFriends();
    this.getAllMembers();
  }

  getAllUsers() {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  getAllGroups() {
    this.groupService.getAll().subscribe({
      next: (data) => {
        this.groups = data;
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  getAllPosts() {
    this.postService.getAll().subscribe({
      next: (data) => {
        this.posts = data;
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  getAllFriends() {
    this.userService.getAllFriends().subscribe({
      next: (data) => {
        this.friends = data;
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  getAllMembers() {
    this.groupService.getAllMembers().subscribe({
      next: (data) => {
        this.members = data;
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  deleteUser(id: string) {
    this.userService.delete(id).subscribe({
      next: (data) => {
        console.log(data);
        this.getAllUsers();
        this.getAllFriends();
        this.getAllMembers();
        this.getAllPosts();
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  deleteGroup(id: string) {
    this.groupService.delete(id).subscribe({
      next: (data) => {
        console.log(data);
        this.getAllGroups();
        this.getAllMembers();
        this.getAllPosts();
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  deletePost(id: string) {
    this.postService.delete(id).subscribe({
      next: (data) => {
        console.log(data);
        this.getAllPosts();
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  deleteFriend(id: string) {
    this.userService.deleteFriend(id).subscribe({
      next: (data) => {
        console.log(data);
        this.getAllFriends();
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  deleteMember(id: string) {
    this.groupService.deleteMember(id).subscribe({
      next: (data) => {
        console.log(data);
        this.getAllMembers();
      }, error: (err) => {
        console.log(err);
      }
    });
  }
}
