import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../features/auth/services/auth.service'; // Import AuthService
import { JwtService } from '../../../../features/auth/services/jwt.service';
import { NotificationService } from '../../../directives/notifications/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userId: string | null = null;
  isNavigating: boolean = false;

  constructor(
    private authService: AuthService, // ✅ Sửa lỗi thiếu authService
    private cookieService: CookieService,
    private router: Router,
    private jwtService: JwtService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.userId = this.jwtService.getUserId();
    console.log("🔍 User ID đăng nhập:", this.userId);
  }

  navigateToUserDetail(): void {
    if (!this.userId) {
      console.warn("⚠️ Không tìm thấy userId, không thể điều hướng!");
      return;
    }
    this.isNavigating = true;
console.log("vao dc r ma ta")
    this.router.navigate(['/view-user-detail', this.userId]).then(() => {
      this.isNavigating = false;
    }).catch(() => {
      this.isNavigating = false;
    });
  }

 
  logout(): void {
    this.notificationService.showSwal(
        'Bạn có chắc chắn muốn đăng xuất?',
        'Hành động này sẽ kết thúc phiên đăng nhập của bạn.',
        'warning',
        'Đăng xuất',
        true // ✅ Hiển thị nút "Hủy"
    ).then((result) => {
        if (result.isConfirmed) {
            this.cookieService.delete('Authorization', '/'); // ✅ Xóa token
            console.log('✅ Đã đăng xuất, token bị xóa.');
            this.router.navigate(['/login']); // ✅ Chuyển hướng login
        }
    });
}

}
