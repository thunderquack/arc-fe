import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-neural-network',
  templateUrl: './neural-network.component.html',
  styleUrls: ['./neural-network.component.css']
})
export class NeuralNetworkComponent {
  queryText: string = '';
  responseText: string = '';

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
          alert('Failed to send query');
        }
      });
  }

  pollTaskStatus(taskId: string): void {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const intervalId = setInterval(() => {
      this.http.get<{ status: string, text?: string }>(`/api/task_status/${taskId}`, { headers })
        .subscribe({
          next: (response) => {
            if (response.status === 'processed') {
              clearInterval(intervalId);
              this.responseText = response.text || 'No response text available';
            }
          },
          error: (error) => {
            console.error('Error polling task status', error);
            alert('Failed to poll task status');
          }
        });
    }, 5000); // Poll every 5 seconds
  }
}
