import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.prod';
@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private apiUrl = `${environment.apiBaseUrl}/Role`;
  constructor(private http: HttpClient) {}

  getRoles(): Observable<string[]> {
    return this.http.get<any>(`${this.apiUrl}/roles`).pipe(
      map((response) => {
        console.log('API Response:', response);
        return response.result.map((role: any) => role.roleName); // Lấy danh sách roleName
      })
    );
  }
}
