import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { MainContentComponent } from './main-content/main-content.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { ViewUserComponent } from './view-user/view-user.component';

export const DASHBOARD_ROUTES: Routes = [
  // {
  //   path: '',
  //   component: DashboardComponent,
  //   children: [
  //     { path: '', component: MainContentComponent },
  //     { path: 'create-user', component: CreateUserComponent },
  //     { path: 'update-user', component: UpdateUserComponent },
  //     { path: 'view-user', component: ViewUserComponent },
  //   ],
  // },
];
