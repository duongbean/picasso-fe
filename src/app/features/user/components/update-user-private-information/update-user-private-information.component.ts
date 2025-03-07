import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RoleService } from '../../../../core/services/role.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Location } from '@angular/common';
import { ImageService } from '../../services/image.service';
import { GetImageRequest, SaveImageRequest } from '../../models/image.model';
import { AzureBlobService } from '../../../../shared/services/azure-blob.service';
import { JwtService } from '../../../auth/services/jwt.service';
import { User, UserInfoDetail } from '../../../auth/models/user.model';
import { CustomValidators } from '../../../../shared/directives/validators/Validators';
import { AddressService } from '../../services/address.service';
import {
  GetAllDistrictsByProvinceCodeRequest,
  GetAllProvincesRequest,
  GetAllWardsByDistrictCodeRequest,
} from '../../models/address.model';
import { response } from 'express';
import { UpdateUserPrivateInformationRequest } from '../../models/user.model';
@Component({
  selector: 'app-update-user-private-information',
  imports: [
    MatProgressSpinnerModule,
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],

  templateUrl: './update-user-private-information.component.html',
  styleUrls: ['./update-user-private-information.component.css'],
})
export class UpdateUserPrivateInformationComponent {
  user: any;
  provinces!: any[];
  districts!: any[];
  wards!: any[];
  isLoading: boolean = false;
  userForm: FormGroup;
  selectedFile: File | null = null;
  imageUrl: any; // Default avatar
  currentImageUrl: any;
  userId = 1; // Example user ID
  isModalOpen = false;
  private isAvatarLoaded: boolean = false;
  private isAddressLoaded: boolean = false;

  // Ward Object Dictionary:
  wardsMap: { [key: string]: any } = {};

  ngOnInit() {
    this.isLoading = true;

    const userId = this.jwtService.getUserId();
    console.log('USER ID from Token: ', userId);

    this.userService.getUserById(userId!).subscribe({
      next: (response) => {
        console.log('✅ Dữ liệu người dùng tu update:', response);
        if (response.isSuccess && response.resultOnly) {
          this.user = response.resultOnly;
          console.log('User get by Service: ', this.user);
          this.userForm.patchValue({
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            middleName: this.user.middleName,
            gender: Number(this.user.gender),
            dob: this.user.dateOfBirth,
            fullAddress: this.user.fullAddress,
            phoneNumber: this.user.phoneNumber,
            // province: '674bc7d3336588734e5049ee',
            ward: this.user.wardID,
            provinve: this.user.cityID,
            district: this.user.districtID,
          });
          const getImageRequest: GetImageRequest = {
            avatarUrl: this.user.avatarUrl,
          };
          this.imageService.getAvatar(getImageRequest).subscribe(
            (response) => {
              console.log('Get Image From Azure Blob API: ', response);
              this.imageUrl = response.sasUrl;
              this.currentImageUrl = response.sasUrl;
              this.isAvatarLoaded = true;
              this.checkIfLoadingComplete();
              // this.isLoading = false;
            },
            (error) => {
              this.isAvatarLoaded = true;
              this.checkIfLoadingComplete();
              // this.isLoading = false;
            }
          );
          const getAllProvincesRequest: GetAllProvincesRequest = {
            limit: -1,
          };

          // Get All Wards:
          // this.addressService.loadWards();
          // const wardFind = this.addressService.getWardById(String(this.ward));
          // console.log('Ward Find by ID: ', wardFind);
          if (this.user.address) {
            console.log('Address in DB is NOT NULL');

            this.addressService.loadWards().subscribe((isLoaded) => {
              if (isLoaded) {
                const wardFind = this.addressService.getWardById(
                  String(this.ward?.value)
                );
                console.log('Ward ID get from cookie: ', this.ward?.value);
                console.log('✅ Ward Found by ID:', wardFind);
                if (wardFind) {
                  // Get All Districts and then Find District By Ward's Parent Code
                  this.addressService
                    .loadDistricts()
                    .subscribe((isDistrictsLoaded) => {
                      if (isDistrictsLoaded) {
                        const districtFind =
                          this.addressService.getDistrictById(
                            wardFind.parent_code
                          );
                        console.log(
                          '✅ District Found by Ward Parent Code:',
                          districtFind
                        );
                        const provinceFind = districtFind?.parent_code;
                        this.userForm.patchValue({
                          ward: wardFind.code,
                          district: districtFind?.code,
                          province: provinceFind,
                        });
                        // ✅ Load danh sách district của province đó
                        this.onProvinceChange(String(provinceFind) || '');
                        // ✅ Load danh sách wards của district đó
                        this.onDistrictChange(String(districtFind?.code) || '');
                        this.isAddressLoaded = true;
                        this.checkIfLoadingComplete();
                        this.addressService
                          .getAllProvinces(getAllProvincesRequest)
                          .subscribe((response) => {
                            console.log(
                              'Address API response - Get All Provinces: ',
                              response
                            );
                            this.provinces = response.data.data;
                            console.log('Inside Api Address: ', this.provinces);
                          });
                        console.log('Outside Api Address: ', this.provinces);
                        // this.province = districtFind?.parent_code;
                      } else {
                        console.error(
                          '❌ Districts were not loaded successfully.'
                        );
                      }
                    });
                }
              } else {
                console.error('❌ Wards were not loaded successfully.');
              }
            });
          } else {
            console.log('Address in DB is NULL');
            this.addressService
              .getAllProvinces(getAllProvincesRequest)
              .subscribe((response) => {
                console.log(
                  'Address API response - Get All Provinces: ',
                  response
                );
                this.isAddressLoaded = true;
                this.checkIfLoadingComplete();
                this.provinces = response.data.data;
                console.log('Inside Api Address: ', this.provinces);
              });
            console.log('Outside Api Address: ', this.provinces);
          }
          // Get All Wards and then Find Ward By ID
        } else {
          // this.errorMessage =
          //   response.message || 'Không thể tải thông tin người dùng.';
        }
      },
      error: (error) => {
        console.log('❌ API Error:', error);
        // this.errorMessage = 'Lỗi khi tải thông tin người dùng.';
        // this.isLoading = false;
      },
    });
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private location: Location,
    private imageService: ImageService,
    private azureBlobService: AzureBlobService,
    private jwtService: JwtService,
    private addressService: AddressService
  ) {
    this.userForm = this.fb.group({
      firstName: ['', CustomValidators.nameValidator],
      lastName: ['', CustomValidators.nameValidator],
      middleName: ['', CustomValidators.nameValidator],
      dob: ['', [Validators.required]],
      gender: [2, Validators.required], // Default: Nữ
      phoneNumber: ['', Validators.required],
      fullAddress: [''],
      province: ['', Validators.required],
      district: ['', Validators.required],
      ward: ['', Validators.required],
    });
  }

  // Khi cần lấy thông tin xã theo ID
  findWard(wardId: string) {
    const ward = this.addressService.getWardById(wardId);
    if (ward) {
      // this.wardName = ward.name_with_type;
      console.log('🔎 Xã tìm thấy:', ward);
    } else {
      // this.wardName = 'Không tìm thấy!';
      console.log('🔎 Xã tìm thấy: NULL');
    }
  }

  get firstName() {
    return this.userForm.get('firstName');
  }
  get lastName() {
    return this.userForm.get('lastName');
  }
  get middleName() {
    return this.userForm.get('middleName');
  }
  get dob() {
    return this.userForm.get('dob');
  }
  get gender() {
    return this.userForm.get('gender');
  }
  get phoneNumber() {
    return this.userForm.get('phoneNumber');
  }
  get fullAddress() {
    return this.userForm.get('fullAddress');
  }
  get ward() {
    return this.userForm.get('ward');
  }
  get province() {
    return this.userForm.get('province');
  }
  get district() {
    return this.userForm.get('district');
  }
  goBack(): void {
    this.location.back(); // Quay lại trang trước đó
  }

  // openModal() {
  //   this.isModalOpen = true;

  //   // Add a dark overlay instead of changing the body opacity
  //   const overlay = document.createElement('div');
  //   overlay.id = 'modal-overlay';
  //   overlay.style.position = 'fixed';
  //   overlay.style.top = '0';
  //   overlay.style.left = '250px';
  //   overlay.style.width = '100vw';
  //   overlay.style.height = '100vh';
  //   overlay.style.background = 'rgba(0, 0, 0, 0.6)'; // Dark but not affecting modal
  //   overlay.style.zIndex = '998'; // Behind the modal
  //   document.body.appendChild(overlay);
  // }

  // closeModal() {
  //   this.isModalOpen = false;
  //   // Reset body opacity when closing modal
  //   // document.body.style.opacity = '1';

  //   // Remove the overlay when closing
  //   const overlay = document.getElementById('modal-overlay');
  //   if (overlay) {
  //     overlay.remove();
  //   }
  // }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.imageUrl = this.currentImageUrl;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // **Show preview before uploading**
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imageUrl = reader.result as string; // Update image preview
      };
    }
  }

  uploadAvatar() {
    if (!this.selectedFile) {
      alert('Please select a file!');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    const saveImageRequest: SaveImageRequest = {
      userId: this.user.id,
      file: this.selectedFile as File,
    };

    this.imageService.uploadAvatar(saveImageRequest).subscribe(
      (response: any) => {
        console.log('File uploaded successfully:', response);

        // Assuming the API response contains the image URL
        if (response.imageUrl) {
          this.imageUrl = response.imageUrl; // Save the URL for display
        } else {
          console.error('No image URL returned from the API');
        }

        this.closeModal(); // Close modal after upload
      },
      (error) => {
        console.log('Error uploading file:', error);
        alert('File upload failed!');
      }
    );
  }

  deleteAvatar() {
    this.imageUrl = 'assets/images/avatar default.jpg'; // Reset to default
    this.selectedFile = null;
  }

  onProvinceChange(provinceCode: string) {
    console.log('Province Code choosed: ', provinceCode);
    const getAllDistrictsByProvinceCode: GetAllDistrictsByProvinceCodeRequest =
      {
        provinceCode: provinceCode,
        limit: -1,
      };
    this.addressService
      .getAllDistrictsByProvinceCode(getAllDistrictsByProvinceCode)
      .subscribe((response) => {
        console.log('API get District By Province: ', response.data);
        this.districts = response.data.data;
        console.log('districts: ', this.districts);
      });
    this.wards = [];
  }
  onDistrictChange(districtCode: string) {
    console.log('District Code choosed: ', districtCode);
    const getAllWardsByProvinceCode: GetAllWardsByDistrictCodeRequest = {
      districtCode: districtCode,
      limit: -1,
    };
    this.addressService
      .getAllWardsByDistrictCode(getAllWardsByProvinceCode)
      .subscribe((response) => {
        console.log('API get Ward By District: ', response.data);
        this.wards = response.data.data;
        console.log('wards: ', this.wards);
      });
  }

  saveUpdate() {
    console.log('Save Update');
    this.isLoading = true;
    const updateUserPrivateInformation: UpdateUserPrivateInformationRequest = {
      firstName: this.firstName?.value || '',
      middleName: this.middleName?.value || '',
      lastName: this.lastName?.value || '',
      gender: this.gender?.value || '',
      dateOfBirth: this.dob?.value || '',
      phoneNumber: this.phoneNumber?.value || '',
      // address: this.ward?.value || '',
      wardID: this.ward?.value || '',
      cityID: this.province?.value || '',
      districtID: this.district?.value || '',
      fullAddress: this.fullAddress?.value || '',
    };
    this.userService
      .updateUserPrivateInformation(this.user.id, updateUserPrivateInformation)
      .subscribe((response) => {
        this.isLoading = false;
        console.log('Update user API - response: ', response);
      });
  }
  private checkIfLoadingComplete() {
    if (this.isAvatarLoaded && this.isAddressLoaded) {
      this.isLoading = false;
      console.log('✅ All Data Loaded Successfully!');
    }
  }
}
