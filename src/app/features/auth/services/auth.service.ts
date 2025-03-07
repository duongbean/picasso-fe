import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ForgotPasswordSetNewPasswordRequest,
  User,
} from '../models/user.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/Auth`; // URL gốc cho Auth API

  constructor(private http: HttpClient) {}

  // Đăng nhập
  login(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user);
  }

  // Đăng xuất
  logout(): void {
    // Xử lý logic logout ở đây (nếu cần)
  }

  // Thay đổi mật khẩu
  changePassword(
    changePasswordRequest: ChangePasswordRequest
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/change-password`,
      changePasswordRequest
    );
  }

  // Reset mật khẩu
  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email });
  }

  // Lấy thông tin người dùng từ token
  getUserData(token: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/get-user-data?token=${token}`);
  }

  forgotPassword(
    forgotPasswordRequest: ForgotPasswordRequest
  ): Observable<any> {
    return this.http.put(
      // `${environment.apiBaseUrl}/api/Auth/sendmail`,
      `${this.apiUrl}/forget-password`,
      forgotPasswordRequest
    );
  }

  forgotPasswordSetNewPassword(
    forgotPasswordSetNewPasswordRequest: ForgotPasswordSetNewPasswordRequest
  ): Observable<any> {
    return this.http.put(
      `${environment.apiBaseUrl}/api/Auth/forget-password`,
      forgotPasswordSetNewPasswordRequest
    );
  }
}
