import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../shared/services/user.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { User } from '../shared/model/User';

@Component({
  selector: 'app-profile-editor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavbarComponent],
  templateUrl: './profile-editor.component.html',
  styleUrl: './profile-editor.component.scss'
})
export class ProfileEditorComponent {
  user?: User;
  date?: string;
  profileForm!: FormGroup;
  selectedFile: File | null = null;
  
  constructor(
    private formBuilder: FormBuilder,
    private location: Location,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.userService.getCurrent().subscribe({
      next: (data) => {
        this.user = data;
      }, error: (err) => {
        console.log(err);
      }
    });
    this.profileForm = this.formBuilder.group({
      name: [''],
      image: [''],
      birthday: [''],
      email: ['', Validators.email],
      password: ['', Validators.minLength(8)],
      confirmPassword: ['']
    }, {
      validator: this.mustMatch('password', 'confirmPassword')
    })
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  }

  atleastOneFilled(controlName1: string, controlName2: string, controlName3: string, controlName4: string, controlName5: string) {
    return (formGroup: FormGroup) => {
      const control1 = formGroup.controls[controlName1];
      const control2 = formGroup.controls[controlName2];
      const control3 = formGroup.controls[controlName3];
      const control4 = formGroup.controls[controlName4];
      const control5 = formGroup.controls[controlName5];
      if (control1.errors && control1.errors['atleastOne']) {
        return;
      }
      if (control1.value === '' && control2.value === '' && control3.value === '' && control4.value === '' && control5.value === '') {
        control1.setErrors({ atleastOne: true });
      } else {
        control1.setErrors(null);
      }
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.profileForm.valid) {
      const formData = new FormData();
      if (this.profileForm.value['name'] !== '') {
        formData.append('name', this.profileForm.value['name']);
      }
      if (this.profileForm.value['birthday'] !== '') {
        formData.append('birthday', this.profileForm.value['birthday']);
      }
      if (this.profileForm.value['email'] !== '') {
        formData.append('email', this.profileForm.value['email']);
      }
      if (this.profileForm.value['password'] !== '') {
        formData.append('password', this.profileForm.value['password']);
      }
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
      console.log(formData);
      this.userService.update(formData).subscribe({
        next: (data) => {
          console.log(data);
        }, error: (err) => {
          console.log(err);
        }
      });
    } else {
      console.log('Form is not valid.');
    }
  }

  goBack() {
    this.location.back();
  }
}
