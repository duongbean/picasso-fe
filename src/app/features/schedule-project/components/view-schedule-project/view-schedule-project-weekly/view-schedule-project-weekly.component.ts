import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  ResponseGetListProjects,
  SlotTime,
} from '../../../models/project.model';
import { ScheduleProjectService } from '../../../services/schedule-project.service';

@Component({
  selector: 'app-view-schedule-project-weekly',
  imports: [CommonModule],
  templateUrl: './view-schedule-project-weekly.component.html',
  styleUrls: [
    '../view-schedule-project.component.css',
    './view-schedule-project-weekly.component.css',
  ],
})
export class ViewScheduleProjectWeeklyComponent {
  @Input() projects: ResponseGetListProjects[] = [];
  // @Input() projectsWeekly: any[] = [];
  @Input() timeSlots: SlotTime[] = [];
  @Input() stages: any[] = [];
  @Input() weekDays: any[] = [];
  @ViewChildren('slotCellWeekly', { read: ElementRef })
  slotCells!: QueryList<ElementRef>;
  slotHeight: number = 100; // Mỗi ô timeslot rộng 100px
  isSlotHeightCalculated: boolean = false;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private projectService: ScheduleProjectService
  ) {}

  ngAfterViewInit() {
    if (!this.isSlotHeightCalculated) {
      this.updateSlotHeight();
      this.isSlotHeightCalculated = true; // ✅ Chỉ tính 1 lần duy nhất
    }
  }

  // Function check start point of a project (by time slot, date of week)
  isProjectStart(
    project: ResponseGetListProjects,
    time: string,
    date: any
  ): boolean {
    // Convert string to Date object
    let projectStart = new Date(project.projectInfo.startTime);

    // Get exact date following local time, instead of using toISOString()
    let projectDateStr = `${projectStart.getFullYear()}-${(
      projectStart.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${projectStart.getDate().toString().padStart(2, '0')}`;

    // Parse time slot (HH:mm)
    let [hours, minutes] = time.split(':').map(Number);

    // Compute the exact slot time based on project date
    let slotTime = new Date(
      projectStart.getFullYear(),
      projectStart.getMonth(),
      projectStart.getDate(),
      hours,
      minutes,
      0
    ).getTime();

    let isStart =
      projectStart.getTime() === slotTime && projectDateStr === date;

    return isStart;
  }

  // Calculate height for the Project card
  calculateHeight(project: ResponseGetListProjects): number {
    let startMinutes = this.convertToMinutes(project.projectInfo.startTime);
    let endMinutes = this.convertToMinutes(project.projectInfo.endTime);
    let durationSlots = (endMinutes - startMinutes) / 30;
    return durationSlots * this.slotHeight;
  }

  // Convert range time into minutes => calculate ? time slot for the project
  convertToMinutes(time: string): number {
    let date = new Date(time);
    return date.getHours() * 60 + date.getMinutes();
  }

  // Re calculate the SlotHeight of slot cell everytime change the mode view
  recalculateSlotHeight() {
    if (!this.isSlotHeightCalculated) {
      this.updateSlotHeight();
      this.isSlotHeightCalculated = true;
    }
  }

  private updateSlotHeight() {
    requestAnimationFrame(() => {
      if (this.slotCells.first) {
        this.slotHeight = this.slotCells.first.nativeElement.clientHeight;
        console.log('🔹 Slot height saved: ', this.slotHeight);
      }
    });
  }

  getProjectStatus(project: ResponseGetListProjects): string {
    return this.projectService.getProjectStatus(project);
  }
}
