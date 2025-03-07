import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlbumService } from '../../services/albums.services';
import { MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../shared/directives/notifications/notification.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-update-album',
  imports: [MatIconModule, ReactiveFormsModule, CommonModule],
  templateUrl: './update-album.component.html',
  styleUrl: './update-album.component.css'
})
export class UpdateAlbumComponent implements OnInit{
  albumForm: FormGroup;
  albumData: any; // Dữ liệu album hiện tại
  imagePreviewUrl: string | ArrayBuffer | null = null;


  constructor(
    private fb: FormBuilder,
    private albumService: AlbumService,
    private dialogRef: MatDialogRef<UpdateAlbumComponent>,
    private notificationService: NotificationService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any // Dữ liệu album từ dialog
  ) {
    this.albumData = data.album;
    console.log("du lieu", data) // Dữ liệu album truyền vào từ component cha
    this.albumForm = this.fb.group({
      googleDriveLink: [this.albumData.linkGGDrive, Validators.required],
      albumName: [this.albumData.name, Validators.required],
      coverImage: [this.albumData.thumbnail || '']
    });
  }

  ngOnInit(): void {
    if (this.albumData.thumbnail) {
      this.imagePreviewUrl = this.albumData.thumbnail; // Set ảnh bìa nếu có
    }
  }

  onSubmit() {
    if (this.albumForm.valid) {
      const updatedAlbumData = this.albumForm.value;
      console.log('Dữ liệu album đã được cập nhật:', updatedAlbumData);
  
      // Gọi API để cập nhật album
      this.albumService.updateAlbum(this.albumData.id, updatedAlbumData).subscribe(
        (response) => {
          console.log('Album đã được cập nhật thành công:', response);
          this.dialogRef.close(response);
  
          //  Hiển thị thông báo và reload trang khi bấm OK
          this.notificationService
            .showSwal('Cập nhật thành công', 'Album đã được cập nhật!', 'success', 'OK')
            .then((result) => {
              if (result.isConfirmed) {
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                  this.router.navigate([`/view-album-detail/${this.albumData.id}`]);
                });
                // location.reload()
              }
            });
        },
        (error) => {
          console.error('Lỗi khi cập nhật album:', error);
          this.notificationService.showSwal(
            'Lỗi!',
            'Đã có lỗi xảy ra khi cập nhật album. Vui lòng thử lại!',
            'error',
            'OK'
          );
        }
      );
    } else {
      console.warn('Form chưa hợp lệ, kiểm tra lại dữ liệu nhập vào!');
      this.notificationService.showSwal(
        'Cảnh báo!',
        'Vui lòng điền đầy đủ thông tin trong form.',
        'warning',
        'OK'
      );
    }
  }
  

  onCancel() {
    this.dialogRef.close(); // Đóng dialog mà không làm gì
  }

  onImageSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0]; // Lấy tệp ảnh từ input file
      this.albumForm.patchValue({ coverImage: file }); // Lưu ảnh vào form control
  
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result; // Hiển thị ảnh đã chọn
      };
      reader.readAsDataURL(file);
    }
  }
  
  editImage() {
    // Cho phép chọn lại ảnh khi click vào icon edit
    document.getElementById('coverImage')?.click();
  }
}
