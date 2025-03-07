import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod'; 
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlbumService {
  private apiUrl = `${environment.apiBaseUrl}/albums`;

  constructor(private http: HttpClient) {}

  getListAlbums(): Observable<any> {
    const url = `${this.apiUrl}/albums`;
    return this.http.get<any>(url);
  }

  getAlbumsByProjectId(projectId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/list-album-by-project/${projectId}`);
  }

  getAlbumsById(albumId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-album-by-id/${albumId}`);
  }

  createAlbum(projectId: string, albumData: any, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('Name', albumData.albumName);
    formData.append('LinkGGDrive', albumData.googleDriveLink);
    
    if (file) {
      formData.append('ThumbnailFile', file);
    }

    return this.http.post(`${this.apiUrl}/create-album/${projectId}`, formData);
  }
  updateAlbum(id: string, albumData: any): Observable<any> {
    const formData = new FormData();
    console.log("eossss", albumData); // Kiểm tra lại dữ liệu albumData
  
    formData.append('Name', albumData.albumName);
    formData.append('LinkGGDrive', albumData.googleDriveLink);
  
    // Kiểm tra xem coverImage có phải là tệp không
    if (albumData.coverImage instanceof File) {
      formData.append('ThumbnailFile', albumData.coverImage); // Thêm ảnh bìa vào FormData
    }
  
    return this.http.put(`${this.apiUrl}/update-album/${id}`, formData);
  }
  

  deleteAlbum(albumId: string): Observable<any> {
    const url = `${this.apiUrl}/delete-album/${albumId}`;
    return this.http.delete(url);
  }
  updateAlbumImages(albumId: string): Observable<any> {
    const url = `${this.apiUrl}/update-album-images/${albumId}`;
    return this.http.put(url, {});
  }

 
}
