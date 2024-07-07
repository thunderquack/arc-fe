import { Component, OnInit } from '@angular/core';

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

  ngOnInit(): void {
    // Инициализация данных, загрузка документа и страниц
  }

  selectPage(page: any): void {
    this.selectedPage = page;
  }
}
