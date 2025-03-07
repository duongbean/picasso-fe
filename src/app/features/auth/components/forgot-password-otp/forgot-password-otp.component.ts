import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { SharedEmailDataService } from '../../services/shared-data.service';
import { Router } from '@angular/router';

import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-forgot-password-otp',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './forgot-password-otp.component.html',
  styleUrls: [
    './forgot-password-otp.component.css',
    // '../forgot-password/forgot-password.component.css',
  ],
})
export class ForgotPasswordOtpComponent {
  constructor(
    private router: ActivatedRoute,
    private shareService: SharedEmailDataService,
    private route: Router
  ) {}

  // form group
  requestSendOtpForm = new FormGroup({
    otpInput: new FormControl('', Validators.required),
  });

  get otpInput() {
    return this.requestSendOtpForm.get('otpInput');
  }

  // Function to prevent input text character to input type number:
  preventNonNumeric(event: KeyboardEvent): void {
    const charCode = event.key;
    // Allow only numeric character (0-9)
    if (!/^[0-9]+$/.test(charCode)) {
      event.preventDefault();
    }
  }

  // Function to validate input:
  validateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Remove non-numeric characters (in case of copy-paste or invalid characters)
    input.value = input.value.replace(/[^0-9]/g, '');

    let value = input.value;

    // Enforce maxlength of 6
    if (value.length > 6) {
      value = value.slice(0, 6);
    }

    // Set the validated value back to the input
    input.value = value;
  }

  email: string = '';
  otp: string = '';
  ngOnInit() {
    // this.router.queryParams.subscribe((params: any) => {
    //   this.email = params['email'] || '';
    //   console.log('Email get from previous page: ', this.email);
    // });

    this.email = this.shareService.getEmail();
    console.log('Email get from previous page: ', this.email);

    this.otp = this.shareService.getOtp();
    console.log('Retrieved OTP:', this.otp);

    Swal.fire({
      // title: 'Success!',
      html: `Chúng tôi vừa gửi mã OTP đến email: <strong>${this.email}</strong>.<br> Vui lòng kiểm tra email `,
      icon: 'info',
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

  submitOTP() {
    console.log('OTP input: ', this.otpInput?.value);

    if (this.otpInput?.hasError('required')) {
      console.log('OTP input is required');
      return;
    } else {
      if (this.otpInput?.value == this.otp) {
        console.log('OTP TRUE');
        this.route.navigate(['/forgot-password-new-password']);
      } else {
        console.log('OTP FALSE');
      }
    }
  }

  ngOnDestroy() {
    Swal.close({});
  }
}
