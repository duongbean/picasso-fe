import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import {FooterComponent} from '../footer/footer.component'
@Component({
  selector: 'app-common-layout',
  imports: [NavbarComponent,SidebarComponent, RouterModule, FooterComponent],
  templateUrl: './common-layout.component.html',
  styleUrl: './common-layout.component.css'
})
export class CommonLayoutComponent {

}
