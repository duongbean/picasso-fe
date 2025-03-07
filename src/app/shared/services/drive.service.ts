import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod'; 
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DriveService {
  private apiUrl = `${environment.apiBaseUrl}/Photo`;

  constructor(private http: HttpClient) {}

  getImages(albumId: string, pageNumber: number, pageSize: number): Observable<{ resultOnly: { photos: { filePath: string, id: string, likeNumber: number, commentNumber: number }[] } }> {
    const requestUrl = `${this.apiUrl}/get-photo-by-album-id?Id=${albumId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
  
    return this.http.get<{ resultOnly: { photos: { filePath: string, id: string, likeNumber: number, commentNumber: number }[] } }>(requestUrl);
  }
  
  
  
}
