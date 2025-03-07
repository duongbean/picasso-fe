import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { NotificationService } from '../../../../shared/directives/notifications/notification.service';
import { CustomValidators } from '../../../../shared/directives/validators/Validators';

import { Location } from '@angular/common';
import { RoleService } from '../../../../core/services/role.service';
import { CustomerService } from '../../services/customer.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-update-customer',
  imports: [MatButtonModule,ReactiveFormsModule,MatFormFieldModule,MatIconModule, MatInputModule,CommonModule, MatSelectModule],
  templateUrl: './update-customer.component.html',
  styleUrl: './update-customer.component.css'
})
export class UpdateCustomerComponent implements OnInit{
  
  userId: string | null = null;
  customerForm: FormGroup;
  isLoading: boolean = false;
  user: any = {}; // Prevents errors when accessing user properties

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private customerService: CustomerService,
    private location: Location,
    private notification: NotificationService
  ) {
    this.customerForm = this.fb.group({
      name: ['', CustomValidators.fullNameValidator],
      email: ['', [Validators.email]],
      phoneNumber: ['', [CustomValidators.phoneValidator]],
      gender: ['']
    });
  }
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id'); // ✅ Lấy ID từ URL
      if (this.userId) {
        this.loadCustomerData();
      }
    });

    this.customerForm = this.fb.group({
      name: ['',  CustomValidators.fullNameValidator],
      email: ['', [ Validators.email]],
      phoneNumber: ['', [ CustomValidators.phoneValidator]],
      gender: ['']
    });
  }

  // Tải thông tin khách hàng để cập nhật
  loadCustomerData(): void {
    this.customerService.getCustomerById(this.userId!).subscribe((response) => {
      if (response.isSuccess && response.resultOnly) {
        this.user = response.resultOnly;  // Assign user data
        this.customerForm.patchValue(response.resultOnly);
      }
    });
  }
  
  goBack() {
    this.location.back(); // Quay lại trang trước đó
  }
  // Cập nhật thông tin khách hàng
// Cập nhật thông tin khách hàng
updateCustomer() {
  console.log('🟢 Form Valid:', this.customerForm);

  if (this.customerForm.valid) {
    this.isLoading = true; // ✅ Bật trạng thái loading trước khi gửi yêu cầu

    this.customerService.updateCustomer(this.userId!, this.customerForm.value).subscribe({
      next: (response) => {
        console.log('✅ API Response:', response);
        
        this.notification.showSwal(
          'Cập nhật thành công!', 
          'Thông tin khách hàng đã được cập nhật.', 
          'success', 
          'OK'
        );
        
        this.isLoading = false; // ✅ Tắt loading khi cập nhật xong
      },
      error: (error) => {
        console.error('❌ API Error:', error);
        
        let errorMessage = 'Cập nhật thất bại. Vui lòng thử lại.';
        
        if (error.status === 400 && error.error.errors) {
          const errorKeys = Object.keys(error.error.errors);
          if (errorKeys.length > 0) {
            errorMessage = error.error.errors[errorKeys[0]][0]; // Lấy thông báo lỗi đầu tiên
          }
        }

        this.notification.showSwal(
          'Lỗi cập nhật', 
          errorMessage, 
          'error', 
          'Đóng'
        );

        this.isLoading = false; // ✅ Tắt loading nếu có lỗi
      }
    });
  } else {
    console.warn('⚠️ Form is invalid. Please check the fields.');
    
    this.notification.showSwal(
      'Lỗi nhập dữ liệu', 
      'Vui lòng điền đầy đủ thông tin hợp lệ.', 
      'warning', 
      'Đóng'
    );
  }
}
}