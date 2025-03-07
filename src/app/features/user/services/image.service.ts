import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { GetImageRequest, SaveImageRequest } from '../models/image.model';
import { get } from 'node:http';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private apiUrl = `${environment.apiBaseUrl}/User`;
  private apiImageUrl = `${environment.apiBaseUrl}/storage`;

  constructor(private http: HttpClient) {}
  /**
   * Upload user avatar
   * @param userId - The ID of the user
   * @param file - The selected file to upload
   * @returns Observable of the API response
   */

  uploadAvatar(saveImageRequest: SaveImageRequest): Observable<any> {
    const formData = new FormData();
    formData.append('file', saveImageRequest.file);

    return this.http.post(
      `${this.apiUrl}/uploadImage/${saveImageRequest.userId}`,
      formData
    );
  }
  getAvatar(getImageRequest: GetImageRequest): Observable<any> {
    const params = new HttpParams().set('fileName', getImageRequest.avatarUrl);
    return this.http.get(`${this.apiImageUrl}/get-sas-token`, { params });
  }
}
