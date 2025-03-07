import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { JwtService } from '../../features/auth/services/jwt.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private cookieService: CookieService,
    private jwtService: JwtService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    // Lấy token từ cookie
    const token = this.cookieService.get('Authorization');

    if (!token) {
      // Không có token => điều hướng về trang login
      return this.router.createUrlTree(['/login']);
    }

    // Giải mã token để lấy thông tin vai trò
    const decodedToken = this.jwtService.decodeToken(token);
    const userRole = decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    // Lấy danh sách vai trò mong muốn từ route
    const expectedRoles = route.data['expectedRole'];
    console.log("expected role: ",expectedRoles)
    // Kiểm tra nếu expectedRoles là một mảng hoặc chuỗi
    if (expectedRoles) {
      if (Array.isArray(expectedRoles)) {
        // Nếu có nhiều vai trò, kiểm tra xem userRole có trong danh sách không
        if (expectedRoles.includes(userRole)) {
          return true;
        }
      } else {
        // Nếu chỉ có một vai trò, kiểm tra trực tiếp
        if (userRole === expectedRoles) {
          return true;
        }
      }
    }

    // Không đúng vai trò => Điều hướng đến trang từ chối truy cập
    return this.router.createUrlTree(['/access-denied']);
  }
}
