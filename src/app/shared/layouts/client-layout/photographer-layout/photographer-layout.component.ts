import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
@Component({
  selector: 'app-photographer-layout',
  imports: [RouterModule,NavbarComponent, FooterComponent],
  templateUrl: './photographer-layout.component.html',
  styleUrl: './photographer-layout.component.css'
})
export class PhotographerLayoutComponent {

}
