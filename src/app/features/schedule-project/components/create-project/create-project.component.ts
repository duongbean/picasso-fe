import { CommonModule, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import {
  GetListCustomersResponse,
  GetListPhotographersResponse,
} from '../../models/user.model';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import {
  GetListRoomResponse,
  RequestCreateProject,
  RequestGetListPhotographersValid,
  RequestGetListRoomsValid,
  SlotTime,
  TypeProject,
} from '../../models/project.model';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { EmployeeService } from '../../services/employee.service';
import { response } from 'express';
import { ScheduleProjectService } from '../../services/schedule-project.service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CreateCustomerComponent } from './sub-components/create-customer/create-customer.component';
import { LoadingSpinnerComponent } from '../../../../shared/layouts/loading-spinner/loading-spinner.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { CustomValidators } from '../../../../shared/directives/validators/Validators';
import Swal from 'sweetalert2';
import { NotificationService } from '../../../../shared/directives/notifications/notification.service';

@Component({
  selector: 'app-create-project',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.css',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProjectComponent {
  @ViewChild('customerSelectContainer', { static: false })
  customerSelectContainer!: ElementRef;
  @ViewChild('customerEmailInput', { static: false })
  customerEmailInput!: ElementRef;
  @ViewChild('selectedCustomerContainer', { static: false })
  selectedCustomerContainer!: ElementRef;

  createProjectForm: FormGroup;
  // selectedStartSlotTimeId!: number;
  selectedCustomer!: GetListCustomersResponse;
  // customerId!: string;
  selectedType!: string;
  // currentDate!: Date;
  isVisible = false;
  isLoading: boolean = true;
  isPhotographersLoading: boolean = false;
  isRoomsLoading: boolean = false;
  minDate: Date = new Date();
  isOnSubmit = false;

  // navigated var
  roomIdNavigated: string = '';
  slotTimeIdNavigate: number = 0;
  currentDateNavigate: any = '';

  slotTimes: SlotTime[] = [];
  temporarySlotTimes: SlotTime[] = [];
  filteredEndSlotTimes: SlotTime[] = [];

  photographers: GetListPhotographersResponse[] = [];

  rooms: GetListRoomResponse[] = [];

  customers: GetListCustomersResponse[] = [];

  indexTimeSlot: number = 0;

  // Form control for the email input field
  customerEmailControl = new FormControl('');

  // Initialize filter list
  filteredCustomers: any[] = [];

  ngOnInit() {
    this.generateSlotTimes();
    console.log('Slot Times Generate: ', this.slotTimes);

    // Get Parameters from previous Page
    // const navigation = this.router.getCurrentNavigation();
    // const state = navigation?.extras.state;
    // console.log('State: ', state);

    this.route.queryParams.subscribe((params) => {
      this.slotTimeIdNavigate = params['slotTimeId'];
      this.roomIdNavigated = params['roomId'];
      this.currentDateNavigate = new Date(params['currentDate']);

      this.createProjectForm.patchValue({
        selectedRoomId: this.roomIdNavigated,
        selectedStartSlotTimeId: +this.slotTimeIdNavigate,
        selectedEndSlotTimeId:
          +this.slotTimeIdNavigate < 48 ? +this.slotTimeIdNavigate + 1 : null,
        currentDate: this.currentDateNavigate,
      });

      console.log('After fetching: ', this.createProjectForm.value);
      console.log('Params: ', params);
      console.log('Time navigated: ', this.slotTimeIdNavigate);
      console.log('Room navigated: ', this.roomIdNavigated);
      console.log('Current Date navigated: ', this.currentDateNavigate);
      this.reloadSlotTime();
    });

    // Call Service - Get list photographers from API
    this.userService.getListPhotographers().subscribe((response) => {
      if (response.isSuccess) {
        this.photographers = response.result.map((photographer: any) => ({
          id: photographer.id,
          username:
            photographer.lastName +
            ' ' +
            photographer.middleName +
            ' ' +
            photographer.firstName,
          firstName: photographer.firstName,
          lastName: photographer.lastName,
          middleName: photographer.middleName,
          isActive: photographer.isActive,
          email: photographer.email,
        }));
        this.isPhotographersLoading = true;
        console.log('Load Photo DONE');
        this.checkLoadingSpinner();
      }
      console.log(
        'CREATE PROJECT - MAPPING - get list photographers real: ',
        this.photographers
      );
    });

    // Call Service - Get list rooms from API
    this.projectService.getListRooms().subscribe((response) => {
      console.log('CREATE PROJECT - API call - get list rooms: ', response);
      this.rooms = response.result.map((room: any) => ({
        id: room.id,
        name: room.name,
        isActive: room.isActive,
      }));

      console.log(
        'CREATE PROJECT - MAPPING - get list rooms real: ',
        this.rooms
      );
      this.isRoomsLoading = true;
      console.log('Load Room DONE');
      this.checkLoadingSpinner();
    });

    this.customerService.getListCustomers().subscribe((response) => {
      console.log('Call API - get list customers by Email: ', response);
      this.customers = response.resultOnly.map((customer: any) => ({
        id: customer.id,
        email: customer.email,
        name: `${customer.lastName} ${
          customer.middleName ? customer.middleName + ' ' : ''
        }${customer.firstName}`,
        gender: customer.gender,
        phoneNumber: customer.phoneNumber,
        numberOfAppoitment: 1,
      }));

      this.filteredCustomers = this.customers;
    });

    // Subcribe for the Email form control change
    this.customerEmailControl.valueChanges.subscribe((searchTerm: any) => {
      console.log('Email control form on change - search term: ', searchTerm);
      this.filterCustomers(searchTerm);
    });
  }

  constructor(
    private formBuilder: FormBuilder,
    private userService: EmployeeService,
    private projectService: ScheduleProjectService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private notificationService: NotificationService
  ) {
    this.createProjectForm = this.formBuilder.group({
      // name: ['', CustomValidators.invalidString],
      name: ['', CustomValidators.invalidString],
      selectedPhotographer: ['', Validators.required],
      selectedRoomId: ['', Validators.required],
      selectedStartSlotTimeId: 0,
      selectedEndSlotTimeId: 0,
      selectedCustomer: ['', Validators.required],
      currentDate: new Date(),
    });
  }

  get name() {
    return this.createProjectForm.get('name')?.value;
  }
  get selectedPhotographer() {
    return this.createProjectForm.get('selectedPhotographer')?.value;
  }
  get selectedRoomId() {
    return this.createProjectForm.get('selectedRoomId')?.value;
  }
  get selectedStartSlotTimeId() {
    return this.createProjectForm.get('selectedStartSlotTimeId')?.value;
  }
  get selectedEndSlotTimeId() {
    return this.createProjectForm.get('selectedEndSlotTimeId')?.value;
  }
  get endTime() {
    return this.createProjectForm.get('endTime')?.value;
  }
  get customerId() {
    return this.createProjectForm.get('selectedCustomer')?.value;
  }
  get currentDate() {
    return this.createProjectForm.get('currentDate')?.value;
  }

  // Gen slot time - 30 minutes each slot
  generateSlotTimes(): void {
    this.temporarySlotTimes = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        this.indexTimeSlot++;
        let timeString = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        this.temporarySlotTimes.push({
          time: timeString,
          id: this.indexTimeSlot,
        });
      }
    }
  }

  // Go back to the previous page
  goBack() {
    console.log('GO BACK');
    this.location.back();
  }

  // Function to filter customers based on input
  filterCustomers(searchTerm: string) {
    if (searchTerm) {
      console.log('In Searching: ', searchTerm);
      this.filteredCustomers = this.customers.filter(
        (customer) =>
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phoneNumber.includes(searchTerm) ||
          customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      this.filteredCustomers = this.customers; // Show all customers if input is empty
    }
  }

  // Function to filter customers based on input
  // filterCustomers(searchTerm: string) {
  //   if (searchTerm) {
  //     console.log('In Searching: ', searchTerm);
  //     this.filteredCustomers = this.customers.filter((customer) => {
  //       // Log customer details to check
  //       console.log('Checking customer:', customer);

  //       // Log the individual checks for email, phone number, and name
  //       const emailMatch = customer.email
  //         .toLowerCase()
  //         .includes(searchTerm.toLowerCase());
  //       console.log('Email match:', emailMatch, 'for', customer.email);

  //       // const phoneMatch = customer.phoneNumber.includes(searchTerm);
  //       // console.log(
  //       //   'Phone number match:',
  //       //   phoneMatch,
  //       //   'for',
  //       //   customer.phoneNumber
  //       // );

  //       const nameMatch = customer.name
  //         .toLowerCase()
  //         .includes(searchTerm.toLowerCase());
  //       console.log('Name match:', nameMatch, 'for', customer.name);

  //       // Return true if any condition matches
  //       return emailMatch || nameMatch;
  //     });
  //   } else {
  //     this.filteredCustomers = this.customers; // Show all customers if input is empty
  //   }
  //   console.log(
  //     'With searching term - ',
  //     searchTerm,
  //     ' filtered customers = ',
  //     this.filteredCustomers
  //   );
  // }

  // Display the div after email input field - for actor choose the exist customer (or add new customer)
  customerSelectDisplay() {
    this.isVisible = true;
    this.customerSelectContainer.nativeElement.style.display = 'block';
    this.customerEmailInput.nativeElement.style.color = '#fff';
  }

  // Khi người dùng bắt đầu nhập
  onInputChange() {
    this.customerEmailInput.nativeElement.style.color = '#000';
  }

  // Choose the customer that is already existed -> the div display none
  customerSelect(customer: GetListCustomersResponse) {
    this.selectedCustomer = customer;
    console.log(
      'In Selecting Customer - Selected Customer: ',
      this.selectedCustomer
    );
    this.createProjectForm.get('selectedCustomer')?.setValue(customer.id);
    this.closeCustomerSelect();
    console.log('Clicked customer - display to BLOCK');
    // Display the selected customer in the Control form
    this.selectedCustomerContainer.nativeElement.style.visibility = 'visible';

    // Expand the input field larger
    this.customerEmailInput.nativeElement.style.height = '60px';
    this.customerEmailInput.nativeElement.placeholder = '';
  }

  closeCustomerSelect() {
    this.isVisible = false;
    this.customerSelectContainer.nativeElement.style.display = 'none';
  }

  // Display popup Create new customer -> the div display none
  addCustomer() {
    this.isVisible = false;
    this.customerSelectContainer.nativeElement.style.display = 'none';
  }

  // Click outside the customer select div -> close div
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.isVisible && this.customerSelectContainer) {
      if (this.customerEmailInput) {
        // When not click on Email input field && customer select container div
        if (
          !this.customerSelectContainer.nativeElement.contains(event.target) &&
          !this.customerEmailInput.nativeElement.contains(event.target)
        ) {
          this.closeCustomerSelect(); // Hide when clicking outside
        }
      } else {
        console.log(' KO LOAD DUOC EMAIL input');
        this.closeCustomerSelect(); // Hide when clicking outside
      }
    }
  }

  // Dialog
  readonly dialog = inject(MatDialog);

  openDialog() {
    const dialogRef = this.dialog.open(CreateCustomerComponent, {
      // backdropClass: 'custom-backdrop',
      panelClass: 'custom-dialog',
      // maxWidth: '600px',
      // width: '100%',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  // Check spinner loading
  checkLoadingSpinner() {
    if (this.isPhotographersLoading && this.isRoomsLoading) {
      this.isLoading = false;
      console.log('✅ Spinner should now be hidden');
    }
  }

  // Close Selected Customer div when click Close Icon
  closeSelectedCustomer(): void {
    console.log('Close icon clicked!');
    this.selectedCustomerContainer.nativeElement.style.visibility = 'hidden';
    this.customerEmailInput.nativeElement.style.height = '50px';
    this.customerEmailInput.nativeElement.placeholder =
      'Nhập email, tên hoặc số điện thoại của khách hàng';
    this.createProjectForm.get('selectedCustomer')?.setValue('');
  }

  // Cancel to create Project => Go back
  confirmCancel() {
    console.log('Confirm Cancel!');
    this.notificationService
      .showSwal(
        'Xác nhận',
        'Bạn có chắc muốn thoát Tạo mới lịch chụp?',
        'warning',
        'Thoát',
        true
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.goBack();
        }
      });
  }

  confirmCreateProject() {
    this.isOnSubmit = true;
    console.log('Confirm Create Project!');
    console.log('Name project: ', this.name);
    console.log('Start time project: ', this.selectedStartSlotTimeId);
    console.log('End time project: ', this.selectedEndSlotTimeId);
    console.log(
      'Customer Id project: ',
      this.selectedCustomer ? this.selectedCustomer.id : ''
    );
    console.log('Employee Id project: ', this.selectedPhotographer);
    console.log('Room Id project: ', this.selectedRoomId);
    console.log('Current Date project: ', this.currentDate);

    const realStart = this.getSlotDate(
      this.currentDate,
      this.selectedStartSlotTimeId
    );
    console.log('Real start time: ', realStart);
    const realEnd = this.getSlotDate(
      this.currentDate,
      this.selectedEndSlotTimeId
    );
    console.log('Real start time: ', realEnd);
    const requestCreateProject: RequestCreateProject = {
      name: this.name,
      startTime: this.formatDate(realStart),
      endTime: this.formatDate(realEnd),
      customerId: this.selectedCustomer ? this.selectedCustomer.id : '',
      employeeId: this.selectedPhotographer,
      roomId: this.selectedRoomId,
    };
    console.log('requestCreateProject before Call API: ', requestCreateProject);
    if (this.createProjectForm.valid) {
      this.isLoading = true;
      this.projectService.createNewProject(requestCreateProject).subscribe(
        (response) => {
          this.isLoading = false;
          console.log('Create Project CALL API: ', response);
          this.notificationService
            .showSwal(
              'Tạo lịch chụp thành công',
              'Bạn sẽ được chuyển hướng về trang xem lịch!',
              'success',
              'OK',
              false
            )
            .then(() => this.location.back());
        }
        // (error) => {
        //   this.isLoading = false;
        //   console.log('Create Project CALL API: ', response);
        //   this.notificationService.showSwal(
        //     'Tạo lịch chụp không thành công',
        //     'Bạn hãy kiểm tra lại các thông tin!',
        //     'error',
        //     'OK',
        //     false
        //   );
        // }
      );
    } else {
      // Print out which fields are invalid
      console.log('Form is not valid. The following fields are invalid:');
      Object.keys(this.createProjectForm.controls).forEach((key) => {
        const control = this.createProjectForm.controls[key];
        if (control.invalid) {
          console.log(`Field: ${key}, Errors:`, control.errors);
        }
      });
    }
  }

  getSlotDate(selectedDate: Date, slotId: number): Date {
    // Tính toán giờ và phút từ slotId (mỗi slot 30 phút)
    const hour = Math.floor((slotId - 1) / 2); // Mỗi 2 slot là 1 giờ
    const minute = (slotId - 1) % 2 === 0 ? 0 : 30; // Slot chẵn là phút 0, slot lẻ là phút 30

    // Tạo đối tượng Date từ selectedDate và thêm giờ, phút
    const slotDate = new Date(selectedDate);
    slotDate.setHours(hour, minute, 0, 0); // Thiết lập giờ và phút, giây và mili giây là 0

    // Define time start and time end in current day
    const startOfDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      0,
      0,
      0,
      0
    );

    console.log('Template date: ', startOfDay);
    return slotDate; // Trả về đối tượng Date đã hoàn chỉnh
  }

  // Hàm format ngày
  formatDate(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date
      .getHours()
      .toString()
      .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date
      .getSeconds()
      .toString()
      .padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
  }

  // Check time is blocked
  isTimeBlocked(time: string) {
    return this.projectService.isTimeBlocked(time);
  }
  // Check time is blocked
  isTimeBlockedWithCurrentDate(time: string, tempDate: Date) {
    return this.projectService.isTimeBlockedWithCurrentDate(
      time,
      new Date(tempDate)
    );
  }

  // Tracking on slot time changing value
  OnStartTimeChange(event: any) {
    this.filteredEndSlotTimes = this.slotTimes;
    console.log('Value start time: ', event.value);
    const startTimeId = event.value;
    this.filteredEndSlotTimes = this.filteredEndSlotTimes.filter(
      (time) => time.id > startTimeId
    );
    if (this.selectedEndSlotTimeId <= this.selectedStartSlotTimeId) {
      this.createProjectForm
        .get('selectedEndSlotTimeId')
        ?.setValue(this.filteredEndSlotTimes[0].id);
    }
    this.fetchListPhotographersValid();
    this.fetchListRoomsValid();
  }

  OnEndTimeChange(event: any) {
    this.fetchListPhotographersValid();
    this.fetchListRoomsValid();
  }

  onCurrentDateChange(event: any) {
    const selectedDate = event.value; // Get the selected date
    console.log('Selected Date:', selectedDate);
    this.reloadSlotTime();

    if (this.selectedStartSlotTimeId < this.slotTimes[0].id) {
      this.createProjectForm
        .get('selectedStartSlotTimeId')
        ?.setValue(this.slotTimes[0].id);
      if (this.selectedStartSlotTimeId < 48) {
        this.createProjectForm
          .get('selectedEndSlotTimeId')
          ?.setValue(this.selectedStartSlotTimeId + 1);
      } else {
        this.createProjectForm.get('selectedEndSlotTimeId')?.setValue(null);
      }
    }
    this.fetchListPhotographersValid();
    this.fetchListRoomsValid();
  }

  reloadSlotTime() {
    this.slotTimes = this.temporarySlotTimes;
    this.slotTimes = this.slotTimes.filter(
      (time) =>
        !this.isTimeBlockedWithCurrentDate(
          time.time,
          new Date(this.currentDate)
        )
    );
    this.filteredEndSlotTimes = this.slotTimes;
    this.filteredEndSlotTimes = this.filteredEndSlotTimes.filter(
      (time) => time.id > this.selectedStartSlotTimeId
    );
  }

  fetchListPhotographersValid() {
    const requestGetListPhotographersValid: RequestGetListPhotographersValid = {
      startTime: this.projectService.formatDate(
        this.projectService.convertTime(
          new Date(this.currentDate),
          this.selectedStartSlotTimeId
        )
      ),
      endTime: this.projectService.formatDate(
        this.projectService.convertTime(
          new Date(this.currentDate),
          this.selectedEndSlotTimeId
        )
      ),
    };
    console.log(
      'Request get list photographers VALID: ',
      requestGetListPhotographersValid
    );
    this.isLoading = true;
    this.projectService
      .getListPhotographersValid(requestGetListPhotographersValid)
      .subscribe((response) => {
        this.isLoading = false;
        this.photographers = response.result.map((photographer: any) => ({
          id: photographer.id,
          username:
            photographer.lastName +
            ' ' +
            photographer.middleName +
            ' ' +
            photographer.firstName,
          firstName: photographer.firstName,
          lastName: photographer.lastName,
          middleName: photographer.middleName,
          isActive: photographer.isActive,
          email: photographer.email,
        }));

        // Kiểm tra xem photographer đã được chọn có nằm trong danh sách photographer mới không
        const selectedPhotographerExists = this.photographers.some(
          (photographer) => photographer.id === this.selectedPhotographer
        );

        if (!selectedPhotographerExists) {
          // Nếu photographer đã chọn không có trong danh sách mới, reset lại
          this.createProjectForm.get('selectedPhotographer')?.setValue(null);
          console.log(
            'Selected photographer is not in the valid list, reset to null'
          );
        }
        // check if the selected Photographer is also in new photo list, if not -> reset to null
        console.log('Get Photographers VALID: ', response);
      });
  }
  fetchListRoomsValid() {
    const requestGetListRoomsValid: RequestGetListRoomsValid = {
      startTime: this.projectService.formatDate(
        this.projectService.convertTime(
          new Date(this.currentDate),
          this.selectedStartSlotTimeId
        )
      ),
      endTime: this.projectService.formatDate(
        this.projectService.convertTime(
          new Date(this.currentDate),
          this.selectedEndSlotTimeId
        )
      ),
    };
    console.log('Request get list rooms VALID: ', requestGetListRoomsValid);
    this.isLoading = true;
    this.projectService
      .getListRoomsValid(requestGetListRoomsValid)
      .subscribe((response) => {
        this.isLoading = false;
        this.rooms = response.result.map((room: any) => ({
          id: room.id,
          name: room.name,
          isActive: room.isActive,
        }));

        // Kiểm tra xem photographer đã được chọn có nằm trong danh sách photographer mới không
        const selectedRoomExists = this.rooms.some(
          (room) => room.id === this.selectedRoomId
        );

        if (!selectedRoomExists) {
          // Nếu photographer đã chọn không có trong danh sách mới, reset lại
          this.createProjectForm.get('selectedRoomId')?.setValue(null);
          console.log('Selected room is not in the valid list, reset to null');
        }
        // check if the selected Photographer is also in new photo list, if not -> reset to null
        console.log('Get Rooms VALID: ', response);
      });
  }
}
