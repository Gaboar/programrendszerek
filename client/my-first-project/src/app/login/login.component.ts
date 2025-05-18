import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService) { }

  login() {
    if (this.email && this.password) {
      this.errorMessage = '';
      this.authService.login(this.email, this.password).subscribe({
        next: (data) => {
          if (data) {
            console.log(data);
            this.router.navigateByUrl('/timeline');
          }
        }, error: (err) => {
          console.log(err);
        },
      })
    } else {
      this.errorMessage = 'Form is empty.';
    }
  }

  navigate(to: string) {
    this.router.navigateByUrl(to);
  }

}
