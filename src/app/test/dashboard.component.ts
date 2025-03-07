import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../shared/layouts/admin-layout/navbar/navbar.component';
import { SidebarComponent } from '../shared/layouts/admin-layout/sidebar/sidebar.component';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [RouterModule, NavbarComponent, SidebarComponent],
})
export class DashboardComponent {}
