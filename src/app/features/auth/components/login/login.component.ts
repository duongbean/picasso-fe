import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { JwtService } from '../../services/jwt.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null; // Biến lưu thông báo lỗi
  loading: boolean = false;
  failedAttempts: number = 0; // Đếm số lần nhập sai
  showCaptcha: boolean = false; // Kiểm soát hiển thị CAPTCHA
  captchaCode: string = ''; // Mã CAPTCHA ngẫu nhiên
  captchaError: string | null = null; // Thông báo lỗi CAPTCHA
  hidePassword: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService,
    private jwtService: JwtService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      captchaInput: new FormControl(''), // Trường nhập CAPTCHA (chỉ kiểm tra khi cần)
    });
  }

  // Getters for easy access to form controls
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
  generateCaptcha() {
    this.captchaCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log(`🔄 CAPTCHA mới: ${this.captchaCode}`);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  // Submit form data
  onSubmit() {
    console.log(
      `🔍 Người dùng nhập CAPTCHA: ${this.loginForm.get('captchaInput')?.value}`
    );
    console.log(`🎯 CAPTCHA thực tế: ${this.captchaCode}`);

    // Kiểm tra CAPTCHA nếu đang hiển thị
    if (this.showCaptcha) {
      const enteredCaptcha = this.loginForm.get('captchaInput')?.value?.trim();
      if (enteredCaptcha !== this.captchaCode.trim()) {
        console.log('⚠ Lỗi CAPTCHA: Người dùng nhập sai!');
        this.captchaError = 'Mã CAPTCHA không đúng. Vui lòng thử lại.';
        this.generateCaptcha(); // Tạo CAPTCHA mới nếu nhập sai
        return;
      }
    }
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      this.loading = true;
      this.authService.login(loginData).subscribe({
        next: (response) => {
          if (response && response.isSuccess) {
            // Xử lý thành công
            this.errorMessage = null;

            // Lưu token vào cookie
            const token = response.result;
            this.cookieService.set(
              'Authorization',
              `${token}`,
              1, // Token hết hạn sau 1 ngày
              '/',
              undefined,
              true,
              'Lax'
            );

            // Decode token để lấy thông tin vai trò
            const decodedToken = this.jwtService.decodeToken(token);
            const role =
              decodedToken[
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
              ];
            const userPasswordChange = decodedToken['UserPasswordChange'];
            const isUpdated = decodedToken['IsUpdated'];
            const userId =
              decodedToken[
                "'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'"
              ];
            console.log(userPasswordChange);
            console.log(isUpdated);
            let redirectPath = '/';
            if (userPasswordChange === 'True' || userPasswordChange === true) {
              redirectPath = '/change-password';
            } else if (isUpdated === 'True') {
              redirectPath = '/update-user-private-information';
            } else {
              // Kiểm tra role và điều hướng đến trang phù hợp
              const roleRedirects: { [key: string]: string } = {
                Admin: '/dashboard',
                Photographer: '/view-photo-project',
                Customer: '/view-projects',
              };

              redirectPath = roleRedirects[role] || '/login';

              // Chỉ hiển thị "Đăng nhập thành công" khi vào trang role
              if (roleRedirects[role]) {
                Swal.fire({
                  title: '<strong>Đăng nhập thành công!</strong>',
                  icon: 'success',
                  background: '#f0f9ff',
                  showConfirmButton: false,
                  timer: 1500,
                });
              }
            }

            // Điều hướng sau khi kiểm tra xong
            this.router.navigate([redirectPath]);
            console.log('Redirecting to:', redirectPath);
          } else {
            // Xử lý lỗi từ API
            this.handleError({ error: response });
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('API Error:', error);
          this.handleError(error);
        },
      });
    } else {
      this.errorMessage = 'Vui lòng nhập email và mật khẩu của bạn.';
    }
  }

  // Handle API error messages
  private handleError(error: any) {
    console.error('Login failed:', error);

    const errorMessage = error?.error?.message;

    this.failedAttempts++; // Tăng số lần nhập sai

    if (this.failedAttempts >= 5) {
      this.showCaptcha = true; // Bắt buộc nhập CAPTCHA sau 5 lần sai
      this.generateCaptcha(); // Tạo CAPTCHA mới
      console.log('🚨 Hiển thị CAPTCHA do nhập sai quá 5 lần!');
    }

    console.log(errorMessage);
    switch (errorMessage) {
      case 'MSG-01':
        this.loading = false;
        this.errorMessage = 'Vui lòng nhập email và mật khẩu của bạn.';
        break;

      case 'MSG-02':
        this.loading = false;
        this.errorMessage = 'Email hoặc mật khẩu không đúng.';
        break;

      case 'MSG-03':
        this.loading = false;
        this.errorMessage =
          'Tài khoản của bạn bị chặn hoặc không hoạt động. Vui lòng liên hệ hỗ trợ.';
        break;

      case 'MSG-04':
        this.loading = false;
        this.errorMessage =
          'Email bạn đã nhập không phải là email được đăng ký trong hệ thống.';
        break;

      default:
        this.loading = false;
        this.errorMessage = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
        break;
    }
  }
}
