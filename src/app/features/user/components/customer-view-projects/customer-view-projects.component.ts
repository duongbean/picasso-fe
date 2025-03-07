import { Component, NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ScheduleProjectService } from '../../../schedule-project/services/schedule-project.service';
import { JwtService } from '../../../auth/services/jwt.service';
import {
  GetListProjectsResponse,
  ResponseGetListProjects,
} from '../../../schedule-project/models/project.model';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-customer-view-projects',
  imports: [MatIconModule, CommonModule],
  providers: [DatePipe],
  templateUrl: './customer-view-projects.component.html',
  styleUrl: './customer-view-projects.component.css',
})
export class CustomerViewProjectsComponent {
  projects: ResponseGetListProjects[] = [];
  constructor(
    private projectService: ScheduleProjectService,
    private jwtService: JwtService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    const userId = this.jwtService.getUserId();
    console.log('Customer ID from Token: ', userId);
    this.fetchGetListProjectsByCustomerId(userId ? userId : '');
  }

  // Call API - get list projects by CustomerId
  fetchGetListProjectsByCustomerId(customerId: string) {
    this.projectService
      .getListProjectByCustomerId(customerId)
      .subscribe((response) => {
        console.log('Call API get Project for Customer: ', response);
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

        console.log('List Project for Customer: ', this.projects);
      });
  }

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
  getProjectStatus(project: any) {
    return this.projectService.getProjectStatus(project);
  }
}
