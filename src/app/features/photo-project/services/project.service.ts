import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod'; 

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiBaseUrl}/Project`;

  constructor(private http: HttpClient) {}

  getProjectsByUser(userId: string, startTime?: string, endTime?: string, status?: string): Observable<any> {
    let params = new HttpParams().set('UserId', userId);

    if (startTime) {
        params = params.set('startTime', startTime);
    }
    if (endTime) {
        params = params.set('endTime', endTime);
    }
    if (status) {
        params = params.set('status', status);
    }

    return this.http.get<any>(`${this.apiUrl}/get-project-by-user`, { params });
}

getProjectById(projectId: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/get-project-by-id/${projectId}`);
}
updateProjectStatus(projectId: string, status: string): Observable<any> {
  return this.http.put(`${this.apiUrl}/update-project-status/${projectId}?status=${status}`, {});
}


}