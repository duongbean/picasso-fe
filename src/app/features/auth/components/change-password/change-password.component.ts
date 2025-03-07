import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  ChangePasswordRequest,
  ForgotPasswordRequest,
} from '../../models/user.model';

import Swal from 'sweetalert2';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Location } from '@angular/common';

@Component({
  selector: 'app-change-password',
  imports: [
    MatIconModule,
    MatIcon,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  constructor(
    private route: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private location: Location
  ) {
    //form builder to validate input
    this.requestChangePasswordForm = this.formBuilder.group({
      currentPasswordInput: new FormControl('', Validators.required),
      newPasswordInput: new FormControl('', [
        Validators.required,
        Validators.pattern(
          /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])[^\s]{8,}$/
        ),
      ]),
      reNewPasswordInput: new FormControl('', [Validators.required]),
    });
  }

  // loading API status:
  loading: boolean = false;

  // form group
  requestChangePasswordForm = new FormGroup({
    currentPasswordInput: new FormControl('', Validators.required),
    newPasswordInput: new FormControl('', Validators.required),
    reNewPasswordInput: new FormControl('', Validators.required),
  });
  get currentPasswordInput() {
    return this.requestChangePasswordForm.get('currentPasswordInput');
  }

  get newPasswordInput() {
    return this.requestChangePasswordForm.get('newPasswordInput');
  }
  get reNewPasswordInput() {
    return this.requestChangePasswordForm.get('reNewPasswordInput');
  }

  passwordVisible: boolean = true;

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
  passwordVisible1: boolean = true;

  togglePasswordVisibility1() {
    this.passwordVisible1 = !this.passwordVisible1;
  }
  passwordVisible2: boolean = true;

  togglePasswordVisibility2() {
    this.passwordVisible2 = !this.passwordVisible2;
  }
  goBack(): void {
    this.location.back(); // Quay lại trang trước đó
  }

  submitChangePassword() {
    // Reset lỗi trước khi kiểm tra lại
    this.currentPasswordInput?.setErrors(null);
    this.newPasswordInput?.setErrors(null);
    this.reNewPasswordInput?.setErrors(null);

    let hasError = false;

    // Kiểm tra các field không được để trống
    if (!this.currentPasswordInput?.value) {
      this.currentPasswordInput?.setErrors({ required: true });
      hasError = true;
    }
    if (!this.newPasswordInput?.value) {
      this.newPasswordInput?.setErrors({ required: true });
      hasError = true;
    }
    if (!this.reNewPasswordInput?.value) {
      this.reNewPasswordInput?.setErrors({ required: true });
      hasError = true;
    }

    // Kiểm tra các field không được để trống
    if (!this.currentPasswordInput?.value) {
      this.currentPasswordInput?.setErrors({ requiredOnSubmit: true });
      hasError = true;
    }
    if (!this.newPasswordInput?.value) {
      this.newPasswordInput?.setErrors({ requiredOnSubmit: true });
      hasError = true;
    }
    if (!this.reNewPasswordInput?.value) {
      this.reNewPasswordInput?.setErrors({ requiredOnSubmit: true });
      hasError = true;
    }

    // Kiểm tra pattern của newPasswordInput
    const passwordPattern =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])[^\s]{8,}$/;
    if (
      this.newPasswordInput?.value &&
      !passwordPattern.test(this.newPasswordInput.value)
    ) {
      this.newPasswordInput?.setErrors({ pattern: true });
      hasError = true;
    }

    // Kiểm tra reNewPasswordInput phải trùng với newPasswordInput
    if (this.newPasswordInput?.value !== this.reNewPasswordInput?.value) {
      this.reNewPasswordInput?.setErrors({ passwordDoNotMatch: true });
      hasError = true;
    }

    // Nếu có lỗi, dừng lại và không gọi API
    if (hasError) {
      console.log('Form có lỗi, vui lòng kiểm tra lại.');
      return;
    }

    console.log('current pass: ', this.currentPasswordInput?.value);
    console.log('new pass: ', this.newPasswordInput?.value);
    console.log('re new pass: ', this.reNewPasswordInput?.value);

    const changePasswordRequest: ChangePasswordRequest = {
      currentPassword: String(this.currentPasswordInput?.value),
      newPassword: String(this.newPasswordInput?.value),
      confirmPassword: String(this.reNewPasswordInput?.value),
    };

    console.log('Begin call API change password:');

    // Hiển thị loading trong khi gọi API
    this.loading = true;
    this.authService.changePassword(changePasswordRequest).subscribe(
      (data) => {
        this.loading = false;
        console.log('API response - change password: ', data);
        Swal.fire({
          icon: 'success',
          title: 'Mật khẩu đã được đổi thành công',
          html: 'Bạn vui lòng đăng nhập lại với mật khẩu mới!',
          confirmButtonText: 'OK',
          timer: 5000,
          timerProgressBar: true,
        });
        this.route.navigate(['/login']);
      },
      (error) => {
        this.loading = false;
        console.log('API error:', error);
        console.log('error: ', error.error.errors);

        if (error.error.errors.CurrentPassword) {
          console.log('error1: ', error.error.errors.CurrentPassword[0]);
          this.currentPasswordInput?.setErrors({
            currentPasswordNotTrue: true,
          });
        }

        if (error.error.errors.NewPassword) {
          console.log('error1: ', error.error.errors.NewPassword[0]);
          if (error.error.errors.NewPassword[0] === 'MSG-11') {
            this.newPasswordInput?.setErrors({ passwordDuplicate: true });
          } else {
            this.newPasswordInput?.setErrors({ pattern: true });
          }
        }

        if (error.error.errors.ConfirmPassword) {
          console.log('error1: ', error.error.errors.ConfirmPassword[0]);
          this.reNewPasswordInput?.setErrors({ passwordDoNotMatch: true });
        }
      }
    );
  }
}
