import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private apiUrl = `${environment.apiBaseUrl}/Address`;

  constructor(private http: HttpClient) {}

  // GET - list provinces
  getListProvinces(): Observable<any> {
    const url = `${this.apiUrl}/citys`; // API viet sai chinh ta
    return this.http.get<any>(url);
  }

  // GET - list districts by provinceId
  getListDistrictsByProvinceId(provinceId: string): Observable<any> {
    const params = new HttpParams().set('Id', provinceId);
    const url = `${this.apiUrl}/districts`;
    return this.http.get<any>(url, { params });
  }

  // GET - list wards by districtId
  getListWarssByDistrictId(districtId: string): Observable<any> {
    const params = new HttpParams().set('Id', districtId);
    const url = `${this.apiUrl}/wards`;
    return this.http.get<any>(url, { params });
  }
}
