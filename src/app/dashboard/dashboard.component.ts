import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  documentTitle: string = '';
  selectedFile: File | null = null;
  permission: string = '';

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && file.name.endsWith('.png')) {
      this.selectedFile = file;
    } else {
      alert('Please select a PNG file.');
      this.selectedFile = null;
    }
  }

  onUploadDocument(event: Event) {
    event.preventDefault();

    if (!this.selectedFile) {
      alert('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.documentTitle);
    formData.append('permission', this.permission);

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('/api/documents', formData, { headers }).subscribe({
      next: (response) => {
        console.log('Document uploaded successfully', response);
      },
      error: (error) => {
        console.error('Error uploading document', error);
      },
      complete: () => {
        console.log('Upload complete');
      }
    });
  }
}
