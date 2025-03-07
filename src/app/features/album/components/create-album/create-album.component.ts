import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlbumService } from '../../services/albums.services';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../shared/directives/notifications/notification.service';
import { ProjectService } from '../../../photo-project/services/project.service';

@Component({
  selector: 'app-create-album',
  imports:[ReactiveFormsModule,MatIconModule, CommonModule],
  templateUrl: './create-album.component.html',
  styleUrls: ['./create-album.component.css']
})
export class CreateAlbumComponent implements OnInit {
  albumForm!: FormGroup;
  projectId!: string;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private albumService: AlbumService,
    private dialogRef: MatDialogRef<CreateAlbumComponent>,
    private notificationService: NotificationService,
    private projectService :ProjectService,
    @Inject(MAT_DIALOG_DATA) public data: { Id: string }
  ) {}

  ngOnInit() {
    console.log("data",this.data)
    this.projectId = this.data?.Id || ''; 
    console.log('✅ Lấy projectId từ dialog:', this.projectId);

    this.albumForm = this.fb.group({
      albumName: ['', Validators.required], // Bắt buộc nhập tên album
      googleDriveLink: ['',Validators.required], // Kiểm tra đường link hợp lệ
      coverImage: ['']
    });
  }
  onImageSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      this.selectedFile = fileInput.files[0]; // Lưu file vào biến
  
      // Hiển thị ảnh preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  // Chỉnh sửa ảnh (cho phép chọn lại ảnh)
  editImage(): void {
    const fileInput = document.getElementById('coverImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();  // Kích hoạt input file khi người dùng click vào icon chỉnh sửa
    }
  }

  onSubmit() {
    if (this.albumForm.valid) {
      const albumData = this.albumForm.value;
      
      console.log('Dữ liệu album gửi đi:', albumData);
      console.log('File ảnh gửi đi:', this.selectedFile);
  
      this.albumService.createAlbum(this.projectId, albumData, this.selectedFile || undefined).subscribe(
        (response) => {
          console.log('Album đã được tạo thành công:', response);
          
          // Đóng Dialog trước khi hiển thị Swal
          this.dialogRef.close(response);
  
          // ✅ Bước 2: Sau khi tạo album thành công, cập nhật trạng thái dự án
          this.projectService.updateProjectStatus(this.projectId, 'Đang Xử Lý').subscribe(
            (statusResponse) => {
              console.log('Trạng thái dự án đã được cập nhật:', statusResponse);
              
              // Hiển thị Swal sau khi Dialog đóng
              setTimeout(() => {
                this.notificationService.showSwal(
                  'Thành công!',
                  'Album đã được tạo và dự án chuyển sang trạng thái "Đang xử lý".',
                  'success',
                  'Đóng',
                  false
                );
              }, 300);
            },
            (statusError) => {
              console.error('Lỗi khi cập nhật trạng thái dự án:', statusError);
              this.notificationService.showSwal(
                'Lỗi!',
                'Album đã được tạo nhưng không thể cập nhật trạng thái dự án.',
                'error',
                'Đóng',
                false
              );
            }
          );
        },
        (error) => {
          console.error('Lỗi khi tạo album:', error);
          this.notificationService.showSwal(
            'Lỗi!',
            'Đã có lỗi xảy ra khi tạo album. Vui lòng thử lại.',
            'error',
            'Đóng',
            false
          );
        }
      );
    } else {
      this.notificationService.showSwal(
        'Cảnh báo!',
        'Vui lòng điền đầy đủ thông tin trong form.',
        'warning',
        'Đóng',
        false
      );
    }
  }
  
  // Đóng popup khi nhấn "Hủy"
  onCancel() {
    this.dialogRef.close();
  }
}
