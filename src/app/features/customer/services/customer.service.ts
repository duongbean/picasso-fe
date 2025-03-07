import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod'; 
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = `${environment.apiBaseUrl}/User`;

  constructor(private http: HttpClient) {}

  getCustomers(pageNumber: number, pageSize: number): Observable<any> {
    const url = `${this.apiUrl}/get-all-users/?pageNumber=${pageNumber}&pageSize=${pageSize}&roleName=Customer`;
    return this.http.get<any>(url); 
  }
  updateCustomer(userId: string, customerData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${userId}`, customerData);
  }
  
 

getCustomerById(id: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/get-user-by-id/${id}`);
}

  createCustomer(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-customer`, userData); // Sửa lại endpoint
  }
  getTotalCustomerCount(): Observable<number> {
    const url = `${this.apiUrl}/count-user?roleName=Customer`;
    return this.http.get<any>(url).pipe(
      map(response => response.resultOnly) // Lấy `resultOnly` từ API
    );
  }
  
 

}
