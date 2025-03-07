import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../../services/albums.services';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateAlbumComponent } from '../create-album/create-album.component';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatMenuModule } from '@angular/material/menu';
import { Observable } from 'rxjs';
import { NotificationService } from '../../../../shared/directives/notifications/notification.service';

@Component({
  selector: 'app-view-albums',
  imports: [MatIconModule, CommonModule, MatDialogModule, MatMenuTrigger, MatMenuModule],
  templateUrl: './view-albums.component.html',
  styleUrl: './view-albums.component.css'
})
export class ViewAlbumsComponent implements OnInit {
  albums: any[] = [];
  filteredAlbums: any[] = [];
  searchQuery = '';
  totalAlbums = 0;
  albumsThisMonth = 0;
  projectId: string = '';
  isLoading =true;

  constructor(
    private route: ActivatedRoute, // ✅ Lấy projectId từ URL
    private router: Router,
    private albumService: AlbumService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    if (this.projectId) {
      this.loadAlbumsByProject();
    }
  }

  loadAlbumsByProject(): void {
    this.isLoading =true;
    this.albumService.getAlbumsByProjectId(this.projectId).subscribe({
      next: (data: any) => {
        if (data.isSuccess && data.result) {
          this.albums = data.result;
          console.log (this.albums)
          this.filteredAlbums = [...this.albums];
          this.totalAlbums = this.albums.length;
          this.albumsThisMonth = this.albums.filter(album =>
            new Date(album.createdAt).getMonth() === new Date().getMonth()
          ).length;
          this.isLoading =false;
        } else {
          console.warn('Không tìm thấy album nào cho dự án này.');
          this.albums = []; // Đảm bảo albums là mảng rỗng
          this.isLoading =false;
        }
      },
      error: (error) => {
        if (error.status === 404) {
          console.warn('Không có album nào.');
          this.isLoading =false;
        } else {
          console.error('Lỗi khi tải danh sách album', error);
          this.isLoading =false;
        }
        this.albums = []; // Nếu có lỗi, cũng đảm bảo albums là mảng rỗng
        this.isLoading =false;
      }
    });
  }
  confirmDeleteAlbum(albumId: string) {
    this.notificationService
      .showSwal(
        'Xác nhận xóa',
        'Bạn có chắc chắn muốn xóa album này? Hành động này không thể hoàn tác.',
        'warning',
        'Xóa',
        true
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.deleteAlbum(albumId);
        }
      });
  }

  deleteAlbum(albumId: string) {
    this.isLoading = true;  // Bật loading khi bắt đầu xóa album
    this.albumService.deleteAlbum(albumId).subscribe(
      (response) => {
        console.log('Album đã được xóa:', response);
        this.filteredAlbums = this.filteredAlbums.filter(album => album.id !== albumId);
        this.notificationService.showSwal('Đã xóa', 'Album đã được xóa thành công.', 'success', 'OK');
        this.isLoading = false;  // Tắt loading khi xóa thành công
      },
      (error) => {
        console.error('Lỗi khi xóa album:', error);
        this.notificationService.showSwal('Lỗi', 'Không thể xóa album. Vui lòng thử lại.', 'error', 'OK');
        this.isLoading = false;  // Tắt loading khi có lỗi
      }
    );
  }
  
  createAlbum(): void {
   
  
    const dialogRef = this.dialog.open(CreateAlbumComponent, {
      width: '500px',
      disableClose: false,
      data: { Id: this.projectId }
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Album mới:', result);
        this.isLoading =false;
        this.loadAlbumsByProject();  // Cập nhật danh sách album sau khi tạo album mới
      }
  
    });
  }
  

  filterAlbums(): void {
    this.filteredAlbums = this.albums.filter(album =>
      album.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  viewAlbumDetail(albumId: string): void {
    this.router.navigate(['/view-album-detail', albumId]); // ✅ Truyền albumId vào URL
  }
}
