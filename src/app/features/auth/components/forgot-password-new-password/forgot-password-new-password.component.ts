import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SharedEmailDataService } from '../../services/shared-data.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ForgotPasswordSetNewPasswordRequest } from '../../models/user.model';

@Component({
  selector: 'app-forgot-password-otp',
  imports: [FormsModule, ReactiveFormsModule, MatIcon, NgIf],
  templateUrl: './forgot-password-new-password.component.html',
  styleUrls: ['./forgot-password-new-password.component.css'],
})
export class ForgotPasswordNewPasswordComponent {
  constructor(
    private router: ActivatedRoute,
    private shareService: SharedEmailDataService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private route: Router
  ) {
    //form builder to validate input
    this.requestNewPasswordForm = this.formBuilder.group({
      newPasswordInput: new FormControl('', [
        Validators.required,
        Validators.pattern(
          /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>])[^\s]{8,}$/
        ),
      ]),
      reNewPasswordInput: new FormControl('', [Validators.required]),
    });
  }
  // get email from previous page
  email: string = '';

  // form group
  requestNewPasswordForm = new FormGroup({
    newPasswordInput: new FormControl('', Validators.required),
    reNewPasswordInput: new FormControl('', Validators.required),
  });

  get newPasswordInput() {
    return this.requestNewPasswordForm.get('newPasswordInput');
  }
  get reNewPasswordInput() {
    return this.requestNewPasswordForm.get('reNewPasswordInput');
  }

  ngOnInit() {
    this.passwordVisible = true;
    this.passwordVisible2 = true;
    this.email = this.shareService.getEmail();
  }

  passwordVisible: boolean = true;
  passwordVisible2: boolean = true;

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
  togglePasswordVisibility2() {
    this.passwordVisible2 = !this.passwordVisible2;
  }

  submitNewPassword() {
    const newPasswordErrors =
      this.requestNewPasswordForm.get('newPasswordInput')?.errors;

    if (newPasswordErrors) {
      console.log('Input error: New password: ', newPasswordErrors);
    } else {
      console.log('Input error: New password: ', 'NO ERROR');
    }

    console.log(
      'Form input data: New password: ',
      this.newPasswordInput?.value
    );
    console.log(
      'Form input data: Re New password: ',
      this.reNewPasswordInput?.value
    );

    if (this.newPasswordInput?.hasError('required')) {
      console.log('Form message: ', 'New password is required');
    }
    if (this.reNewPasswordInput?.hasError('required')) {
      console.log('Form message: ', 'Re New password is required');
    } else {
      // reNewPassword != null && newPassword == null
      if (this.newPasswordInput?.getError('required')) {
        console.log('reNewPassword != null && newPassword == null');
        this.reNewPasswordInput?.setErrors({ newPassWordIsNull: true });
      } else if (
        this.newPasswordInput?.value !== this.reNewPasswordInput?.value
      ) {
        this.reNewPasswordInput?.setErrors({ passwordDoNotMatch: true });
      } else {
        // No error
        this.reNewPasswordInput?.setErrors(null); // Clear errors if they match
        const forgotPasswordSetNewPassword: ForgotPasswordSetNewPasswordRequest =
          {
            email: this.email,
            password: String(this.newPasswordInput?.value),
          };
        console.log(
          'Set new password API - request body: ',
          forgotPasswordSetNewPassword
        );
        this.authService
          .forgotPasswordSetNewPassword(forgotPasswordSetNewPassword)
          .subscribe((data) => {
            console.log('Set new password API - response: ', data);
            // Set new password success
            if (data.statusCode === 200) {
              let countdown = 5; // 5 seconds countdown

              Swal.fire({
                html: `<strong>Đặt mật khẩu mới thành công. Chúng tôi sẽ chuyển tiếp đến trang đăng nhập trong <span id="countdown">${countdown}</span>s. <br>Vui lòng đăng nhập lại</strong>`,
                icon: 'success',
                toast: false,
                position: 'center',
                showConfirmButton: false,
                showCloseButton: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
                background: '#fff',
                timer: countdown * 1000, // Total timer in milliseconds
                timerProgressBar: true,
                padding: '40px',
                width: '60%',
                didOpen: () => {
                  const countdownElement = document.getElementById('countdown'); // Get the countdown span
                  const timerInterval = setInterval(() => {
                    countdown--;
                    if (countdownElement) {
                      countdownElement.textContent = countdown.toString(); // Update the countdown text
                    }

                    if (countdown <= 0) {
                      clearInterval(timerInterval); // Stop the interval when countdown ends
                    }
                  }, 1000); // Update every second
                },
              }).then(() => {
                this.route.navigate(['/login']); // Navigate after alert finishes
              });
            } else {
              // Set new password fail
            }
          });
      }
    }
  }

  ngOnDestroy() {
    Swal.close({});
  }
}
