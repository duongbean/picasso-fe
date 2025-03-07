import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { GetListProjectsRequest } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private apiUrl = `${environment.apiBaseUrl}/User`;

  constructor(private http: HttpClient) {}

  getUsers(pageNumber: number, pageSize: number): Observable<any> {
    const url = `${this.apiUrl}/users/?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return this.http.get<any>(url);
  }

  getListPhotographers(): Observable<any> {
    const url = `${this.apiUrl}/get-photographer`;
    return this.http.get(url);
  }

  getUserById(id: string): Observable<any> {
    const url = `${this.apiUrl}/get-user-by-id/${id}`;
    return this.http.get<any>(url);
  }
}
