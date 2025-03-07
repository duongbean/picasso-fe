import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import {
  GetListDistricts,
  GetListProvinces,
  GetListWards,
} from '../../../../shared/models/address.model';
import { AddressService } from '../../../../shared/services/addresss.service';
import { response } from 'express';
import { error } from 'console';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';
import { CustomValidators } from '../../../../shared/directives/validators/Validators';

import { CustomerService } from '../../services/customer.service';
import { NotificationService } from '../../../../shared/directives/notifications/notification.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-create-customer',
  imports: [MatDialogModule,
      MatButtonModule,
      MatSelectModule,
      CommonModule,
      ReactiveFormsModule,
      ],
  templateUrl: './create-customer.component.html',
  styleUrl: './create-customer.component.css'
})
export class CreateCustomerComponent {
  createCustomerForm: FormGroup;
   provinces: GetListProvinces[] = [];
   districts: GetListDistricts[] = [];
   wards: GetListWards[] = [];
   isLoading: boolean = false;
   isOnSubmit: boolean = false;
 
   // filter var
   provinceFilterCtrl = new FormControl<string | null>('', {
     nonNullable: true,
   });
   filteredProvinces: GetListProvinces[] = [];
 
   /** Subject that emits when the component has been destroyed. */
 
   constructor(
     private formBuilder: FormBuilder,
     private addressService: AddressService,
     private customerService: CustomerService,
     private notificationService: NotificationService,
     private router: Router
  
   ) {
     this.createCustomerForm = this.formBuilder.group({
       lastName: ['', [CustomValidators.nameValidator]],
       middleName: ['', []],
       firstName: ['', [CustomValidators.nameValidator]],
       email: ['', [Validators.required, Validators.email]],
       phoneNumber: ['', [Validators.required]],
       gender: [1, Validators.required],
       selectedProvinceId: ['', [Validators.required]],
       selectedDistrictId: ['', [Validators.required]],
       selectedWardId: ['', [Validators.required]],
       detailAddress: ['', []],
     });
   }
 
   ngOnInit() {
     console.log('ON INIT Customer Create Page');
     this.isLoading = true;
     // Call API - Get list provinces
     this.addressService.getListProvinces().subscribe(
       (response) => {
         console.log('Call API - get provinces: ', response);
         this.provinces = response.result.map((province: any) => ({
           id: province.id,
           name: province.name,
         }));
         console.log('MAPPING API - get provinces: ', this.provinces);
         this.isLoading = false;
       },
       (error) => {
         console.log('Call API ERROR - get provinces: ', error);
       }
     );
   }
 
   get lastName() {
     return this.createCustomerForm.get('lastName');
   }
 
   get middleName() {
     return this.createCustomerForm.get('middleName');
   }
 
   get firstName() {
     return this.createCustomerForm.get('firstName');
   }
 
   get email() {
     return this.createCustomerForm.get('email');
   }
 
   get gender() {
     return this.createCustomerForm.get('gender');
   }
 
   get phoneNumber() {
     return this.createCustomerForm.get('phoneNumber');
   }
 
   get selectedProvinceId() {
     return this.createCustomerForm.get('selectedProvinceId');
   }
 
   get selectedDistrictId() {
     return this.createCustomerForm.get('selectedDistrictId');
   }
 
   get selectedWardId() {
     return this.createCustomerForm.get('selectedWardId');
   }
 
   get detailAddress() {
     return this.createCustomerForm.get('detailAddress');
   }
 
   onProvinceChange(provinceId: string) {
     console.log('ON CHANGE SELECTION - Province: ', provinceId);
 
     this.isLoading = true;
     // reset selected district
     this.createCustomerForm.get('selectedDistrictId')?.setValue('');
 
     // reset selected ward
     this.createCustomerForm.get('selectedWardId')?.setValue('');
 
     // Call API - Get list districts by provinceId
     this.addressService
       .getListDistrictsByProvinceId(this.selectedProvinceId?.value)
       .subscribe((response) => {
         console.log('Call API - Get list Districts: ', response);
         this.districts = response.result.map((district: any) => ({
           id: district.id,
           name: district.name,
           provinceId: district.cityId,
         }));
         this.isLoading = false;
       });
 
     // reset wards list
     this.wards = [];
   }
 
   onDistrictChange(districtId: string) {
     console.log('ON CHANGE SELECTION - Province: ', districtId);
     this.isLoading = true;
 
     this.addressService
       .getListWarssByDistrictId(districtId)
       .subscribe((response) => {
         console.log('Call API - Get list Wards: ', response);
         this.wards = response.result.map((ward: any) => ({
           id: ward.id,
           name: ward.name,
           districtId: ward.districtId,
         }));
         this.isLoading = false;
       });
   }
 
   filterProvinces() {
     if (!this.provinces) {
       return;
     }
 
     // get the search keyword
     let search = this.provinceFilterCtrl.value;
     console.log('Search keyword: ', search);
     if (!search) {
       return;
     } else {
       search = search.toLowerCase();
     }
   }
 
   OnSubmitCreateCustomer() {
    this.isOnSubmit = true;
    console.log('On Customer Create Submit Click!');
  
    // Khai báo request đúng định dạng
    const request = {
      firstName: this.firstName?.value,
      middleName: this.middleName?.value,
      lastName: this.lastName?.value,
      gender: this.gender?.value,
      email: this.email?.value,
      phoneNumber: this.phoneNumber?.value,
      wardId: this.selectedWardId?.value,
      detailAddress: this.detailAddress?.value,
    };
  
    console.log('Request before Calling API: ', request);
  
    // Kiểm tra form có hợp lệ không
    if (this.createCustomerForm.valid) {
      this.isLoading = true;
      console.log('Form is valid now!');
      this.customerService.createCustomer(request).subscribe(
        (response) => {
          console.log('API - Create Customer Response: ', response);
          this.isLoading =false;
          this.notificationService.showSwalWithTimeOut(
            'Tạo mới khách hàng thành công',
            'Bạn có thể tiếp tục tạo khách hàng',
            'success',
            'OK',
            false,
            5000,
            true
          ); // ⏳ **Chờ 3 giây trước khi chuyển trang**
          setTimeout(() => {
            this.router.navigate(['/view-customer']); // Chuyển hướng về trang danh sách khách hàng
          }, 5000); // Delay 3 giây để người dùng thấy thông báo
        },
        (error) => {
          console.error('Error Call API: ', error);
          this.isLoading =false;
          this.notificationService.showSwalWithTimeOut(
            'Tạo mới khách hàng không thành công',
            'Vui lòng thử lại!',
            'error',
            'OK',
            false,
            3000,
            true
          );
        }
      );
    } else {
      console.log('Form is NOT valid now!');
    }
  }
  onCancel() {
    console.log('Hủy bỏ tạo khách hàng');
    this.createCustomerForm.reset(); // Reset form nếu cần
  }
  
}  

