import { Component, OnInit,  } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { ImageService } from '../../services/image.service';
@Component({
  selector: 'app-view-user-detail',
  imports: [MatIconModule, CommonModule, MatIconModule,MatProgressSpinner, RouterModule],
  templateUrl: './view-user-detail.component.html',
  styleUrl: './view-user-detail.component.css'
})
export class ViewUserDetailComponent implements OnInit{
  user: any;
  userId: string | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  fullAvatarUrl: string | null = null;
  isAvatarLoaded: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private userService: UserService, 
    private location : Location,
    private imageService : ImageService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id'); // ✅ Lấy ID từ URL
      console.log("🔍 ID từ URL:", this.userId);
      if (this.userId) {
        this.fetchUserDetail();
      } else {
        this.isLoading = false;
        this.errorMessage = 'Không tìm thấy thông tin người dùng.';
      }
    });
  }
  goBack(): void {
    this.location.back(); // Quay lại trang trước đó
  }
  // Gọi API để lấy thông tin người dùng
  fetchUserDetail(): void {
    this.isLoading = true;
    this.userService.getUserById(this.userId!).subscribe({
      next: (response) => {
        console.log('✅ Dữ liệu người dùng:', response);
        if (response.isSuccess && response.resultOnly) {
          this.user = response.resultOnly;
          if (this.user.avatarUrl) {
            this.getAvatarFromAzure(this.user.avatarUrl);
          } else {
            this.fullAvatarUrl = '../../../../../assets/CV.jpg'; // Ảnh mặc định
            this.isAvatarLoaded = true; // Đánh dấu đã load xong
          }
        } else {
          this.errorMessage = response.message || 'Không thể tải thông tin người dùng.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ API Error:', error);
        this.errorMessage = 'Lỗi khi tải thông tin người dùng.';
        this.isLoading = false;
      },
    });
  }
  getAvatarFromAzure(avatarPath: string): void {
    const getImageRequest = { avatarUrl: avatarPath };

    this.imageService.getAvatar(getImageRequest).subscribe(
      (response) => {
        console.log('🌐 Avatar URL từ API:', response);
        if (response && response.sasUrl) {
          this.fullAvatarUrl = response.sasUrl; // Cập nhật URL ảnh
        } else {
          this.fullAvatarUrl = '../../../../../assets/CV.jpg'; // Sử dụng ảnh mặc định nếu lỗi
        }
        this.isAvatarLoaded = true;
      },
      (error) => {
        console.error('🚨 Lỗi khi lấy avatar:', error);
        this.fullAvatarUrl = '../../../../../assets/CV.jpg'; // Sử dụng ảnh mặc định nếu có lỗi
        this.isAvatarLoaded = true;
      }
    );
  }
}
