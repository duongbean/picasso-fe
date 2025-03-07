import { Component, OnInit,  } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../../customer/services/customer.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-view-customer-detail',
  imports: [MatIconModule, CommonModule, MatIconModule,MatProgressSpinner, RouterModule],
  templateUrl: './view-customer-detail.component.html',
  styleUrl: './view-customer-detail.component.css'
})
export class ViewCustomerDetailComponent implements OnInit {
  user: any;
   userId: string | null = null;
   isLoading: boolean = true;
   errorMessage: string | null = null;
   isAvatarLoaded: boolean = false;
   constructor(
     private route: ActivatedRoute,
     private customerService: CustomerService, 
     private location : Location,
     private router: Router
   ) {}
 
   ngOnInit(): void {
     this.route.paramMap.subscribe(params => {
       this.userId = params.get('id'); // Lấy ID từ URL
       console.log("🔍 ID từ URL:", this.userId);
       if (this.userId) {
         this.fetchUserDetail();
       } else {
         this.isLoading = false;
         this.errorMessage = 'Không tìm thấy thông tin người dùng.';
       }
     });
   }

   goToUpdateUser() {
    if (!this.userId) {
      console.error('❌ Error: userId is null or undefined!');
      return;
    }
    console.log("Navigating to update-customer with ID:", this.userId);
    this.router.navigate(['/update-customer', this.userId]);
  }
  
  
   goBack(): void {
     this.location.back(); // Quay lại trang trước đó
   }
   // Gọi API để lấy thông tin người dùng
   fetchUserDetail(): void {
     this.isLoading = true;
     this.customerService.getCustomerById(this.userId!).subscribe({
       next: (response) => {
         console.log('Dữ liệu người dùng:', response);
         if (response.isSuccess && response.resultOnly) {
           this.user = response.resultOnly;
         } else {
           this.errorMessage = response.message || 'Không thể tải thông tin người dùng.';
         }
         this.isLoading = false;
       },
       error: (error) => {
         console.error('API Error:', error);
         this.errorMessage = 'Lỗi khi tải thông tin người dùng.';
         this.isLoading = false;
       },
     });
   }
}
