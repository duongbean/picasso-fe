import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
  const cookieService = inject(CookieService);
  const router = inject(Router);

  console.log('Functional AuthInterceptor running for:', request.url);

  let token = cookieService.get('Authorization');
  console.log('🔹 Token from cookies:', token || 'No token found');

  if (token) {
    request = request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    console.log('🔹 Headers after clone:', request.headers.keys());
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('API error:', error);

      if (error.status === 401) {
        // ✅ Chỉ redirect nếu lỗi 401 từ một API private (không phải public)
        if (!request.url.includes('/public')) {
          cookieService.delete('Authorization');

          Swal.fire({
            title: 'Phiên đăng nhập đã hết!',
            text: 'Vui lòng đăng nhập lại.',
            icon: 'info',
            confirmButtonText: 'OK',
          }).then(() => {
            if (router.url !== '/login') {
              router.navigate(['/login']);
            }
          });
        }
      }

      return throwError(() => error);
    })
  );
};
