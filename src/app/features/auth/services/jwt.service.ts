import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  constructor(private cookieService: CookieService) {}

  decodeToken(token: string | string[]): any {
    try {
      const tokenString = Array.isArray(token) ? token[0] : token;
      console.log('Token to decode:', tokenString);

      const decoded: any = jwtDecode(tokenString);
      console.log('Decoded Token:', decoded);

      // Access role using the full property name
      const role =
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const userId =
        decoded[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ];
      const userPasswordChange = decoded['UserPasswordChange'];
      console.log('UserPasswordChange', userPasswordChange);
      console.log('Role:', role);
      console.log('Id', userId);

      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getUserId(): string | null {
    const decodedToken = this.getToken();
    if (decodedToken) {
      const userId =
        decodedToken[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ];
      console.log('Extracted UserId:', userId);
      return userId || null;
    }
    return null;
  }

  getToken(): any {
    const token = this.cookieService.get('Authorization');
    console.log('Retrieved Token:', token);
    return this.decodeToken(token);
  }

  getCurrentUser(): any {
    return this.getToken();
  }
}
