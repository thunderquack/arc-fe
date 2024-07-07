import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-document-search',
  templateUrl: './document-search.component.html',
  styleUrls: ['./document-search.component.css']
})
export class DocumentSearchComponent implements OnInit {
  searchQuery: string = '';
  documents: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('/api/documents', { headers }).subscribe({
      next: (response) => {
        this.documents = response;
      },
      error: (error) => {
        console.error('Error loading documents', error);
      }
    });
  }

  onSearch(event: Event) {
    event.preventDefault();
    this.loadDocuments();  // Here you can add filtering logic based on searchQuery
  }

  editDocument(documentId: string) {
    this.router.navigate(['/document', documentId]);
  }
}