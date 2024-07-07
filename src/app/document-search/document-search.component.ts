import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-document-search',
  templateUrl: './document-search.component.html',
  styleUrls: ['./document-search.component.css']
})
export class DocumentSearchComponent implements OnInit {
  searchQuery: string = '';
  documents: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('/api/documents', { headers }).subscribe({
      next: (data) => {
        this.documents = data;
      },
      error: (error) => {
        console.error('Error fetching documents', error);
      }
    });
  }

  onSearch(event: Event) {
    event.preventDefault();
    // Here you can implement the search functionality later
  }
}
