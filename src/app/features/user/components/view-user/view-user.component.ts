import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { JwtService } from '../../../auth/services/jwt.service';
import { jwtDecode } from 'jwt-decode';
import { NotificationService } from '../../../../shared/directives/notifications/notification.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, switchMap, catchError } from 'rxjs/operators';
import { response } from 'express';

@Component({
  selector: 'app-view-user',
  imports: [
    RouterModule,
    CommonModule,
    MatIconModule,
    MatProgressSpinner,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './view-user.component.html',
  styleUrl: './view-user.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class ViewUserComponent implements OnInit {
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
  currentUserID: any;

  // search input binding
  searchInput = new FormControl('');

  constructor(
    private userService: UserService,
    private router: Router,
    private jwtService: JwtService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    console.log('ViewUserComponent initialized! Fetching users...');
    this.currentUserID = this.jwtService.getUserId();
    this.fetchTotalUsers();
    this.fetchUsers();

    // Subcribe for the Search input form control change
    this.searchInput.valueChanges
      .pipe(
        debounceTime(500),
        switchMap((searchTerm) => {
          if (searchTerm === '') {
            this.fetchTotalUsers();
            this.fetchUsers();
            // return [];
          }
          this.isLoading = true;
          return this.userService
            .searchUserDefault(searchTerm ? searchTerm : '')
            .pipe(
              catchError((error) => {
                this.errorMessage = 'Đã có lỗi khi tìm kiếm người dùng.';
                this.isLoading = false;

                return [];
              })
            );
        })
      )
      .subscribe((response) => {
        this.isLoading = true;
        if (response.isSuccess) {
          this.users = response.result;
          this.updatePaginationRange();
          this.totalUsers = this.users.length;
          this.totalPages = Math.ceil(this.totalUsers / this.pageSize);

          console.log('Tổng số trang sau khi tính toán:', this.totalPages); // Ghi log tổng số trang

          this.updatePaginationRange();
        } else {
          this.errorMessage =
            response.message || 'Không thể tải danh sách người dùng.';
        }
        this.isLoading = false;
      });
  }
  navigateToUserDetail(userId: string): void {
    this.isNavigating = true; // Hiển thị loading khi bắt đầu điều hướng

    this.router
      .navigate(['/view-user-detail', userId])
      .then(() => {
        this.isNavigating = false; // Tắt loading sau khi điều hướng xong
      })
      .catch(() => {
        this.isNavigating = false; // Nếu có lỗi, vẫn đảm bảo tắt loading
      });
  }

  fetchTotalUsers(): void {
    this.isLoading = true;
    this.userService.getTotalUserCount().subscribe({
      next: (count) => {
        console.log('Tổng số nhân viên từ API:', count); // Ghi log số nhân viên từ API

        this.totalUsers = count;
        this.totalPages = Math.ceil(this.totalUsers / this.pageSize);

        console.log('Tổng số trang sau khi tính toán:', this.totalPages); // Ghi log tổng số trang

        this.updatePaginationRange();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi lấy tổng số nhân viên:', error);
        this.isLoading = false;
      },
    });
  }

  // Lấy danh sách người dùng theo trang
  fetchUsers(): void {
    console.log(`Fetching users - Page: ${this.currentPage}`);

    this.isLoading = true;

    this.userService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        if (response.isSuccess) {
          this.users = response.result;
          this.updatePaginationRange();
        } else {
          this.errorMessage =
            response.message || 'Không thể tải danh sách người dùng.';
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
    // console.log(
    //   `Kiểm tra user ID: ${user.id} - Current User ID: ${this.currentUserID} - Kết quả: ${isCurrent}`
    // );
    return isCurrent;
  }

  // Cập nhật danh sách số trang hiển thị
  updatePaginationRange(): void {
    const range = [];
    for (let i = 1; i <= this.totalPages; i++) {
      if (
        i === 1 ||
        i === this.totalPages ||
        (i >= this.currentPage - 1 && i <= this.currentPage + 1)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    this.paginationRange = range;
  }

  onToggleActive(user: any): void {
    const previousStatus = user.isActive; // Lưu trạng thái hiện tại
    user.isActive = !previousStatus; // Cập nhật UI ngay lập tức

    console.log('Trạng thái trước:', previousStatus);
    console.log('Trạng thái sau khi toggle:', user.isActive);
    console.log('Gửi request với userId:', user.id);
    console.log(user);

    this.notificationService
      .showSwal(
        `Bạn có chắc muốn ${
          user.isActive ? 'kích hoạt' : 'vô hiệu hóa'
        } tài khoản này?`,
        '',
        'warning',
        user.isActive ? 'Kích hoạt' : 'Vô hiệu hóa',
        true
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.isLoading = true;
          this.userService.updateUserStatus(user.id).subscribe({
            next: (response) => {
              this.isLoading = false;
              this.notificationService.showSwal(
                'Thành công!',
                `Tài khoản đã được ${
                  user.isActive ? 'kích hoạt' : 'vô hiệu hóa'
                }.`,
                'success',
                'OK',
                false
              );
            },
            error: (error) => {
              user.isActive = previousStatus;
              this.notificationService.showSwal(
                'Lỗi!',
                'Không thể cập nhật trạng thái tài khoản.',
                'error',
                'Thử lại',
                false
              );
            },
          });
        } else {
          user.isActive = previousStatus;
        }
      });
  }
}
