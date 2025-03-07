import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RoleService } from '../../../../core/services/role.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CustomValidators } from '../../../../shared/directives/validators/Validators';
import { CookieService } from 'ngx-cookie-service';
import { Location } from '@angular/common';
import { NotificationService } from '../../../../shared/directives/notifications/notification.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  imports:[RouterModule,MatProgressSpinnerModule,MatIconModule,CommonModule ,ReactiveFormsModule,MatFormFieldModule,MatButtonModule, MatInputModule, MatSelectModule],
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent {
  userForm: FormGroup;
  roles: string[] = [];
  isLoading = false; // Kiểm soát trạng thái loading toàn màn hình

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private userService: UserService,
    private router: Router,
   private location :Location,
   private notificationService: NotificationService
  ) {
    this.userForm = this.fb.group({
      lastName: ['', [CustomValidators.nameValidator]],
      middleName: ['', []],
      firstName: ['', [CustomValidators.nameValidator]],
      email: ['', [Validators.required, Validators.email]],
      gender: [2, Validators.required], // Mặc định: Nữ
      roleName: [1, Validators.required]
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.fetchRoles();
  }

  fetchRoles() {
    this.roleService.getRoles().subscribe(
      (data: string[]) => {
        this.roles = data.filter(role => role !== "Customer"); // Lọc bỏ "Customer"
        this.isLoading = false;
      },
      (error) => {
        console.error('Lỗi khi lấy danh sách roles:', error);
        this.isLoading = false;
      }
    );
}

  goBack(): void {
    this.userForm.reset();  // Reset form fields
    this.userForm.markAsPristine();  // Ensure form is not dirty
    this.userForm.markAsUntouched();  // Prevent validation messages from reappearing
  
    this.isLoading = false; // Ensure loading is false before navigating
    this.location.back(); // Navigate back
  }
  onSubmit() {
    if (this.userForm.invalid) return;

    this.isLoading = true; // Bật loading toàn màn hình
    const userData = {
      ...this.userForm.value,
      middleName: this.userForm.value.middleName ? this.userForm.value.middleName.trim() : "" 
    };

    console.log("data: ", userData)
    this.userService.createUser(userData).subscribe({
      next: (response) => {
        this.notificationService.showSwal(
          'Thành công!',
          'Tài khoản đã được tạo!',
          'success',
          'OK',
          false
        ).then(() => {
          this.router.navigate(['/view-user']); 
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
  
        // Check if the error response contains validation errors
        if (error.error?.errors?.Email && error.error.errors.Email.length > 0) {
          const errorMessage = error.error.errors.Email[0]; // Get the first email validation message
          this.notificationService.showSwal(
            'Lỗi!',
            errorMessage,
            'error',
            'Thử lại',
            false
          );
        } else {
          // Fallback message if no specific email error is found
          this.notificationService.showSwal(
            'Lỗi!',
            error.error.message || 'Không thể tạo tài khoản.',
            'error',
            'Thử lại',
            false
          );
        }
      }
    });
    
  }
}
