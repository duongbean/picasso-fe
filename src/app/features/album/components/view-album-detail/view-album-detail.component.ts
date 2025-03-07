import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DriveService } from '../../../../shared/services/drive.service';
import { AlbumService } from '../../services/albums.services';
import { MatDialog } from '@angular/material/dialog';
import { UpdateAlbumComponent } from '../update-album/update-album.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { PhotoService } from '../../services/photo.services';
import { LoadingSpinnerComponent } from '../../../../shared/layouts/loading-spinner/loading-spinner.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

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
  pageSize: number = 10;
  private scrollSubscription!: Subscription;

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
      console.log('📸 Album ID:', this.albumId);

      this.fetchAlbumData();
    });

    // Lắng nghe sự kiện cuộn với debounce để tránh spam request
    this.scrollSubscription = fromEvent(window, 'scroll')
      .pipe(debounceTime(500)) // Chỉ gọi API sau 500ms nếu tiếp tục cuộn
      .subscribe(() => this.onScroll());
  }

  // onScroll(event: any) {
  //   // Kiểm tra nếu người dùng đã cuộn xuống dưới cùng
  //   const bottom = event.target.scrollHeight === event.target.scrollTop + event.target.clientHeight;
  //   if (bottom && !this.isLoading) {
  //     this.pageNumber++;  // Tăng số trang khi cuộn xuống
  //     this.loadImagesFromDrive(this.albumId);  // Tải ảnh tiếp theo
  //   }
  // }

  //     console.log('📸 Album ID:', this.albumId);

  //     this.fetchAlbumData();
  //   });

  //   // Lắng nghe sự kiện cuộn với debounce để tránh spam request
  //   this.scrollSubscription = fromEvent(window, 'scroll')
  //     .pipe(debounceTime(500)) // Chỉ gọi API sau 500ms nếu tiếp tục cuộn
  //     .subscribe(() => this.onScroll());
  // }

  ngOnDestroy() {
    // Xóa sự kiện scroll khi component bị hủy
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  async loadImagesFromDrive(albumId: string) {
    if (!this.hasMoreImages || this.isLoading) return;

    this.isLoading = true;
    try {
      const data = await this.fetchWithExponentialBackoff(() =>
        this.driveService
          .getImages(albumId, this.pageNumber, this.pageSize)
          .toPromise()
      );

      if (data?.resultOnly?.photos?.length) {
        const newImages = data.resultOnly.photos.map((file: any) => ({
          filePath: file.filePath,
          id: file.id,
          liked: false,
          likes: file.likeNumber || 0,
        }));

        this.images.push(...newImages);
        console.log('✅ Ảnh đã tải:', this.images);

        if (newImages.length < this.pageSize) {
          this.hasMoreImages = false;
        }
      } else {
        this.hasMoreImages = false;
      }
    } catch (error) {
      console.error('❌ Lỗi khi tải ảnh từ API:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async fetchWithExponentialBackoff<T>(
    fetchFunction: () => Promise<T>,
    maxRetries: number = 5,
    maxBackoff: number = 32000 // 32 giây
  ): Promise<T> {
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        return await fetchFunction();
      } catch (error: any) {
        if (error.status === 429) {
          const delay = Math.min(
            Math.pow(2, attempt) * 1000 + Math.random() * 1000,
            maxBackoff
          );

          console.warn(`⚠️ Lỗi 429, thử lại sau ${delay / 1000} giây...`);
          await new Promise((res) => setTimeout(res, delay));

          attempt++;
        } else {
          throw error;
        }
      }
    }

    throw new Error('Số lần thử lại tối đa đã đạt, không thể lấy dữ liệu.');
  }

  onScroll() {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 100
    ) {
      console.log('📌 Đã chạm cuối trang!');

      if (!this.isLoading && this.hasMoreImages) {
        this.pageNumber++;
        console.log(`📥 Tải thêm ảnh - Trang: ${this.pageNumber}`);
        this.loadImagesFromDrive(this.albumId);
      }
    }
  }

  fetchAlbumData() {
    this.albumService.getAlbumsById(this.albumId).subscribe({
      next: (data) => {
        this.albums = data.resultOnly;
        console.log('🎞 Album:', this.albums);
        this.loadImagesFromDrive(this.albumId);
      },
      error: (err) => console.error('🚨 Lỗi khi lấy album:', err),
    });
  }

  reloadAlbum() {
    this.fetchAlbumData();
  }

  openUpdateDialog(album: any) {
    this.dialog.open(UpdateAlbumComponent, {
      width: '500px',
      data: { album },
    });
  }

  onImageLoad(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.classList.add('loaded');

    // Ẩn skeleton khi ảnh đã tải xong
    const parent = imgElement.closest('.image-item');
    if (parent) {
      const skeleton = parent.querySelector('.skeleton') as HTMLElement;
      if (skeleton) {
        skeleton.style.display = 'none';
      }
    }
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
