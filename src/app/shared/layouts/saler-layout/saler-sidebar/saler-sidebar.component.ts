import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-saler-sidebar',
  imports: [MatIconModule, CommonModule],
  templateUrl: './saler-sidebar.component.html',
  styleUrl: './saler-sidebar.component.css',
})
export class SalerSidebarComponent {
  constructor(private router: Router) {}

  isActive(route: string) {
    return this.router.url === route;
  }
}
