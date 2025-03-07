import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { CustomerService } from '../../../customer/services/customer.service';
import { UserService } from '../../../user/services/user.service';
import { AlbumService } from '../../../album/services/albums.services';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../../../../shared/directives/notifications/notification.service';


@Component({
  selector: 'app-view-project-detail',
  imports: [CommonModule, MatIconModule],
  templateUrl: './view-project-detail.component.html',
  styleUrl: './view-project-detail.component.css'
})
export class ViewProjectDetailComponent implements OnInit {
  project: any;
  projectId: string = '';
  customer :any;
  photographer: any;
  albums : any;
  isLoading = true;
  assignee :any;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private customerService: CustomerService,
    private userService : UserService,
    private albumService: AlbumService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    console.log(this.projectId)
    if (this.projectId) {
      this.fetchProjectDetails();
    }
  }

  fetchProjectDetails(): void {
   this.isLoading =true;
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (data: any) => { // Fix here
        if (data.isSuccess && data.resultOnly) {
          this.project = data.resultOnly;
          console.log('Dữ liệu dự án:', this.project);
          console.log ('g',this.project.customerID)
          if (this.project.customerID) {
            console.log (this.project.customerID)
            this.fetchCustomerDetails(this.project.customerID);
          }
          if (this.project.employeeID) {
            this.fetchPhotographerDetails(this.project.employeeID);
          }
          
          this.fetchAlbums(this.projectId);
          console.log('iddd', this.projectId)
          this.isLoading =false;
        } else {
          console.error('Lỗi: Không có dữ liệu hợp lệ từ API');
          this.isLoading =false;
        }
      },
      error: (errors: any) => { // Fix here
        console.error('Lỗi khi lấy dữ liệu dự án:', errors);
        this.isLoading =false;
      }
    });
  }


  
  fetchAlbums(projectId: string): void {
    this.albumService.getAlbumsByProjectId(projectId).subscribe({
        next: (data: any) => {
            if (data.isSuccess && data.result) {
                this.albums = data.result;
                console.log('Danh sách Album:', this.albums);
            } else {
                console.warn('Không tìm thấy album nào.');
                this.albums = []; // Đặt albums thành mảng rỗng để hiển thị thông báo
            }
        },
        error: (error: HttpErrorResponse) => {
            if (error.status === 404) {
                console.warn('Không có album nào cho dự án này.');
                this.albums = []; // Đặt albums thành mảng rỗng
            } else {
                console.error('Lỗi khi lấy danh sách album:', error);
            }
        }
    });
}
getStageClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'chờ xác nhận': return 'status-pending';
    case 'đã nhận': return 'status-received';
    case 'đang xử lý': return 'status-processing';
    case 'hoàn thành': return 'status-completed';
    default: return 'status-default';
  }
}
  
  fetchAssigneeDetails(userID: string): void {
    this.userService.getUserById(userID).subscribe({
      next: (data: any) => {
        if ( data.resultOnly) {
          this.assignee = data.resultOnly;
          console.log('Dữ liệu Assignee:', this.assignee);
        } else {
          console.error('Lỗi: Không có dữ liệu người tạo hợp lệ');
        }
      },
      error: (errors: any) => {
        console.error('Lỗi khi lấy dữ liệu Assignee:', errors);
      }
    });
  }

  fetchPhotographerDetails(userID: string): void {
    this.userService.getUserById(userID).subscribe({
      next: (data: any) => {
        if ( data.resultOnly) {
          this.photographer = data.resultOnly;
          console.log('Dữ liệu Photographer:', this.photographer);
        } else {
          console.error('Lỗi: Không có dữ liệu Photographer hợp lệ');
        }
      },
      error: (errors: any) => {
        console.error('Lỗi khi lấy dữ liệu Photographer:', errors);
      }
    });
  }
  fetchCustomerDetails(customerID: string): void {
    this.customerService.getCustomerById(customerID).subscribe({
      next: (data: any) => {
        if (data.isSuccess && data.resultOnly) {
          this.customer = data.resultOnly;
          console.log('Dữ liệu khách hàng:', this.customer);
        } else {
          console.error('Lỗi: Không có dữ liệu khách hàng hợp lệ');
        }
      },
      error: (errors: any) => {
        console.error('Lỗi khi lấy dữ liệu khách hàng:', errors);
      }
    });
  }

  goToAlbums(): void {
    if (this.project?.status === 'Chờ Xác Nhận') {
      this.notificationService.showSwal(
        'Cảnh báo!',
        'Bạn phải chấp nhận dự án trước khi có thể quản lý album!',
        'warning',
        'OK'
      );
      return;
    }
  
    if (this.projectId) {
      this.router.navigate(['/view-albums', this.projectId]);
    }
  }
  
  editProject(): void {
    console.log("Chỉnh sửa dự án:", this.project);
  }

  cancelProject(): void {
    console.log("Dự án đã hủy:", this.project);
  }

 
}