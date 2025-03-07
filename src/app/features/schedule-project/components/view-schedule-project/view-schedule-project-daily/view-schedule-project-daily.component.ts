import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  Inject,
  Input,
  Output,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import {
  GetListRoomResponse,
  ResponseGetListProjects,
  SlotTime,
} from '../../../models/project.model';
import { EventEmitter } from 'stream';
import { ViewScheduleProjectComponent } from '../view-schedule-project.component';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { ScheduleProjectService } from '../../../services/schedule-project.service';
import { MatDialog } from '@angular/material/dialog';
import { ProjectDetailDialogComponent } from '../project-detail-dialog/project-detail-dialog.component';

@Component({
  selector: 'app-view-schedule-project-daily',
  imports: [MatIconModule, CommonModule],
  templateUrl: './view-schedule-project-daily.component.html',
  styleUrls: [
    '../view-schedule-project.component.css',
    './view-schedule-project-daily.component.css',
  ],
})
export class ViewScheduleProjectDailyComponent {
  // @Input() projects: any[] = [];
  @Input() projects: ResponseGetListProjects[] = [];
  @Input() timeSlots: SlotTime[] = [];
  @Input() stages: any[] = [];
  @Input() rooms: any[] = [];
  @Input() currentDate: any = '';

  @ViewChildren('slotCell', { read: ElementRef })
  slotCells!: QueryList<ElementRef>;
  slotWidth: number = 61; // Mỗi ô timeslot rộng 100px
  isSlotWidthCalculated: boolean = false;

  private readonly _adapter =
    inject<DateAdapter<unknown, unknown>>(DateAdapter);
  private readonly _intl = inject(MatDatepickerIntl);
  private readonly _locale = signal(inject<unknown>(MAT_DATE_LOCALE));
  readonly dateFormatString = computed(() => {
    // Default format to dd/mm/yyyy
    return 'DD/MM/YYYY';
  });

  constructor(
    private datePipe: DatePipe,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    @Inject(ViewScheduleProjectComponent)
    private parent: ViewScheduleProjectComponent,
    private projectService: ScheduleProjectService,
    private dialog: MatDialog
  ) {}
  ngAfterViewInit() {
    if (!this.isSlotWidthCalculated) {
      this.updateSlotWidth();
      this.isSlotWidthCalculated = true;
    }
  }

  get formattedCurrentDate() {
    return (
      this.datePipe.transform(
        this.currentDate,
        'EEEE, dd/MM/yyyy',
        undefined,
        'vi'
      ) || ''
    );
  }

  // Check whether the project start
  isProjectStart(project: ResponseGetListProjects, time: SlotTime): boolean {
    if (!this.currentDate) return false;

    // Convert project start time to Date object
    let projectStart = new Date(project.projectInfo.startTime);

    // Format project date as YYYY-MM-DD
    let projectDateStr = `${projectStart.getFullYear()}-${(
      projectStart.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${projectStart.getDate().toString().padStart(2, '0')}`;

    // Convert currentDate to YYYY-MM-DD format for comparison
    let selectedDate = new Date(this.currentDate);
    let selectedDateStr = `${selectedDate.getFullYear()}-${(
      selectedDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;

    // Parse time slot (HH:mm)
    let [hours, minutes] = time.time.split(':').map(Number);

    // Compute the exact slot time based on selected date
    let slotTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hours,
      minutes,
      0
    ).getTime();

    // Compare both the exact time and the date string
    let isStart =
      projectStart.getTime() === slotTime && projectDateStr === selectedDateStr;

    return isStart;
  }

  getEventStatusClass(event: any) {
    switch (event.status) {
      case 'confirmed':
        return 'confirmed';
      case 'pending':
        return 'pending';
      case 'completed':
        return 'completed';
      default:
        return '';
    }
  }

  calculateWidth(project: ResponseGetListProjects): number {
    let startMinutes = this.convertToMinutes(project.projectInfo.startTime);
    let endMinutes = this.convertToMinutes(project.projectInfo.endTime);
    let durationSlots = (endMinutes - startMinutes) / 30;
    return durationSlots * this.slotWidth;
  }

  convertToMinutes(time: string): number {
    let date = new Date(time);
    return date.getHours() * 60 + date.getMinutes();
  }

  recalculateSlotWidth() {
    if (!this.isSlotWidthCalculated) {
      this.updateSlotWidth();
      this.isSlotWidthCalculated = true;
    }
  }

  private updateSlotWidth() {
    requestAnimationFrame(() => {
      if (this.slotCells.first) {
        this.slotWidth = this.slotCells.first.nativeElement.clientWidth;
        console.log('Slot width saved: ', this.slotWidth);
      }
    });
  }

  hasStartCell(
    projects: ResponseGetListProjects[],
    time: any,
    roomId: any
  ): boolean {
    if (projects) {
      return projects.some(
        (project) =>
          this.isProjectStart(project, time) &&
          project.projectInfo.roomID === roomId
      );
    } else {
      return false;
    }
  }

  // Click to navigate to Create Project Screen
  createProject(time: SlotTime, room: GetListRoomResponse) {
    console.log('START Create Project');
    const slot: SlotTime = {
      id: time.id,
      time: time.time,
    };

    let currentDateString: string;
    if (this.currentDate instanceof Date) {
      currentDateString = this.currentDate.toISOString();
    } else {
      currentDateString = this.currentDate;
    }

    console.log('Time slot NAVIGATE: ', time);
    console.log('Room NAVIGATE: ', room);
    console.log('Current Date NAVIGATE: ', this.currentDate);

    // Navigate params to Create project Screen
    this.router.navigate(['create-project'], {
      queryParams: {
        slotTimeId: time.id,
        roomId: room.id,
        currentDate: currentDateString,
      },
    });
  }

  // Function to check whether the td to create project or project card element
  onTdClick(event: MouseEvent, time: any, room: any): void {
    // Check if the element has class 'project-card'
    if ((event.target as HTMLElement).closest('.project-card')) {
      // If true, not do anything => Prevent the click event
      event.stopPropagation();
    } else {
      // If not, go to create project event
      this.createProject(time, room);
    }
  }

  isTimeBlocked(time: string) {
    return this.projectService.isTimeBlocked(time);
  }

  isTimeBlockedWithCurrentDate(time: string, tempDate: Date) {
    return this.projectService.isTimeBlockedWithCurrentDate(
      time,
      new Date(tempDate)
    );
  }

  // Change current date by 1 day
  changeCurrentDate(direction: number) {
    console.log(direction, ' DAY');
    const currentDate = new Date(this.currentDate ? this.currentDate : '');
    currentDate.setDate(currentDate.getDate() + direction);

    this.currentDate = currentDate.toISOString();
    console.log('Call from child');

    this.parent.searchForm.get('currentDate')?.setValue(this.currentDate);

    this.parent.loadBySelectedDate();
  }

  clickChangeDate() {
    console.log('+ 1 DAY');
  }

  getProjectStatus(project: ResponseGetListProjects): string {
    return this.projectService.getProjectStatus(project);
  }

  viewProjectDetail(event: MouseEvent) {
    event.stopPropagation();
    console.log('On Click View Project Detail');
  }

  openEventDialog(event: MouseEvent, project: ResponseGetListProjects): void {
    console.log('On Mouse');
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Get the screen size
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Assume the width and height of dialog
    const dialogWidth = 500;
    const dialogHeight = 300;

    // New position of dialog
    let topPosition = mouseY;
    let leftPosition = mouseX;

    // Check if the dialog overflow the screen => Then change the direction
    if (leftPosition + dialogWidth > screenWidth) {
      leftPosition = screenWidth - dialogWidth - 20;
    }

    // Check if the dialog overflow the screen => Then change the direction
    if (topPosition + dialogHeight > screenHeight) {
      topPosition = screenHeight - dialogHeight - 10;
    }

    // Open dialog with the position - calculated
    const dialogRef = this.dialog.open(ProjectDetailDialogComponent, {
      data: project,
      minWidth: '400px',
      position: {
        top: `${topPosition}px`,
        left: `${leftPosition}px`,
      },
    });
  }
}
