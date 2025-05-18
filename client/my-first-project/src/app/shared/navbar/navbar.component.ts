import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { User } from '../model/User';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { SearchResult } from '../model/searchResult';
import { GroupService } from '../services/group.service';
import { Group } from '../model/Group';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatToolbarModule, MatIconModule, MatAutocompleteModule, MatInputModule, MatFormFieldModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  user?: User;
  isAdmin?: boolean;
  searchTerm: string = '';
  searchResults: SearchResult[] = [];
  private searchSubject = new Subject<string>();

  constructor(
    private userService: UserService,
    private groupService: GroupService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userService.getCurrent().subscribe({
      next: (data) => {
        this.user = data;
      }, error: (err) => {
        console.log(err);
      }
    });
    this.authService.checkAdmin().subscribe({
      next: (data) => {
        this.isAdmin = data;
      }, error: (err) => {
        console.log(err);
      }
    })
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchTerm => this.userService.getByName(searchTerm))
    ).subscribe({
      next: (data) => {
        data.forEach((user: User) => {
          this.searchResults.push({
            name: user.name,
            imageUrl: user.imageUrl,
            link: `/profile/${user._id}`
          })
        })
      }, error: (err) => {
        console.log(err);
      }
    });
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchTerm => this.groupService.getByName(searchTerm))
    ).subscribe({
      next: (data) => {
        data.forEach((group: Group) => {
          this.searchResults.push({
            name: group.name,
            imageUrl: group.imageUrl,
            link: `/group/${group._id}`
          })
        })
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  navigate(dest: string) {
    console.log(`navigate to ${dest}`);
    this.router.navigateByUrl(dest);
  }

  onSearch() {
    this.searchResults = [];
    this.searchSubject.next(this.searchTerm.trim());
  }

  logout() {
    this.authService.logout().subscribe({
      next: (data) => {
        console.log(data);
        this.router.navigateByUrl('/login');
      }, error: (err) => {
        console.log(err);
      }
    })
  }
}
