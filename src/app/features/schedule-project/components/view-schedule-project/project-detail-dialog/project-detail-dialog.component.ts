import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { ResponseGetListProjects } from '../../../models/project.model';
import { Router } from '@angular/router';
import { ScheduleProjectService } from '../../../services/schedule-project.service';
import { response } from 'express';
import { NotificationService } from '../../../../../shared/directives/notifications/notification.service';
import { error } from 'console';

@Component({
  selector: 'app-project-detail-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIcon],
  providers: [DatePipe],

  templateUrl: './project-detail-dialog.component.html',
  styleUrl: './project-detail-dialog.component.css',
})
export class ProjectDetailDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public project: ResponseGetListProjects,
    private datePipe: DatePipe,
    private router: Router,
    private dialogRef: MatDialogRef<ProjectDetailDialogComponent>,
    private projectService: ScheduleProjectService,
    private notificationService: NotificationService
  ) {}

  // Format date following VI format
  formatDateByViForm(date: string) {
    // return this.formatDateService.formatDateByViForm(new Date(date));
    return (
      this.datePipe.transform(
        new Date(date),
        'EEEE, dd/MM/yyyy',
        undefined,
        'vi'
      ) || ''
    );
  }

  // Function - Event Click to Edit Project
  onEditProject(project: ResponseGetListProjects) {
    console.log('Project to Edit: ', project);
    this.dialogRef.close();
    this.router.navigate(['/update-project'], {
      state: { project: project },
    });
  }

  // Function - Event Click to Delete Project
  onDeleteProject(project: ResponseGetListProjects) {
    console.log('Project to Delete: ', project);
    this.dialogRef.close();

    this.notificationService
      .showSwal(
        'Cảnh báo',
        'Bạn có chắc chắn muốn xóa Buổi chụp này?',
        'warning',
        'OK',
        true
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.projectService
            .deleteProjectById(project.projectInfo.id)
            .subscribe(
              (response) => {
                console.log(response);
                this.notificationService.showSwalWithTimeOut(
                  'Xóa buổi chụp thành công',
                  'Thông báo sẽ tự động tắt sau 5s',
                  'success',
                  'OK',
                  false,
                  5000,
                  true
                );
              },
              (error) => {
                this.notificationService.showSwalWithTimeOut(
                  'Xóa buổi chụp không thành công',
                  'Thông báo sẽ tự động tắt sau 5s',
                  'error',
                  'OK',
                  false,
                  5000,
                  true
                );
              }
            );
        }
      });
  }
}
