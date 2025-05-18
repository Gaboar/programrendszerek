import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../shared/services/user.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { User } from '../shared/model/User';
import { GroupService } from '../shared/services/group.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group-creator',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavbarComponent],
  templateUrl: './group-creator.component.html',
  styleUrl: './group-creator.component.scss'
})
export class GroupCreatorComponent {
  user?: User;
  date?: string;
  groupForm!: FormGroup;
  selectedFile: File | null = null;
  
  constructor(
    private formBuilder: FormBuilder,
    private location: Location,
    private userService: UserService,
    private groupService: GroupService,
    private router: Router
  ) { }

  ngOnInit() {
    this.groupForm = this.formBuilder.group({
      name: ['', Validators.required],
      image: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.groupForm.valid) {
      const formData = new FormData();
      formData.append('name', this.groupForm.value['name']);
      formData.append('description', this.groupForm.value['description']);
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
      console.log(formData);
      this.groupService.create(formData).subscribe({
        next: (data) => {
          console.log(data);
          this.userService.joinGroup(data._id).subscribe({
            next: (data) => {
              console.log(data);
            }, error: (err) => {
              console.log(err);
            }
          });
          this.router.navigateByUrl(`/group/${data._id}`)
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
