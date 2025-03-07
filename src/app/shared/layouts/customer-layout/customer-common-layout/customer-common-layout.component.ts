import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CustomerNavbarComponent } from '../customer-navbar/customer-navbar.component';
import { CustomerFooterComponent } from '../customer-footer/customer-footer.component';

@Component({
  selector: 'app-customer-common-layout',
  imports: [RouterModule, CustomerNavbarComponent, CustomerFooterComponent],
  templateUrl: './customer-common-layout.component.html',
  styleUrl: './customer-common-layout.component.css',
})
export class CustomerCommonLayoutComponent {}
