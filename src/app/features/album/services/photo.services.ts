import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private apiUrl = `${environment.apiBaseUrl}/Photo`;

  constructor(private http: HttpClient) {}

  addRecommendPhoto(photoId: string): Observable<any> {
    const url = `${this.apiUrl}/add-recommend-photo`;
    const params = new HttpParams().set('photoId', photoId);

    return this.http.put<any>(url, null, { params });
  }

  removeRecommendPhoto(photoId: string): Observable<any> {
    const url = `${this.apiUrl}/remove-recommend-photo`;
    const params = new HttpParams().set('photoId', photoId);

    return this.http.put<any>(url, null, { params });
  }
}
