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
  ResponseGetListProjects,
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
import { LoadingSpinnerComponent } from '../../../../shared/layouts/loading-spinner/loading-spinner.component';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { CustomValidators } from '../../../../shared/directives/validators/Validators';
import Swal from 'sweetalert2';
import { NotificationService } from '../../../../shared/directives/notifications/notification.service';
import { CreateCustomerComponent } from '../create-project/sub-components/create-customer/create-customer.component';

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
  templateUrl: './update-project.component.html',
  styleUrl: '../create-project/create-project.component.css',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateProjectComponent {
  updateProjectForm: FormGroup;
  project!: ResponseGetListProjects;
  temporarySlotTimes: SlotTime[] = [];
  mainSlotTimes: SlotTime[] = [];
  endSlotTimes: SlotTime[] = [];
  minDate: Date = new Date();

  requestGetListPhotographersValid!: RequestGetListPhotographersValid;
  photographers: GetListPhotographersResponse[] = [];

  requestGetListRoomsValid!: RequestGetListRoomsValid;
  rooms: GetListRoomResponse[] = [];

  isBeingAssignedPhotographer!: GetListPhotographersResponse;
  isBeingAssignedRoom!: GetListRoomResponse;

  isLoading = false;

  customerId!: string;

  ngOnInit() {
    // Retrieve the data from previous page
    const { project } = window.history.state;
    console.log('Navigation: ', project);
    this.project = project;

    // Fetch value of Form with data from Navigation
    this.updateProjectForm.patchValue({
      selectedCustomerNameAndEmail:
        this.project.customer.lastName +
        ' ' +
        this.project.customer.middleName +
        ' ' +
        this.project.customer.firstName +
        ' (' +
        this.project.customerEmail +
        ')',
      name: this.project?.projectInfo.name,
      currentDate: new Date(
        this.project?.projectInfo.startTime
          ? this.project?.projectInfo.startTime
          : new Date()
      ),
      selectedStartSlotTimeId: this.projectService.convertTimeToSlotTimeId(
        this.project?.projectInfo.startTime
      ),
      selectedEndSlotTimeId: this.projectService.convertTimeToSlotTimeId(
        this.project?.projectInfo.endTime
      ),
      selectedPhotographerId: this.project?.projectInfo.employeeID,
      selectedRoomId: this.project?.projectInfo.roomID,
    });

    // Fetch customer Id
    this.customerId = this.project.projectInfo.customerID;

    // Initialize value for Temporary Slot Time List
    this.temporarySlotTimes = this.projectService.generateSlotTimes();

    // Mapping Main Slot Time List by checking Is Block (currentDate, slotTime)
    this.mainSlotTimes = this.temporarySlotTimes.filter(
      (slotTime: SlotTime) =>
        !this.projectService.isTimeBlockedWithCurrentDate(
          slotTime.time,
          new Date(this.currentDate?.value)
        )
    );

    // Mapping End Slot Time List by filtering the Main Slot Time List
    this.endSlotTimes = this.mainSlotTimes.filter(
      (slotTime: SlotTime) => slotTime.id > this.selectedStartSlotTimeId?.value
    );

    // Fetch is being assigned Photographer
    this.isBeingAssignedPhotographer = {
      id: this.project?.projectInfo.employeeID,
      username: '',
      email: this.project?.photographerEmail,
      firstName: this.project?.photographer.firstName,
      lastName: this.project.photographer.lastName,
      middleName: this.project.photographer.middleName,
      isActive: true,
    };

    // Fetch is being assigned Room
    this.isBeingAssignedRoom = {
      id: this.project.projectInfo.roomID,
      name: this.project.projectInfo.roomName,
      isActive: true,
    };

    // Fetch Valid Photographers List
    this.fetchValidPhotographers();

    // Fetch Valid Rooms List
    this.fetchValidRooms();
  }

  constructor(
    private router: Router,
    private location: Location,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private projectService: ScheduleProjectService,
    private employeeService: EmployeeService
  ) {
    this.updateProjectForm = this.formBuilder.group({
      selectedCustomerNameAndEmail: ['', Validators.required],
      name: ['', Validators.required],
      currentDate: new Date(),
      selectedStartSlotTimeId: 0,
      selectedEndSlotTimeId: 0,
      selectedPhotographerId: ['', Validators.required],
      selectedRoomId: ['', Validators.required],
    });
  }

  get selectedCustomerNameAndEmail() {
    return this.updateProjectForm.get('selectedCustomerNameAndEmail');
  }
  get name() {
    return this.updateProjectForm.get('name');
  }
  get currentDate() {
    return this.updateProjectForm.get('currentDate');
  }
  get selectedStartSlotTimeId() {
    return this.updateProjectForm.get('selectedStartSlotTimeId');
  }
  get selectedEndSlotTimeId() {
    return this.updateProjectForm.get('selectedEndSlotTimeId');
  }
  get selectedPhotographerId() {
    return this.updateProjectForm.get('selectedPhotographerId');
  }
  get selectedRoomId() {
    return this.updateProjectForm.get('selectedRoomId');
  }

  goBack() {
    this.location.back();
  }

  cancelUpdateProject() {
    console.log('Confirm Cancel!');

    this.notificationService
      .showSwal(
        'Xác nhận',
        'Bạn có chắc muốn thoát khỏi Chỉnh sửa buổi chụp?',
        'warning',
        'Thoát',
        true
      )
      .then((result) => {
        if (result.isConfirmed) this.location.back();
      });
  }

  // Fetch Valid Photographers List
  fetchValidPhotographers() {
    this.requestGetListPhotographersValid = {
      startTime: this.projectService.formatDate(
        this.projectService.convertTime(
          this.currentDate?.value,
          this.selectedStartSlotTimeId?.value
        )
      ),
      endTime: this.projectService.formatDate(
        this.projectService.convertTime(
          this.currentDate?.value,
          this.selectedEndSlotTimeId?.value
        )
      ),
    };

    this.projectService
      .getListPhotographersValid(this.requestGetListPhotographersValid)
      .subscribe((response) => {
        this.photographers = response.result.map((photographer: any) => ({
          id: photographer.id,
          email: photographer.email,
          firstName: photographer.firstName,
          lastName: photographer.lastName,
          middleName: photographer.middleName,
          isActive: photographer.isActive,
        }));

        this.photographers.push(this.isBeingAssignedPhotographer);
      });
  }

  // Fetch Valid Rooms List
  fetchValidRooms() {
    this.requestGetListRoomsValid = {
      startTime: this.projectService.formatDate(
        this.projectService.convertTime(
          this.currentDate?.value,
          this.selectedStartSlotTimeId?.value
        )
      ),
      endTime: this.projectService.formatDate(
        this.projectService.convertTime(
          this.currentDate?.value,
          this.selectedEndSlotTimeId?.value
        )
      ),
    };

    this.projectService
      .getListRoomsValid(this.requestGetListRoomsValid)
      .subscribe((response) => {
        this.rooms = response.result.map((room: any) => ({
          id: room.id,
          name: room.name,
          isActive: room.isActive,
        }));
        this.rooms.push(this.isBeingAssignedRoom);
      });
  }

  // Function to Submit Update Project
  submitUpdateProject() {
    this.isLoading = true;
    const requestUpdateProject: RequestCreateProject = {
      name: this.name?.value,
      startTime: this.projectService.formatDate(
        this.projectService.convertTime(
          this.currentDate?.value,
          this.selectedStartSlotTimeId?.value
        )
      ),
      endTime: this.projectService.formatDate(
        this.projectService.convertTime(
          this.currentDate?.value,
          this.selectedEndSlotTimeId?.value
        )
      ),
      customerId: this.customerId,
      employeeId: this.selectedPhotographerId?.value,
      roomId: this.selectedRoomId?.value,
    };

    console.log(
      'Before Call API - request Update project: ',
      requestUpdateProject
    );

    this.projectService
      .updateProject(requestUpdateProject, this.project.projectInfo.id)
      .subscribe(
        (response: any) => {
          this.isLoading = false;
          this.notificationService
            .showSwal(
              'Chỉnh sửa lịch chụp thành công',
              'Bạn sẽ được chuyển hướng về trang xem lịch!',
              'success',
              'OK',
              false
            )
            .then(() => this.location.back());
        },
        (error) => {
          this.isLoading = false;
          this.notificationService.showSwal(
            'Chỉnh sửa lịch chụp không thành công',
            'Bạn hãy chỉnh sửa lại lịch chụp hoặc quay về trang xem lịch!',
            'error',
            'OK',
            false
          );
        }
      );
  }
}
