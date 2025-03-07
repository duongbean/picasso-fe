import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ForgotPasswordRequest, User } from '../../models/user.model';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import Swal from 'sweetalert2';
import { SharedEmailDataService } from '../../services/shared-data.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    CommonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private shareService: SharedEmailDataService
  ) {
    console.log('Initilize Component');
    this.getAuthApi = new Subscription();
    this.requestForgotPasswordSendOtp = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  // subcription
  getAuthApi: Subscription;

  // email data binding
  requestForgotPasswordSendOtp = new FormGroup({
    email: new FormControl('', Validators.required),
  });

  get email() {
    return this.requestForgotPasswordSendOtp.get('email');
  }
  // loading API status:
  loading: boolean = false;
  isNotInputEmail = false;
  ngOnInit() {
    console.log('OnInit Component');
  }

  submitSendMailForgotPassword() {
    this.isNotInputEmail = true;
    Swal.close({});
    if (this.email?.hasError('required')) {
      console.log('Email is required.');
      console.log('email binding: ', this.email?.value);
      return;
    } else if (this.email?.hasError('email')) {
      console.log('Email is wrong format');
    } else {
      console.log('email binding: ', this.email?.value);
      const forgotPasswordRequest: ForgotPasswordRequest = {
        email: String(this.email?.value),
      };

      this.loading = true;
      this.authService.forgotPassword(forgotPasswordRequest).subscribe(
        (data) => {
          this.loading = false;
          console.log('forgot password request API response: ', data);

          if (data.statusCode === 200) {
            if (data.isSuccess === true) {
              console.log('Send email success');
              this.shareService.setEmail(String(this.email?.value));
              const otp = data.result[0]; // Extract the OTP (6 numeric characters)
              this.shareService.setOtp(otp);
              Swal.fire({
                icon: 'success',
                title: 'Email đã được gửi thành công!',
                html: 'Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn. <br>Vui lòng kiểm tra hộp thư đến hoặc thư mục <b>Spam</b>.',
                confirmButtonText: 'OK',
                timer: 5000,
                timerProgressBar: true,
              });
              this.router.navigate(['/login']);
            } else if (data.message === 'MSG-03') {
              // Check for deactivated account case
              console.log('Fail - account deactivated');
              this.email?.setErrors({ accountDeactive: true });
              Swal.fire({
                // title: 'Success!',
                html: '<strong>Email bạn đã nhập không phải là email được active trong hệ thống.<br>Vui lòng nhập lại email</strong>',
                icon: 'error',
                toast: false,
                position: 'center',
                showConfirmButton: false,
                showCloseButton: true,
                customClass: {
                  popup: 'custom-popup',
                  title: 'custom-title',
                  htmlContainer: 'custom-html',
                  closeButton: 'custom-close-button',
                  icon: 'custom-icon',
                },
                color: '#930C0F',
                padding: '20px',
                width: '50%',
              });
            } else {
              console.log('Fail - other error', data.message);
            }
          }
        },

        (error) => {
          this.loading = false;
          console.log('forgot password request API response error: ', error);
          if (error.status === 404) {
            console.log('Send email error');
            // alert('If the email entered is not associated with any account');
            Swal.fire({
              // title: 'Success!',
              html: '<strong>Email bạn đã nhập không phải là email được đăng ký trong hệ thống.<br>Vui lòng nhập lại email!</strong>',
              icon: 'error',
              toast: false,
              position: 'center',
              showConfirmButton: false,
              showCloseButton: true,
              customClass: {
                popup: 'custom-popup',
                title: 'custom-title',
                htmlContainer: 'custom-html',
                closeButton: 'custom-close-button',
                icon: 'custom-icon',
              },
              color: '#930C0F',
              padding: '20px',
              width: '50%',
            });
          } else {
            console.error('An unexpected error occurred:', error.error.message);
            Swal.fire({
              // title: 'Success!',
              html: '<strong>Hệ thống không thể gửi OTP. Vui lòng thử lại sau!</strong>',
              icon: 'error',
              toast: false,
              position: 'center',
              showConfirmButton: false,
              showCloseButton: true,
              customClass: {
                popup: 'custom-popup',
                title: 'custom-title',
                htmlContainer: 'custom-html',
                closeButton: 'custom-close-button',
                icon: 'custom-icon',
              },
              color: '#930C0F',
              padding: '20px',
              width: '50%',
            });
          }
        }
      );
    }
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }
}
