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
  ) { }

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
        this.pages.sort((a, b) => a.page_number - b.page_number);
        this.summary = response.summary || '';
        this.recognizedText = response.recognizedText || '';
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
      console.error('No page selected');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png';

    input.onchange = (e: any) => {
      const file: File = e.target.files[0];
      if (file) {
        const documentId = this.route.snapshot.paramMap.get('id');
        const pageId = this.selectedPage?.page_id;
        if (!documentId || !pageId) {
          console.error('No document ID or page ID available');
          return;
        }

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
        if (!documentId) {
          console.error('No document ID available');
          return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('authToken');
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.post(`/api/documents/${documentId}/pages`, formData, { headers }).subscribe({
          next: (response) => {
            console.log('Page added successfully', response);
            this.loadDocument(documentId!);  // Reload the document to get updated pages
            this.reorderPages(); // Перенумерация страниц
          },
          error: (error) => {
            console.error('Error adding page', error);
          },
          complete: () => {
            console.log('Addition complete');
          }
        });
      }
    };

    input.click();
  }

  onDeletePage(event: Event): void {
    event.preventDefault();

    if (!this.selectedPage) {
      console.error('No page selected');
      return;
    }

    if (confirm('Are you sure you want to delete this page?')) {
      const documentId = this.route.snapshot.paramMap.get('id');
      const pageId = this.selectedPage?.page_id;

      if (!documentId || !pageId) {
        console.error('No document ID or page ID available');
        return;
      }

      const token = localStorage.getItem('authToken');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.delete(`/api/documents/${documentId}/pages/${pageId}`, { headers }).subscribe({
        next: (response) => {
          console.log('Page deleted successfully', response);
          this.loadDocument(documentId!);  // Reload the document to get updated pages
          this.reorderPages(); // Перенумерация страниц
        },
        error: (error) => {
          console.error('Error deleting page', error);
        },
        complete: () => {
          console.log('Deletion complete');
        }
      });
    }
  }

  movePageUp(index: number): void {
    if (index > 0) {
      const temp = this.pages[index];
      this.pages[index] = this.pages[index - 1];
      this.pages[index - 1] = temp;

      // Update page numbers
      this.pages[index].page_number++;
      this.pages[index - 1].page_number--;

      this.updatePageOrder();
    }
  }

  movePageDown(index: number): void {
    if (index < this.pages.length - 1) {
      const temp = this.pages[index];
      this.pages[index] = this.pages[index + 1];
      this.pages[index + 1] = temp;

      // Update page numbers
      this.pages[index].page_number--;
      this.pages[index + 1].page_number++;

      this.updatePageOrder();
    }
  }

  updatePageOrder(): void {
    const documentId = this.route.snapshot.paramMap.get('id');
    if (!documentId) {
      console.error('No document ID available');
      return;
    }

    const pageOrder = this.pages.map((page, index) => ({
      page_id: page.page_id,
      new_order: index + 1
    }));

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`/api/documents/${documentId}/reorder-pages`, pageOrder, { headers }).subscribe({
      next: (response) => {
        console.log('Pages reordered successfully', response);
      },
      error: (error) => {
        console.error('Error reordering pages', error);
      }
    });
  }

  reorderPages(): void {
    const documentId = this.route.snapshot.paramMap.get('id');
    if (!documentId) {
      console.error('No document ID available');
      return;
    }

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const updatedPages = this.pages.map((page) => ({
      page_id: page.page_id,
      page_number: page.page_number
    }));

    this.http.put(`/api/documents/${documentId}/reorder-pages`, updatedPages, { headers }).subscribe({
      next: (response) => {
        console.log('Pages reordered successfully', response);
        this.loadDocument(documentId);  // Reload the document to get updated pages
      },
      error: (error) => {
        console.error('Error reordering pages', error);
      },
      complete: () => {
        console.log('Reordering complete');
      }
    });
  }

  rotatePageLeft(index: number): void {
    this.rotatePage(index, -90);
  }

  rotatePageRight(index: number): void {
    this.rotatePage(index, 90);
  }

  rotatePage(index: number, angle: number): void {
    const page = this.pages[index];
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = img.height;
        canvas.height = img.width;
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate((angle * Math.PI) / 180);
        context.drawImage(img, -img.width / 2, -img.height / 2);
        const rotatedImage = canvas.toDataURL('image/png');

        // Replace the page with the rotated image
        const documentId = this.route.snapshot.paramMap.get('id');
        const pageId = page.page_id;
        if (!documentId || !pageId) {
          console.error('No document ID or page ID available');
          return;
        }

        fetch(rotatedImage)
          .then((res) => res.blob())
          .then((blob) => {
            const formData = new FormData();
            formData.append('file', blob, 'image.png');

            const token = localStorage.getItem('authToken');
            const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

            this.http.put(`/api/documents/${documentId}/pages/${pageId}`, formData, { headers }).subscribe({
              next: (response) => {
                console.log('Page rotated and replaced successfully', response);
                this.loadDocument(documentId); // Reload the document to get updated pages
              },
              error: (error) => {
                console.error('Error rotating and replacing page', error);
              },
              complete: () => {
                console.log('Rotation complete');
              }
            });
          });
      }
    };
    img.src = page.image;
  }
}
