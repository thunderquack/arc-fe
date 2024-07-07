import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit {
  documentTitle: string = '';
  creator: string = '';
  date: string = '';
  summary: string = '';
  recognizedText: string = '';
  pages: any[] = [];
  selectedPage: any;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const documentId: string | null = this.route.snapshot.paramMap.get('id');
    if (documentId) {
      this.loadDocument(documentId);
    } else {
      console.error('No document ID found in the route parameters');
    }
  }

  loadDocument(documentId: string): void {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`/api/documents/${documentId}`, { headers }).subscribe({
      next: (response) => {
        this.documentTitle = response.title;
        this.creator = response.creator;
        this.date = new Date(response.created_at).toLocaleDateString();
        this.pages = response.pages.map((page: any) => ({
          ...page,
          image: this.convertToBase64Image(page.image_data)
        }));
        this.summary = response.summary || ''; // Add this if summary is available
        this.recognizedText = response.recognizedText || ''; // Add this if recognizedText is available
      },
      error: (error) => {
        console.error('Error loading document', error);
      }
    });
  }

  convertToBase64Image(imageData: string): string {
    if (!imageData.startsWith('data:image/png;base64,')) {
      return `data:image/png;base64,${imageData}`;
    }
    return imageData;
  }

  selectPage(page: any): void {
    this.selectedPage = page;
  }
}