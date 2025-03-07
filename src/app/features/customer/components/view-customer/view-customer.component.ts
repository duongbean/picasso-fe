import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { JwtService } from '../../../auth/services/jwt.service';
import { jwtDecode } from 'jwt-decode';
import { NotificationService } from '../../../../shared/directives/notifications/notification.service';

@Component({
  selector: 'app-view-customer',
  imports: [CommonModule,RouterModule,MatIconModule,MatProgressSpinner],
  templateUrl: './view-customer.component.html',
  styleUrl: './view-customer.component.css'
})
export class ViewCustomerComponent implements OnInit {
 users: any[] = []; 
  isLoading: boolean = true; 
  errorMessage: string | null = null; 
  isNavigating: boolean = false;

  // Phân trang
  currentPage: number = 1;
  totalPages: number = 1;
  totalUsers: number = 0; // Tổng số nhân viên
  pageSize: number = 10; // Số lượng người dùng mỗi trang
  paginationRange: any[] = [];
  currentUserID: any ;


  constructor(private customerService: CustomerService, private router: Router, private jwtService: JwtService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    console.log("ViewUserComponent initialized! Fetching users...");
    this.currentUserID = this.jwtService.getUserId();
    this.fetchTotalUsers();
    this.fetchUsers();
  }
  navigateToUserDetail(userId: string): void {
    this.isNavigating = true; // Hiển thị loading khi bắt đầu điều hướng

    this.router.navigate(['/view-customer-detail', userId]).then(() => {
        this.isNavigating = false; // Tắt loading sau khi điều hướng xong
    }).catch(() => {
        this.isNavigating = false; // Nếu có lỗi, vẫn đảm bảo tắt loading
    });
}

  fetchTotalUsers(): void {
    this.customerService.getTotalCustomerCount().subscribe({
      next: (count) => {
        console.log('Tổng số nhân viên từ API:', count); // Ghi log số nhân viên từ API
        
        this.totalUsers = count;
        this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
        
        console.log('Tổng số trang sau khi tính toán:', this.totalPages); // Ghi log tổng số trang
        
        this.updatePaginationRange();
      },
      error: (error) => {
        console.error('Lỗi khi lấy tổng số nhân viên:', error);
      }
    });
}



  // Lấy danh sách người dùng theo trang
  fetchUsers(): void {
    console.log(`Fetching users - Page: ${this.currentPage}`);
    
    this.isLoading = true;
    
    this.customerService.getCustomers(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (response.isSuccess) {
          this.users = response.result;
          this.updatePaginationRange();
        } else {
          this.errorMessage = response.message || 'Không thể tải danh sách người dùng.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.errorMessage = 'Đã xảy ra lỗi khi tải danh sách người dùng.';
        this.isLoading = false;
      },
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.fetchUsers();
}
isCurrentUser(user: any): boolean {
  const isCurrent = this.currentUserID && this.currentUserID === user.id;
  console.log(`Kiểm tra user ID: ${user.id} - Current User ID: ${this.currentUserID} - Kết quả: ${isCurrent}`);
  return isCurrent;
}

  // Cập nhật danh sách số trang hiển thị
  updatePaginationRange(): void {
    const range = [];
    for (let i = 1; i <= this.totalPages; i++) {
      if (i === 1 || i === this.totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    this.paginationRange = range;
  }
}
