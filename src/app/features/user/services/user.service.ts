import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { map } from 'rxjs';
import { UpdateUserPrivateInformationRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiBaseUrl}/User`;

  constructor(private http: HttpClient) {}

  getUsers(pageNumber: number, pageSize: number): Observable<any> {
    const url = `${this.apiUrl}/get-all-users/?pageNumber=${pageNumber}&pageSize=${pageSize}&roleName=Employee`;
    return this.http.get<any>(url);
  }

  updateUserStatus(id: string): Observable<any> {
    console.log('Gửi request đến API với userId:', id);
    return this.http.delete<any>(`${this.apiUrl}/delete-user/${id}`);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-user-by-id/${id}`);
  }

  createUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, userData); // Sửa lại endpoint
  }
  getTotalUserCount(): Observable<number> {
    const url = `${this.apiUrl}/count-user?roleName=Employee`;
    return this.http.get<any>(url).pipe(
      map((response) => response.resultOnly) // Lấy `resultOnly` từ API
    );
  }

  updateUserPrivateInformation(
    userId: string,
    request: UpdateUserPrivateInformationRequest
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${userId}`, request);
  }

  searchUserDefault(input: string): Observable<any> {
    const url = `${this.apiUrl}/search-employees`;
    const params = new HttpParams().set('query', input);
    return this.http.get<any>(url, { params });
  }
}
