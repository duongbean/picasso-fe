import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ScheduleProjectService } from '../../services/schedule-project.service';
import {
  GetListProjectsRequest,
  GetListRoomResponse,
  ResponseGetListProjects,
  SlotTime,
} from '../../models/project.model';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import localeVi from '@angular/common/locales/vi';
import { ViewScheduleProjectDailyComponent } from './view-schedule-project-daily/view-schedule-project-daily.component';
import { ViewScheduleProjectWeeklyComponent } from './view-schedule-project-weekly/view-schedule-project-weekly.component';
import { GetListPhotographersResponse } from '../../models/user.model';
import { EmployeeService } from '../../services/employee.service';
import { isatty } from 'node:tty';
import { LoadingSpinnerComponent } from '../../../../shared/layouts/loading-spinner/loading-spinner.component';
import { first } from 'rxjs';

registerLocaleData(localeVi);

@Component({
  selector: 'app-view-schedule-project',
  providers: [DatePipe],
  imports: [
    MatIconModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    ViewScheduleProjectDailyComponent,
    ViewScheduleProjectWeeklyComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-schedule-project.component.html',
  styleUrl: './view-schedule-project.component.css',
})
export class ViewScheduleProjectComponent {
  @ViewChild('scheduleTable') scheculeTable!: ElementRef;
  @ViewChild(ViewScheduleProjectWeeklyComponent)
  weeklyViewComponent!: ViewScheduleProjectWeeklyComponent;
  @ViewChild(ViewScheduleProjectDailyComponent)
  dailyViewComponent!: ViewScheduleProjectDailyComponent;
  @ViewChild('dailyModeButton') dailyModeButton!: ElementRef;
  @ViewChild('weeklyModeButton') weeklyModeButton!: ElementRef;
  searchForm: FormGroup;
  selectedPhotographer: number | null = null;
  selectedStage: string | null = null;
  currentDate: string | null = null;
  weekDays: any[] = [];
  isLoading: boolean = true;
  isPhotographersLoad: boolean = false;
  isRoomsLoad: boolean = false;
  isDailyProjectsLoad: boolean = false;
  isWeeklyProjectsLoad: boolean = false;

  viewMode: 'day' | 'week' = 'day';

  // projects!: any[];
  projects!: ResponseGetListProjects[];
  projectsWeekly!: ResponseGetListProjects[];

  photographerSelects: GetListPhotographersResponse[] = [];
  roomSelects: GetListRoomResponse[] = [];
  rooms: GetListRoomResponse[] = [];
  slotTimes: SlotTime[] = [];
  indexTimeSlot: number = 0;

  photographers = [
    { id: 0, name: 'Tất cả' },
    { id: 1, name: 'Nguyễn Văn A' },
    { id: 2, name: 'Trần Thị B' },
    { id: 3, name: 'Phạm Quốc C' },
  ];

  stageSelects: { name: string }[] = [];

  stages = [
    {
      name: 'Khoang 1',
    },
    {
      name: 'Khoang 2',
    },
  ];

  events = [
    {
      title: 'Chụp ảnh cưới',
      photographer: 'DuongDM',
      customer: 'Binh Tu',
      stage: 'Khoang 1',
      time: '08:00',
      status: 'confirmed',
    },
    {
      title: 'Chụp da ngoại',
      photographer: 'DuongDM',
      customer: 'Binh Tu',
      stage: 'Khoang 1',
      time: '09:30',
      status: 'confirmed',
    },
    {
      title: 'Chụp ảnh Tết',
      photographer: 'VietCQ4',
      customer: 'Binh Tu',
      stage: 'Khoang 2',
      time: '10:00',
      status: 'confirmed',
    },
  ];

  ngOnInit() {
    // Gen slot time
    this.generateSlotTimes();
    console.log('Slot times: ', this.slotTimes);

    // Lấy ngày hiện tại theo giờ local
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const year = today.getFullYear();
    const month = today.getMonth(); // Tháng bắt đầu từ 0
    const day = today.getDate();

    // Tạo thời gian bắt đầu từ 00:00:00.000 (giờ local)
    const startOfDay = new Date(year, month, day, 0, 0, 0, 0);

    // Tạo thời gian kết thúc 23:59:59.999 (giờ local)
    const endOfDay = new Date(year, month, day, 23, 59, 59, 999);

    // Xác định ngày bắt đầu (Thứ Hai) của tuần hiện tại
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Nếu hôm nay là Chủ Nhật (0), lùi về thứ Hai tuần trước (-6)
    const monday = new Date(year, month, day + mondayOffset, 0, 0, 0, 0);

    // Xác định ngày kết thúc (Chủ Nhật) của tuần hiện tại
    const sunday = new Date(
      year,
      month,
      day + mondayOffset + 6,
      23,
      59,
      59,
      999
    );

    // Hàm định dạng ngày theo kiểu "YYYY-MM-DD HH:mm:ss.SSS"
    const formatDate = (date: Date) => {
      return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date
        .getHours()
        .toString()
        .padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${date
        .getSeconds()
        .toString()
        .padStart(2, '0')}.${date
        .getMilliseconds()
        .toString()
        .padStart(3, '0')}`;
    };

    // Request data với thời gian chính xác
    const getListProjectsRequest: GetListProjectsRequest = {
      startTime: formatDate(startOfDay),
      endTime: formatDate(endOfDay),
    };
    // Request data với thời gian chính xác 1 tuan
    const getListProjectsWeeklyRequest: GetListProjectsRequest = {
      startTime: formatDate(monday),
      endTime: formatDate(sunday),
    };

    console.log('INPUT DATE to GET PROJECTS: ', getListProjectsRequest);
    console.log(
      'INPUT DATE to GET PROJECTS (Week): ',
      getListProjectsWeeklyRequest
    );

    // Call API: GET list projects by range time (start time, end time)
    // this.projectService
    //   .getListProjects(getListProjectsRequest)
    //   .subscribe((response) => {
    //     console.log('Get List Projects API data: ', response);
    //     // this.projects = response.result;
    //     this.projects = response.result.map((project: any) => ({
    //       projectInfo: project.projectInfo,
    //       albumCount: project.albumCount,
    //       firstThumbnail: project.firstThumbnail,
    //       photographer: project.photographer,
    //       photographerEmail: project.photographerEmail,
    //       photographerAvatar: project.photographerAvatar,
    //       saler: project.saler,
    //       salerEmail: project.salerEmail,
    //       customer: project.customer,
    //       customerEmail: project.customerEmail,
    //     }));
    //     console.log('API MAPPING - list projects: ', this.projects);

    //     this.isDailyProjectsLoad = true;
    //     this.isLoadingSpinner();
    //   });

    this.fetchListProjectsDaily(getListProjectsRequest);

    // Call API: GET list projects by range time (start time, end time)
    // this.projectService
    //   .getListProjects(getListProjectsWeeklyRequest)
    //   .subscribe((response) => {
    //     console.log('Get List Projects Weekly API data 1: ', response);
    //     // this.projectsWeekly = response.result;
    //     this.projectsWeekly = response.result.map((project: any) => ({
    //       projectInfo: project.projectInfo,
    //       albumCount: project.albumCount,
    //       firstThumbnail: project.firstThumbnail,
    //       photographer: project.photographer,
    //       photographerEmail: project.photographerEmail,
    //       photographerAvatar: project.photographerAvatar,
    //       saler: project.saler,
    //       salerEmail: project.salerEmail,
    //       customer: project.customer,
    //       customerEmail: project.customerEmail,
    //     }));
    //     console.log(
    //       'MAPPING List Projects Weekly API data: ',
    //       this.projectsWeekly
    //     );

    //     this.isWeeklyProjectsLoad = true;
    //     this.isLoadingSpinner();
    //   });

    this.fetchListProjectsWeekly(getListProjectsWeeklyRequest);

    this.stageSelects = [{ name: 'Tất cả' }, ...this.stages];

    this.updateWeekDays();

    // Call API: GET list photographers in DB
    this.employeeService.getListPhotographers().subscribe((response) => {
      console.log('API response - GET LIST PHOTOGRAPHERS: ', response);
      this.photographerSelects = [
        {
          id: '0',
          username: 'Tất cả',
          firstName: '',
          lastName: '',
          middleName: '',
          isActive: true,
        },
        ...response.result.map((photographer: any) => ({
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
        })),
      ];
      this.isPhotographersLoad = true;
      this.isLoadingSpinner();

      console.log(
        'API mapping - LIST PHOTOGRAPHERS select: ',
        this.photographerSelects
      );
    });

    // Call API: GET list rooms in DB
    this.projectService.getListRooms().subscribe((response) => {
      console.log('API response - Get List Rooms: ', response);
      // Mapping to list for select (Tat ca + list)
      this.roomSelects = [
        {
          id: '0',
          name: 'Tất cả',
          isActive: true,
        },
        ...response.result.map((room: any) => ({
          id: room.id,
          name: room.name,
          isActive: room.isActive,
        })),
      ];

      // Mapping directly to real list
      this.rooms = response.result.map((room: any) => ({
        id: room.id,
        name: room.name,
        isActive: room.isActive,
      }));

      this.isRoomsLoad = true;
      this.isLoadingSpinner();
    });
  }

  ngAfterViewInit() {
    if (this.viewMode === 'week' && this.weeklyViewComponent) {
      this.weeklyViewComponent.recalculateSlotHeight();
    }
    if (this.viewMode === 'day' && this.dailyViewComponent) {
      this.dailyViewComponent.recalculateSlotWidth();
    }
  }

  constructor(
    private fb: FormBuilder,
    public projectService: ScheduleProjectService,
    private datePipe: DatePipe,
    private employeeService: EmployeeService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.searchForm = this.fb.group({
      selectedPhotographer: 0,
      selectedStage: 'Tất cả',
      currentDate: new Date(),
    });
    this.currentDate = this.searchForm.value.currentDate;
  }

  // Function to get current week
  updateWeekDays() {
    // let startDate = new Date();
    // let startDate = this.currentDate;
    // Lấy ngày hiện tại từ form chọn ngày
    let selectedDate = this.searchForm.get('currentDate')?.value;

    if (!selectedDate) {
      selectedDate = new Date(); // Mặc định là ngày hôm nay nếu chưa chọn gì
    } else {
      selectedDate = new Date(selectedDate); // Chuyển đổi từ string về Date nếu cần
    }
    let dayOfWeek = selectedDate.getDay(); // Get day index (0 = Sunday, 6 = Saturday)
    let mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday start
    selectedDate.setDate(selectedDate.getDate() + mondayOffset); // Move to Monday

    this.weekDays = Array.from({ length: 7 }, (_, i) => {
      let date = new Date(selectedDate.getTime() + i * 86400000);

      return {
        formatted: date.toLocaleDateString('vi-VN', {
          weekday: 'long',
          day: '2-digit',
        }),
        isoDate: `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`, // YYYY-MM-DD
      };
    });
  }

  hasEvent(stage: string, time: string) {
    return this.events.find(
      (event) => event.stage === stage && event.time === time
    );
  }

  // Change schedule view mode to daily mode
  changeToDailyMode() {
    console.log('Change to day mode');
    this.viewMode = 'day';
    this.weeklyModeButton.nativeElement.classList.remove('btn-active-global');
    this.weeklyModeButton.nativeElement.classList.add('btn-inactive-global');
    this.weeklyModeButton.nativeElement.classList.remove('cursor-auto');
    this.dailyModeButton.nativeElement.classList.add('btn-active-global');
    this.dailyModeButton.nativeElement.classList.add('cursor-auto');
    this.dailyModeButton.nativeElement.classList.remove('btn-inactive-global');
    if (
      this.dailyViewComponent &&
      !this.dailyViewComponent.isSlotWidthCalculated
    ) {
      setTimeout(() => {
        this.dailyViewComponent.recalculateSlotWidth();
      }, 0);
    }
  }

  // Change schedule view mode to weekly mode
  changeToWeeklyMode() {
    console.log('Change to week mode');
    this.viewMode = 'week';
    this.changeDetectorRef.detectChanges();
    this.dailyModeButton.nativeElement.classList.remove('btn-active-global');
    this.dailyModeButton.nativeElement.classList.remove('cursor-auto');
    this.dailyModeButton.nativeElement.classList.add('btn-inactive-global');
    this.weeklyModeButton.nativeElement.classList.add('btn-active-global');
    this.weeklyModeButton.nativeElement.classList.add('cursor-auto');
    this.weeklyModeButton.nativeElement.classList.remove('btn-inactive-global');
    if (
      this.weeklyViewComponent &&
      !this.weeklyViewComponent.isSlotHeightCalculated
    ) {
      setTimeout(() => {
        this.weeklyViewComponent.recalculateSlotHeight();
      }, 0);
    }
  }

  loadBySelectedDate() {
    const selectedDate = this.searchForm.get('currentDate')?.value;
    console.log('Confirmed Date:', selectedDate);
    this.currentDate = this.searchForm.value.currentDate;
    this.updateWeekDays();
    this.loadProjects(selectedDate);
  }

  loadProjectsByDate(selectedDate: string) {
    const startOfDay = `${selectedDate} 00:00:00.000`;
    const endOfDay = `${selectedDate} 23:59:59.999`;

    const request: GetListProjectsRequest = {
      startTime: startOfDay,
      endTime: endOfDay,
    };

    console.log('Fetching projects for date:', request);

    // this.projectService.getListProjects(request).subscribe((response) => {
    //   console.log('Projects for selected date:', response);
    //   this.projects = response.result;
    // });
    this.fetchListProjectsDaily(request);
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

  // Load danh sách dự án dựa theo ngày được chọn
  loadProjects(selectedDate?: Date) {
    if (!selectedDate) {
      selectedDate = this.searchForm.get('currentDate')?.value;
    }

    if (!selectedDate) {
      selectedDate = new Date(); // Mặc định lấy ngày hôm nay nếu không có giá trị nào được chọn
    } else {
      selectedDate = new Date(selectedDate); // Chuyển đổi nếu cần
    }

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
    const endOfDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      23,
      59,
      59,
      999
    );

    // Define time start and time end in current week
    const dayOfWeek = selectedDate.getDay(); // 0 = Chủ Nhật, 6 = Thứ Bảy
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() + mondayOffset,
      0,
      0,
      0,
      0
    );
    const sunday = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() + mondayOffset + 6,
      23,
      59,
      59,
      999
    );

    const getListProjectsRequest: GetListProjectsRequest = {
      startTime: this.formatDate(startOfDay),
      endTime: this.formatDate(endOfDay),
    };

    const getListProjectsWeeklyRequest: GetListProjectsRequest = {
      startTime: this.formatDate(monday),
      endTime: this.formatDate(sunday),
    };

    console.log('Fetching daily projects:', getListProjectsRequest);
    console.log('Fetching weekly projects:', getListProjectsWeeklyRequest);
    this.isLoading = true;

    // this.projectService
    //   .getListProjects(getListProjectsRequest)
    //   .subscribe((response) => {
    //     console.log('Daily projects:', response);
    //     this.projects = response.result;
    //     this.isDailyProjectsLoad = true;
    //     this.isLoadingSpinner();
    //   });
    this.fetchListProjectsDaily(getListProjectsRequest);

    // this.projectService
    //   .getListProjects(getListProjectsWeeklyRequest)
    //   .subscribe((response) => {
    //     console.log('Weekly projects:', response);
    //     this.projectsWeekly = response.result;
    //     this.isWeeklyProjectsLoad = true;
    //     this.isLoadingSpinner();
    //   });

    this.fetchListProjectsWeekly(getListProjectsWeeklyRequest);
  }

  // Check loading
  isLoadingSpinner() {
    if (
      this.isPhotographersLoad &&
      this.isDailyProjectsLoad &&
      this.isWeeklyProjectsLoad &&
      this.isRoomsLoad
    ) {
      this.isLoading = false;
    }
    console.log('CHECKING IS LOADING SPINNER: ', this.isLoading);
  }

  // Gen slot time - 30 minutes each slot
  generateSlotTimes(): void {
    this.slotTimes = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        this.indexTimeSlot++;
        let timeString = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        this.slotTimes.push({ time: timeString, id: this.indexTimeSlot });
      }
    }
  }

  // Change current date by 1 day
  changeCurrentDate(direction: number) {
    const currentDate = new Date(this.currentDate ? this.currentDate : '');
    currentDate.setDate(currentDate.getDate() + direction);

    this.currentDate = currentDate.toISOString();
    this.loadBySelectedDate();
  }

  fetchListProjectsDaily(getListProjectsRequest: GetListProjectsRequest) {
    // Call API: GET list projects by range time (start time, end time)
    this.projectService
      .getListProjects(getListProjectsRequest)
      .subscribe((response) => {
        console.log('Get List Projects API data: ', response);
        // this.projects = response.result;
        this.projects = response.result.map((project: any) => ({
          projectInfo: project.projectInfo,
          albumCount: project.albumCount,
          firstThumbnail: project.firstThumbnail,
          photographer: project.photographer,
          photographerEmail: project.photographerEmail,
          photographerAvatar: project.photographerAvatar,
          saler: project.saler,
          salerEmail: project.salerEmail,
          customer: project.customer,
          customerEmail: project.customerEmail,
        }));
        console.log('API MAPPING - list projects: ', this.projects);

        this.isDailyProjectsLoad = true;
        this.isLoadingSpinner();
      });
  }

  fetchListProjectsWeekly(
    getListProjectsWeeklyRequest: GetListProjectsRequest
  ) {
    this.projectService
      .getListProjects(getListProjectsWeeklyRequest)
      .subscribe((response) => {
        console.log('Get List Projects Weekly API data 1: ', response);
        // this.projectsWeekly = response.result;
        this.projectsWeekly = response.result.map((project: any) => ({
          projectInfo: project.projectInfo,
          albumCount: project.albumCount,
          firstThumbnail: project.firstThumbnail,
          photographer: project.photographer,
          photographerEmail: project.photographerEmail,
          photographerAvatar: project.photographerAvatar,
          saler: project.saler,
          salerEmail: project.salerEmail,
          customer: project.customer,
          customerEmail: project.customerEmail,
        }));
        console.log(
          'MAPPING List Projects Weekly API data: ',
          this.projectsWeekly
        );

        this.isWeeklyProjectsLoad = true;
        this.isLoadingSpinner();
      });
  }
}
