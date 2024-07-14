import { Component, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-neural-network',
  templateUrl: './neural-network.component.html',
  styleUrls: ['./neural-network.component.css']
})
export class NeuralNetworkComponent implements OnDestroy {
  queryText: string = '';
  responseText: string = '';
  private taskSubscription: Subscription | null = null;

  constructor(private http: HttpClient) { }

  sendQuery(): void {
    if (!this.queryText.trim()) {
      alert('Query text cannot be empty');
      return;
    }

    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post<{ task_id: string }>('/api/process_text', { text: this.queryText }, { headers })
      .subscribe({
        next: (response) => {
          const taskId = response.task_id;
          this.pollTaskStatus(taskId);
        },
        error: (error) => {
          console.error('Error sending query', error);
        }
      });
  }

  pollTaskStatus(taskId: string): void {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.taskSubscription = interval(5000).subscribe(() => {
      this.http.get<{ status: string, text?: string }>(`/api/task_status/${taskId}`, { headers })
        .subscribe({
          next: (response) => {
            if (response.status === 'processed') {
              if (this.taskSubscription) {
                this.taskSubscription.unsubscribe();
              }
              this.responseText = response.text || 'No response text available';
            }
          },
          error: (error) => {
            console.error('Error polling task status', error);
            alert('Failed to poll task status');
          }
        });
    });
  }

  ngOnDestroy(): void {
    if (this.taskSubscription) {
      this.taskSubscription.unsubscribe();
    }
  }
}
