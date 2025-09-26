import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }


  getItems(parentId?: string): Observable<{ items: any[] }> {
    const params = parentId ? new HttpParams().set('parentId', parentId) : undefined;
    return this.http.get<{ items: any[] }>(`${this.apiUrl}/items`, { params });
  }

  createItem(data: any) {
    return this.http.post<{ item: any }>('/api/items', data);
  }

  renameItem(id: string, body: { name?: string; parentId?: string }) {
    return this.http.patch(`${this.apiUrl}/items/${id}`, body);
  }
  moveItem(itemId: string, targetParentId: string): Observable<any> {
    return this.http.patch(`/api/items/${itemId}`, { parentId: targetParentId });
  }

  deleteItem(id: string) {
    return this.http.delete(`${this.apiUrl}/items/${id}`);
  }

  uploadFiles(formData: FormData) {
    return this.http.post(`${this.apiUrl}/items`, formData);
  }
  downloadFile(id: string) {
    return this.http.get(`/api/items/${id}`, {
      responseType: 'blob'
    });
  }
  getPath(folderId: string) {
    return this.http.get<{ items: any[] }>(`/api/items/${folderId}/path`);
  }


}
