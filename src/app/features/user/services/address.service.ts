import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { GetImageRequest, SaveImageRequest } from '../models/image.model';
import {
  GetAllDistrictsByProvinceCodeRequest,
  GetAllProvincesRequest,
  GetAllWardsByDistrictCodeRequest,
} from '../models/address.model';

interface Ward {
  _id: string;
  code: string;
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  parent_code: string;
  isDeleted?: boolean;
}

// Define the structure of the API response
interface WardApiResponse {
  exitcode: number;
  data: {
    nItems: number;
    nPages: number;
    data: Ward[]; // The actual array of wards
  };
}

// Define the expected structure for a District
interface District {
  _id: string;
  code: string;
  name: string;
  type: string;
  slug: string;
  name_with_type: string;
  path: string;
  path_with_type: string;
  parent_code: string; // This links districts to provinces
  isDeleted?: boolean;
}

// Define the API response for Districts
interface DistrictApiResponse {
  exitcode: number;
  data: {
    nItems: number;
    nPages: number;
    data: District[];
  };
}
@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private apiUrl = `https://vn-public-apis.fpo.vn`;

  constructor(private http: HttpClient) {}

  getAllProvinces(request: GetAllProvincesRequest): Observable<any> {
    const params = new HttpParams().set('limit', request.limit);
    return this.http.get(`${this.apiUrl}/provinces/getAll`, { params });
  }

  getAllDistrictsByProvinceCode(
    request: GetAllDistrictsByProvinceCodeRequest
  ): Observable<any> {
    const params = new HttpParams()
      .set('provinceCode', request.provinceCode)
      .set('limit', request.limit);
    return this.http.get(`${this.apiUrl}/districts/getByProvince`, { params });
  }

  getAllWardsByDistrictCode(
    request: GetAllWardsByDistrictCodeRequest
  ): Observable<any> {
    const params = new HttpParams()
      .set('districtCode', request.districtCode)
      .set('limit', request.limit);
    return this.http.get(`${this.apiUrl}/wards/getByDistrict`, { params });
  }

  private wardsMap: { [key: string]: Ward } = {}; // Store wards for quick lookup
  private districtsMap: { [key: string]: District } = {}; // Store districts

  // Fetch wards from API and extract only the needed array
  fetchWards(): Observable<Ward[]> {
    return this.http
      .get<WardApiResponse>(`${this.apiUrl}/wards/getAll?limit=-1`)
      .pipe(
        map((response: WardApiResponse) => response.data.data || []) // Extract the array
      );
  }

  // loadWards() {
  //   this.fetchWards().subscribe((wardsArray) => {
  //     console.log('🔹 API Response get All Ward:', wardsArray);

  //     if (!Array.isArray(wardsArray)) {
  //       console.error('❌ Unexpected API Response Format:', wardsArray);
  //       return;
  //     }

  //     // Convert list into a dictionary for quick lookup
  //     this.wardsMap = wardsArray.reduce(
  //       (acc: { [key: string]: Ward }, ward: Ward) => {
  //         acc[ward.code] = ward; // Use ward code as the key
  //         return acc;
  //       },
  //       {}
  //     );

  //     console.log('✅ Wards Map:', this.wardsMap);
  //   });
  // }

  loadWards(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.fetchWards().subscribe((wardsArray) => {
        console.log('🔹 API Response get All Ward:', wardsArray);

        if (!Array.isArray(wardsArray)) {
          console.error('❌ Unexpected API Response Format:', wardsArray);
          observer.next(false);
          observer.complete();
          return;
        }

        this.wardsMap = wardsArray.reduce(
          (acc: { [key: string]: Ward }, ward: Ward) => {
            acc[ward.code] = ward;
            return acc;
          },
          {}
        );

        console.log('✅ Wards Map:', this.wardsMap);
        observer.next(true);
        observer.complete();
      });
    });
  }

  // Retrieve a ward by ID in O(1) time complexity
  getWardById(wardId: string): Ward | null {
    return this.wardsMap[wardId] || null;
  }

  // Fetch districts from API
  fetchDistricts(): Observable<District[]> {
    return this.http
      .get<DistrictApiResponse>(`${this.apiUrl}/districts/getAll?limit=-1`)
      .pipe(
        map((response: DistrictApiResponse) => response.data.data || []) // Extract the array
      );
  }

  loadDistricts(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.fetchDistricts().subscribe((districtsArray) => {
        console.log('🔹 API Response get All Districts:', districtsArray);

        if (!Array.isArray(districtsArray)) {
          console.error('❌ Unexpected API Response Format:', districtsArray);
          observer.next(false);
          observer.complete();
          return;
        }

        this.districtsMap = districtsArray.reduce(
          (acc: { [key: string]: District }, district: District) => {
            acc[district.code] = district;
            return acc;
          },
          {}
        );

        console.log('✅ Districts Map:', this.districtsMap);
        observer.next(true);
        observer.complete();
      });
    });
  }

  // Retrieve a district by ID (O(1) lookup)
  getDistrictById(districtId: string): District | null {
    return this.districtsMap[districtId] || null;
  }
}
