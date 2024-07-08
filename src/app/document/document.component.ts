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
  selectedPage: any = null;

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

  onReplacePage(event: Event): void {
    event.preventDefault();

    if (!this.selectedPage) {
      alert('Please select a page first.');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png';

    input.onchange = (e: any) => {
      const file: File = e.target.files[0];
      if (file) {
        const documentId = this.route.snapshot.paramMap.get('id');
        if (documentId && this.selectedPage && this.selectedPage.id) {
          const pageId = this.selectedPage.id;
          const formData = new FormData();
          formData.append('file', file);

          const token = localStorage.getItem('authToken');
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

          this.http.put(`/api/documents/${documentId}/pages/${pageId}`, formData, { headers }).subscribe({
            next: (response) => {
              console.log('Page replaced successfully', response);
              this.loadDocument(documentId);  // Reload the document to get updated pages
            },
            error: (error) => {
              console.error('Error replacing page', error);
            },
            complete: () => {
              console.log('Replacement complete');
            }
          });
        } else {
          console.error('No document ID or page ID available');
        }
      }
    };

    input.click();
  }

  onAddPage(event: Event): void {
    event.preventDefault();

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png';

    input.onchange = (e: any) => {
      const file: File = e.target.files[0];
      if (file) {
        const documentId = this.route.snapshot.paramMap.get('id');
        if (documentId) {
          const formData = new FormData();
          formData.append('file', file);

          const token = localStorage.getItem('authToken');
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

          this.http.post(`/api/documents/${documentId}/pages`, formData, { headers }).subscribe({
            next: (response) => {
              console.log('Page added successfully', response);
              this.loadDocument(documentId);  // Reload the document to get updated pages
            },
            error: (error) => {
              console.error('Error adding page', error);
            },
            complete: () => {
              console.log('Addition complete');
            }
          });
        } else {
          console.error('No document ID available');
        }
      }
    };

    input.click();
  }

  onDeletePage(event: Event): void {
    event.preventDefault();

    if (!this.selectedPage) {
      alert('Please select a page first.');
      return;
    }

    if (confirm('Are you sure you want to delete this page?')) {
      const documentId = this.route.snapshot.paramMap.get('id');
      if (documentId && this.selectedPage && this.selectedPage.id) {
        const pageId = this.selectedPage.id;

        const token = localStorage.getItem('authToken');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.delete(`/api/documents/${documentId}/pages/${pageId}`, { headers }).subscribe({
          next: (response) => {
            console.log('Page deleted successfully', response);
            this.loadDocument(documentId);  // Reload the document to get updated pages
          },
          error: (error) => {
            console.error('Error deleting page', error);
          },
          complete: () => {
            console.log('Deletion complete');
          }
        });
      } else {
        console.error('No document ID or page ID available');
      }
    }
  }
}