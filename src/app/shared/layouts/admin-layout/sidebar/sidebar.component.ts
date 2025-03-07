import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  activeItem: string = ''; // Lưu trạng thái mục đang active

  constructor(private router: Router) {}

  ngOnInit() {
    // Lắng nghe sự kiện route thay đổi để cập nhật trạng thái active
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setActiveByUrl(event.urlAfterRedirects);
      }
    });

    // Đặt trạng thái active ban đầu theo route hiện tại
    this.setActiveByUrl(this.router.url);
  }

  setActive(item: string) {
    this.activeItem = item; // Cập nhật trạng thái active
    this.router.navigate([item]); // Điều hướng khi click vào menu
  }

  private setActiveByUrl(url: string) {
    console.log('🔹 URL hiện tại:', url);

    if (url.includes('/create-user')) {
      this.activeItem = 'view-user'; // Khi đang ở "Thêm User", vẫn giữ "Quản lý tài khoản"
    } else if(url.includes('/view-user-detail')){
      this.activeItem = 'view-user';
    }else if(url.includes('/update-user-private-information')){
      this.activeItem = 'view-user';
    }
    else if (url.includes('/dashboard')) {
      this.activeItem = 'dashboard';
    }  else if (url.includes('/view-customer')) {
      this.activeItem = 'view-customer';
    } else if(url.includes('/view-customer-detail')){
      this.activeItem = 'view-customer';
    }else if(url.includes('/create-customer')){
      this.activeItem = 'view-customer';
    }else if(url.includes('/update-customer')){
      this.activeItem = 'view-customer';
    }
    else if (url.includes('/calendar')) {
      this.activeItem = 'calendar';
    } 
    else if (url.includes('/album')) {
      this.activeItem = 'album';
    } 
    else if (url.includes('/view-user')) {
      this.activeItem = 'view-user';
    } 
    else {
      this.activeItem = 'dashboard'; // Mặc định nếu không khớp
    }

    console.log('✅ Active item:', this.activeItem);
  }
}
