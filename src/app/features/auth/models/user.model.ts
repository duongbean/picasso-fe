import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [CommonModule],
})
export class ModelsModule {}
export interface User {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
export interface ForgotPasswordSetNewPasswordRequest {
  email: string;
  password: string;
}

export interface UserInfoDetail {
  email: string;
  fullName: string;
  gender: number;
  userName: string;
  dob: string;
  phoneNumber: string;
  address: string;
}
