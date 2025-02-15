import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';
import { DocumentSearchComponent } from './document-search/document-search.component';
import { DocumentComponent } from './document/document.component';
import { NeuralNetworkComponent } from './neural-network/neural-network.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/document-search', pathMatch: 'full' },
  { path: 'document-search', component: DocumentSearchComponent, canActivate: [AuthGuard] },
  { path: 'document/:id', component: DocumentComponent, canActivate: [AuthGuard] },
  { path: 'neural-network', component: NeuralNetworkComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
