import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { GetListProjectsRequest } from '../models/project.model';
import { RequestCreateCustomer } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = `${environment.apiBaseUrl}/User`;

  constructor(private http: HttpClient) {}

  getListCustomersByEmail(email: string): Observable<any> {
    const url = `${this.apiUrl}/get-customer-by-email/${email}`;
    return this.http.get<any>(url);
  }

  // Temp - because not have Get Customer Real
  getListUsers(): Observable<any> {
    const url = `${environment.apiBaseUrl}/User/get-all-users`;
    return this.http.get<any>(url);
  }

  getListCustomers(): Observable<any> {
    const url = `${this.apiUrl}/list-customers`;
    return this.http.get<any>(url);
  }

  createNewCustomer(request: RequestCreateCustomer): Observable<any> {
    const url = `${this.apiUrl}/create-customer`;
    return this.http.post<any>(url, request);
  }
}
