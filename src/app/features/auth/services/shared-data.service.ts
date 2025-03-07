import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedEmailDataService {
  private email: string = '';

  setEmail(email: string) {
    this.email = email;
  }

  getEmail(): string {
    return this.email;
  }

  clearEmail(): void {
    this.email = '';
  }

  private otp: string = '';

  // Setter for OTP
  setOtp(otp: string): void {
    this.otp = otp;
  }

  // Getter for OTP
  getOtp(): string {
    return this.otp;
  }

  // Clear OTP (optional)
  clearOtp(): void {
    this.otp = '';
  }
}
