import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { map } from 'rxjs';
import {
  GetListProjectsRequest,
  RequestCreateProject,
  RequestGetListPhotographersValid,
  RequestGetListRoomsValid,
  ResponseGetListProjects,
  SlotTime,
} from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ScheduleProjectService {
  private apiUrl = `${environment.apiBaseUrl}/Project`;

  constructor(private http: HttpClient) {}

  getListProjects(request: GetListProjectsRequest): Observable<any> {
    const url = `${this.apiUrl}/get-project-by-date-range`;
    const params = new HttpParams()
      .set('startTime', request.startTime)
      .set('endTime', request.endTime);
    return this.http.get<any>(url, { params });
  }

  getListRooms(): Observable<any> {
    const url = `${environment.apiBaseUrl}/Room/rooms`;
    return this.http.get<any>(url);
  }

  createNewProject(request: RequestCreateProject): Observable<any> {
    const url = `${this.apiUrl}/create-project`;
    return this.http.post<any>(url, request);
  }

  updateProject(request: RequestCreateProject, id: string): Observable<any> {
    const url = `${this.apiUrl}/update-project-by-id/${id}`;
    return this.http.put<any>(url, request);
  }

  deleteProjectById(id: string): Observable<any> {
    const url = `${this.apiUrl}/delete-project/${id}`;
    return this.http.delete<any>(url);
  }

  isTimeBlocked(time: string) {
    const currentDateTime = new Date();

    const currentHour = currentDateTime.getHours();
    const currentMinute = currentDateTime.getMinutes();

    const [hours, minutes] = time.split(':').map(Number);

    if (
      hours < currentHour ||
      (hours == currentHour && minutes < currentMinute)
    ) {
      return true; // Blocked
    }

    return false;
  }

  isTimeBlockedWithCurrentDate(time: string, tempDate: Date): boolean {
    const currentDateTime = new Date();

    // Chỉ so sánh ngày, loại bỏ giờ và phút
    const currentDate = new Date(currentDateTime.setHours(0, 0, 0, 0)); // Set giờ, phút, giây về 0
    const tempDateOnly = new Date(tempDate.setHours(0, 0, 0, 0)); // Set giờ, phút, giây về 0

    if (tempDateOnly < currentDate) {
      return true; // Blocked
    } else if (tempDateOnly > currentDate) {
      return false; // Not blocked
    } else {
      const currentDateTime = new Date();

      const currentHour = currentDateTime.getHours();
      const currentMinute = currentDateTime.getMinutes();

      const [hours, minutes] = time.split(':').map(Number);

      if (
        hours < currentHour ||
        (hours == currentHour && minutes < currentMinute)
      ) {
        return true; // Blocked
      }

      return false;
    }

    return false; // Not blocked
  }

  getProjectStatus(project: ResponseGetListProjects): string {
    // Accessing the CSS variables from the :root
    const rootStyles = getComputedStyle(document.documentElement);

    // Get the value of the CSS variables
    const waitingColor = rootStyles
      .getPropertyValue('--project-status-waiting')
      .trim();
    const acceptedColor = rootStyles
      .getPropertyValue('--project-status-accepted')
      .trim();
    const completedColor = rootStyles
      .getPropertyValue('--project-status-completed')
      .trim();
    const photoDoneColor = rootStyles
      .getPropertyValue('--project-status-photo-done')
      .trim();
    const missDeadlineColor = rootStyles
      .getPropertyValue('--project-status-miss-deadline')
      .trim();

    switch (project.projectInfo.status) {
      case 'Chờ Xác Nhận':
        return waitingColor; // Return the value of the CSS variable for 'Chờ Xác Nhận'
      case 'Đã Nhận':
        return acceptedColor;
      case 'Đang Xử Lý':
        return photoDoneColor;
      case 'Hoàn thành':
        return completedColor;
      case 'Quá hạn':
        return missDeadlineColor;
      default:
        return rootStyles.getPropertyValue('--project-status-waiting').trim();
    }
  }

  getListPhotographersValid(request: RequestGetListPhotographersValid) {
    const params = new HttpParams()
      .set('startTime', request.startTime)
      .set('endTime', request.endTime);
    const url = `${this.apiUrl}/get-user`;

    return this.http.get<any>(url, { params });
  }

  getListRoomsValid(request: RequestGetListRoomsValid) {
    const params = new HttpParams()
      .set('startTime', request.startTime)
      .set('endTime', request.endTime);
    const url = `${this.apiUrl}/get-room`;

    return this.http.get<any>(url, { params });
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

  convertTime(currentDate: Date, startSlotTimeId: number): Date {
    // Mỗi slot là 30 phút, tính toán giờ và phút từ startSlotTimeId
    const hour = Math.floor((startSlotTimeId - 1) / 2); // Mỗi 2 slot là 1 giờ
    const minute = (startSlotTimeId - 1) % 2 === 0 ? 0 : 30; // Slot chẵn là phút 0, slot lẻ là phút 30

    // Tạo đối tượng Date từ currentDate và thêm giờ, phút
    const startTime = new Date(currentDate);
    startTime.setHours(hour, minute, 0, 0); // Thiết lập giờ và phút, giây và mili giây là 0

    return startTime; // Trả về đối tượng Date tương ứng với startSlotTimeId
  }

  // Function to convert Time in format 2025-03-01 09:00:00.000 to Slot Time Id
  convertTimeToSlotTimeId(time: string | undefined) {
    const date = new Date(time ? time : new Date());
    const hour = date.getHours();
    const minute = date.getMinutes();

    if (minute == 0) return hour * 2 + 1;
    return hour * 2 + 2;
  }

  getListProjectByCustomerId(customerId: string) {
    const params = new HttpParams().set('UserId', customerId);
    const url = `${this.apiUrl}/get-project-by-customer`;
    return this.http.get<any>(url, { params });
  }

  // Function to generate Slot Time - 24h => each Slot Time = 30 minutes
  generateSlotTimes(): SlotTime[] {
    const slotTimes: SlotTime[] = [];
    let indexTimeSlot = 0;
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        indexTimeSlot++;
        let timeString = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        slotTimes.push({
          id: indexTimeSlot,
          time: timeString,
        });
      }
    }
    return slotTimes;
  }
}
