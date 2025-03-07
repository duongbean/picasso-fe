import { Component } from '@angular/core';
import { SalerNavbarComponent } from '../../saler-navbar/saler-navbar.component';
import { RouterModule } from '@angular/router';
import { SalerSidebarComponent } from '../../saler-sidebar/saler-sidebar.component';

@Component({
  selector: 'app-saler-common-layout',
  imports: [SalerNavbarComponent, RouterModule, SalerSidebarComponent],
  templateUrl: './saler-common-layout.component.html',
  styleUrl: './saler-common-layout.component.css',
})
export class SalerCommonLayoutComponent {}
