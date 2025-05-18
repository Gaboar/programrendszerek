import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { PostService } from '../services/post.service';
import { User } from '../model/User';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-post-creator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatButtonModule],
  templateUrl: './post-creator.component.html',
  styleUrl: './post-creator.component.scss'
})
export class PostCreatorComponent {
  @Input() loc!: string
  user!: User;
  postForm!: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private userService: UserService,
    private postService: PostService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.userService.getCurrent().subscribe({
      next: (data) => {
        this.user = data;
      }, error: (err) => {
        console.log(err);
      }
    });
    this.postForm = this.formBuilder.group({
      text: [''],
      image: ['']
    }, {
      validator: this.atleastOneFilled('text', 'image')
    });
  }

  atleastOneFilled(controlName1: string, controlName2: string) {
    return (formGroup: FormGroup) => {
      const control1 = formGroup.controls[controlName1];
      const control2 = formGroup.controls[controlName2];
      if (control1.errors && control1.errors['atleastOne']) {
        return;
      }
      if (control1.value === '' && control2.value === '') {
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
    if (this.postForm.valid) {
      const formData = new FormData();
      formData.append('location', this.loc);
      formData.append('author', this.user._id);
      formData.append('date', new Date().toString());
      formData.append('text', this.postForm.value['text']);
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
      console.log(formData)
      this.postService.publish(formData).subscribe({
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
}
