import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { JwtService } from '../../../auth/services/jwt.service';
import { ProjectService } from '../../../photo-project/services/project.service';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { CustomerService } from '../../../customer/services/customer.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NotificationService } from '../../../../shared/directives/notifications/notification.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-view-photo-project',
  standalone: true,
  imports: [CommonModule,MatProgressSpinnerModule,MatDatepickerModule,MatNativeDateModule,MatInputModule,MatFormFieldModule,MatSelectModule, MatButtonModule, MatCardModule, MatIconModule, MatTabsModule, MatTableModule, MatMenuModule, MatChipsModule],
  templateUrl: './view-photo-project.component.html',
  styleUrls: ['./view-photo-project.component.css']
})
export class ViewPhotoProjectComponent implements OnInit {
  projects: any[] = [];  
  allprojects: any[] = []; 
  filteredProjects: any[] = [];
  customer : any;
  statusList = ['pending', 'received', 'processing', 'completed'];
  projectsByStatus: { [key: string]: any[] } = {};
  selectedStatus: string = '';
  searchText: string = '';
  isLoading = false;
  errorMessage: string | null = null;
  userId: string = ''; // Store userId from JWT
  statusMapping: { [key: string]: string } = {
    'chờ xác nhận': 'pending',
    'đã nhận': 'received',
    'đang xử lý': 'processing',
    'hoàn thành': 'completed'
  };
  constructor(private jwtService: JwtService, private notificationService: NotificationService ,private projectService: ProjectService, private router: Router, private customerService: CustomerService) {}

  ngOnInit(): void {
    this.isLoading = true; // Bật loading khi component khởi tạo
  
    this.userId = this.jwtService.getUserId() as string;
    if (this.userId) {
      this.fetchAllProjects();
    } else {
      this.errorMessage = "User not found";
      this.isLoading = false; //  Tắt loading nếu không có userId
    }
  }
  
  fetchProjects(): void {
    this.isLoading = true;
  
    // Lấy ngày hiện tại (hôm nay)
    const today = new Date();
    
    // Tạo ngày 1 tuần sau
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
  
    // Format ngày thành YYYY-MM-DD (định dạng phù hợp với API)
    const startTime = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const endTime = nextWeek.toISOString().split('T')[0]; // YYYY-MM-DD
  
    console.log(` Fetching projects from ${startTime} to ${endTime}`);
  
    // Gọi API với thời gian mặc định
    this.projectService.getProjectsByUser(this.userId, startTime, endTime).subscribe({
      next: (response) => {
        console.log('API Response:', response);
  
        if (response && Array.isArray(response.result) && response.result.length > 0) {
          this.projects = response.result;
          this.errorMessage = ''; // Xóa lỗi nếu có dữ liệu
          this.categorizeProjectsByStatus();
        } else {
          this.projects = [];
          this.errorMessage = 'Không có dự án nào!';
        }
  
        this.isLoading = false;
      },
      error: (error) => {
        console.error(' API Error:', error);
        this.errorMessage = 'Lỗi khi tải danh sách dự án!';
        this.isLoading = false;
      }
    });
  }
  
  
  fetchAllProjects(): void {
    this.isLoading = true;
    
    // Lấy tất cả các dự án của userId, không truyền thời gian
    this.projectService.getProjectsByUser(this.userId).subscribe({
      next: (response) => {
        console.log('All projects response:', response);
        
        if (response && Array.isArray(response.result) && response.result.length > 0) {
          this.allprojects = response.result;
        } else {
          this.allprojects = [];
        }
  
        // Sau khi lấy toàn bộ project, gọi tiếp API có filter thời gian
        this.fetchProjects();
      },
      error: (error) => {
        console.error('⚠️ Error fetching all projects:', error);
        this.allprojects = [];
        this.isLoading = false;
      }
    });
  }
 categorizeProjectsByStatus(): void {
  this.projectsByStatus = { pending: [], received: [], processing: [], completed: [] };

  this.projects.forEach(project => {
    const statusVi = project.status.toLowerCase().trim(); 
    console.log('Original Status:', statusVi);
    if (project.customerID) {
      console.log (project.customerID)
      this.fetchCustomerDetails(project.customerID);
    }
    const statusEn = this.statusMapping[statusVi] || 'pending'; 
    console.log('Mapped Status:', statusEn);

    if (this.projectsByStatus[statusEn]) {
      this.projectsByStatus[statusEn].push(project);
    }
  });

  console.log('Categorized Projects:', this.projectsByStatus);
}

fetchCustomerDetails(customerID: string): void {
  this.customerService.getCustomerById(customerID).subscribe({
    next: (data: any) => {
      if (data.isSuccess && data.resultOnly) {
        this.customer = data.resultOnly;
        console.log('Dữ liệu khách hàng:', this.customer);
      } else {
        console.error(' Lỗi: Không có dữ liệu khách hàng hợp lệ');
      }
    },
    error: (errors: any) => {
      console.error('Lỗi khi lấy dữ liệu khách hàng:', errors);
    }
  });
}

  getProjectsByStatus(status: string) {
    return this.projectsByStatus[status] || [];
  }

  getProjectCount(status: string): number {
    return this.getProjectsByStatus(status).length;
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
  getLocationClass(roomName: string): string {
    if (!roomName) return 'khoang-default'; // Tránh lỗi nếu roomName bị null hoặc undefined

    const normalizedRoom = roomName.trim().toLowerCase(); // Chuẩn hóa chuỗi (bỏ khoảng trắng, viết thường)

    if (normalizedRoom === 'khoang 1') return 'khoang-1';
    if (normalizedRoom === 'khoang 2') return 'khoang-2';

    return 'khoang-default'; // Class mặc định nếu không khớp
}

  goToProjectDetail(projectId: string) {
    console.log('project id tuong ung',projectId)
    this.router.navigate(['/view-project-detail', projectId]);
  }

  acceptProject(projectId: string) {
    this.notificationService
      .showSwal(
        'Xác nhận',
        'Bạn có chắc chắn muốn chấp nhận dự án này?',
        'warning',
        'Đồng ý',
        true
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.isLoading = true; 
  
          this.projectService.updateProjectStatus(projectId, 'Đã Nhận').subscribe(
            (response) => {
              console.log('Project accepted:', response);
              
              this.notificationService.showSwalWithTimeOut(
                'Thành công',
                'Dự án đã được chấp nhận!',
                'success',
                'OK',
                false,
                2000 // Tự động đóng sau 2 giây
              );
  
              this.fetchProjects(); // Load lại danh sách sau khi cập nhật
            },
            (error) => {
              console.error('Error accepting project:', error);
              
              this.notificationService.showSwal(
                'Lỗi',
                'Có lỗi xảy ra khi chấp nhận dự án!',
                'error',
                'Đóng'
              );
            },
            () => {
              this.isLoading = false; 
            }
          );
        }
      });
  }
  

rejectProject(projectId: string) {
    this.projectService.updateProjectStatus(projectId, 'rejected').subscribe(
      (response) => {
        console.log('Project rejected:', response);
        this.fetchProjects(); // Load lại danh sách sau khi cập nhật
      },
      (error) => {
        console.error('Error rejecting project:', error);
      }
    );
}
onFilter(): void {
  // Lấy giá trị từ input
  const startTime = (document.getElementById('start-date') as HTMLInputElement).value;
  const endTime = (document.getElementById('end-date') as HTMLInputElement).value;

  // Kiểm tra nếu một trong hai giá trị bị thiếu
  if (!startTime || !endTime) {
    console.warn(' Hãy chọn cả "Từ ngày" và "Đến ngày" trước khi lọc.');
    return;
  }

  // Kiểm tra nếu "Từ ngày" lớn hơn "Đến ngày"
  if (new Date(startTime) > new Date(endTime)) {
    console.error('Lỗi: "Từ ngày" không thể sau "Đến ngày"!');
    return;
  }

  this.isLoading = true; // Bật loading trước khi gọi API
  console.log('Filtering projects from', startTime, 'to', endTime);

  this.projectService.getProjectsByUser(this.userId, startTime, endTime)
    .subscribe({
      next: (res) => {
        console.log(' API Response:', res);

        if (res && res.result && Array.isArray(res.result)) {
          this.projects = res.result;
        } else {
          this.projects = [];
        }

        // Reset lại danh sách dự án theo trạng thái
        this.categorizeProjectsByStatus();

        // Cập nhật thông báo lỗi nếu không có dữ liệu
        this.errorMessage = this.projects.length > 0 ? '' : 'Không có dự án nào!';
      },
      error: (err) => {
        console.error('API Error:', err);
        this.projects = [];
        this.projectsByStatus = { pending: [], received: [], processing: [], completed: [] };
        this.errorMessage = 'Lỗi khi tải danh sách dự án!';
      },
      complete: () => {
        this.isLoading = false; //  Tắt overlay khi API hoàn tất
      }
    });
}

}