import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { ActivatedRoute } from '@angular/router';
import { DriveService } from '../../../../shared/services/drive.service';
import { AlbumService } from '../../services/albums.services';
import { MatDialog } from '@angular/material/dialog';
import { UpdateAlbumComponent } from '../update-album/update-album.component';
import { PhotoService } from '../../services/photo.services';
import { LoadingSpinnerComponent } from '../../../../shared/layouts/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-view-album-detail',
  imports: [
    MatIconModule,
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-album-detail.component.html',
  styleUrls: ['./view-album-detail.component.css'], // Sửa lại thành styleUrls
})
export class ViewAlbumDetailComponent {
  albumId!: string; // Lưu trữ albumId từ URL
  images: any[] = [];
  hasMoreImages: boolean = true;
  albums: any;
  folderUrl: any;
  isLoading = true;
  isLoadingSpinner = false;
  errorMessage: string = '';
  pageNumber: number = 1; // Số trang bắt đầu
  pageSize: number = 50;

  constructor(
    private route: ActivatedRoute,
    private driveService: DriveService,
    private albumService: AlbumService,
    private dialog: MatDialog,
    private photoService: PhotoService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.albumId = params.get('id') || '';
      console.log('Album ID:', this.albumId);

      // Gọi API lấy thông tin album trước
      this.albumService.getAlbumsById(this.albumId).subscribe({
        next: (data) => {
          this.albums = data.resultOnly;
          console.log('Albums:', this.albums);

          // Chỉ gọi API lấy ảnh sau khi đã có link Google Drive
          if (this.albums.id) {
            this.loadImagesFromDrive(this.albums.id);
          } else {
            console.error('Album không có link Google Drive!');
          }
        },
        error: (err) => {
          console.error('Lỗi khi lấy album:', err);
        },
      });
    });
    setTimeout(() => {
      window.addEventListener('scroll', () => this.onScroll());
    }, 500);
  }

  // onScroll(event: any) {
  //   // Kiểm tra nếu người dùng đã cuộn xuống dưới cùng
  //   const bottom = event.target.scrollHeight === event.target.scrollTop + event.target.clientHeight;
  //   if (bottom && !this.isLoading) {
  //     this.pageNumber++;  // Tăng số trang khi cuộn xuống
  //     this.loadImagesFromDrive(this.albumId);  // Tải ảnh tiếp theo
  //   }
  // }

  ngOnDestroy() {
    // Xóa sự kiện scroll khi component bị hủy
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  onScroll() {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 10
    ) {
      console.log('Đã chạm cuối trang!');

      if (!this.isLoading && this.hasMoreImages) {
        this.pageNumber++; // Tăng số trang
        console.log(`Tải thêm ảnh - Trang: ${this.pageNumber}`);
        this.loadImagesFromDrive(this.albumId); // Tải ảnh tiếp theo
      }
    }
  }

  reloadAlbum() {
    this.albumService.updateAlbumImages(this.albumId).subscribe({
      next: () => {
        console.log('Album đã cập nhật, tải lại ảnh...');
        this.loadImagesFromDrive(this.albumId);
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật album:', err);
      },
    });
  }

  loadImagesFromDrive(albumId: string) {
    this.isLoading = true; // Bật trạng thái loading khi bắt đầu tải ảnh
    this.driveService
      .getImages(albumId, this.pageNumber, this.pageSize)
      .subscribe({
        next: (data) => {
          console.log('🚀 API Response:', data);

          // Kiểm tra xem `resultOnly` và `photos` có tồn tại và có phải mảng không
          if (
            data.resultOnly &&
            Array.isArray(data.resultOnly.photos) &&
            data.resultOnly.photos.length > 0
          ) {
            // Thêm ảnh mới vào cuối mảng ảnh hiện tại (không reset mảng)
            const newImages = data.resultOnly.photos.map((file: any) => ({
              filePath: file.filePath,
              id: file.id,
              liked: false,
              isFavorite: file.isFavorite,
              isRecommend: file.isRecommend,
              likes: file.likeNumber || 0,
            }));

            // Thêm ảnh vào cuối mảng `images` hiện tại
            this.images.push(...newImages); // Không thay thế, chỉ thêm ảnh mới vào

            console.log('✅ Ảnh đã tải:', this.images);

            // Kiểm tra nếu ảnh tải về ít hơn số ảnh cần tải (pageSize), ẩn nút "Xem thêm"
            if (data.resultOnly.photos.length < this.pageSize) {
              this.hasMoreImages = false; // Đặt giá trị false để ẩn nút "Xem thêm"
            }
          } else {
            console.error(
              '❌ Không tìm thấy hình ảnh trong folder!',
              data.resultOnly
            );
            this.errorMessage = 'Không có hình ảnh trong album này!';
          }
          this.isLoading = false; // Dừng trạng thái loading khi ảnh đã tải
        },
        error: (err) => {
          console.error('❌ Lỗi khi tải ảnh từ API:', err);
          this.isLoading = false;
          this.errorMessage = 'Lỗi khi tải ảnh!';
        },
      });
  }

  loadMore() {
    if (this.hasMoreImages) {
      this.pageNumber++; // Tăng số trang
      this.loadImagesFromDrive(this.albumId); // Tải ảnh tiếp theo
    }
  }
  openUpdateDialog(album: any) {
    const dialogRef = this.dialog.open(UpdateAlbumComponent, {
      width: '500px',
      data: { album: album },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // window.location.reload();
    });
  }

  // Function - Event Click Add Recommend Photo
  addRecommedPhoto(id: string, isRecommended: boolean, image: any) {
    console.log(
      'Photo to add recommend: ',
      id,
      ' isRecommended? = ',
      isRecommended
    );
    if (isRecommended) {
      this.isLoadingSpinner = true;
      this.photoService.removeRecommendPhoto(id).subscribe(
        (response) => {
          console.log('Response Call API Remove Recommend Photo: ', response);
          image.isRecommend = false;
          this.isLoadingSpinner = false;
        },
        (error) => {
          console.log('Error Call API Remove Recommend Photo: ', error);
          this.isLoadingSpinner = false;
        }
      );
    } else {
      this.isLoadingSpinner = true;
      this.photoService.addRecommendPhoto(id).subscribe(
        (response) => {
          console.log('Response Call API Add Recommend Photo: ', response);
          image.isRecommend = true;
          this.isLoadingSpinner = false;
        },
        (error) => {
          console.log('Error Call API Add Recommend Photo: ', error);
          this.isLoadingSpinner = false;
        }
      );
    }
  }
}
