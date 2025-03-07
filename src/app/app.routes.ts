import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { CommonLayoutComponent } from './shared/layouts/admin-layout/common-layout/common-layout.component';
import { RoleGuard } from './core/guards/role.guard';
import { PhotographerLayoutComponent } from './shared/layouts/client-layout/photographer-layout/photographer-layout.component';

// Import trực tiếp component để tránh reload layout khi điều hướng
import { DashboardComponent } from './shared/layouts/admin-layout/dashboard/dashboard.component';
import { ViewUserComponent } from './features/user/components/view-user/view-user.component';
import { CreateUserComponent } from './features/user/components/create-user/create-user.component';
import { UpdateUserPrivateInformationComponent } from './features/user/components/update-user-private-information/update-user-private-information.component';
import { ViewUserDetailComponent } from './features/user/components/view-user-detail/view-user-detail.component';
import { ViewAlbumsComponent } from './features/album/components/view-albums/view-albums.component';
import { ForgotPasswordComponent } from './features/auth/components/forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './features/auth/components/change-password/change-password.component';
import { AccessDeniedComponent } from './features/auth/components/access-denied/access-denied.component';
import { ForgotPasswordOtpComponent } from './features/auth/components/forgot-password-otp/forgot-password-otp.component';
import { ForgotPasswordNewPasswordComponent } from './features/auth/components/forgot-password-new-password/forgot-password-new-password.component';
import { ViewAlbumDetailComponent } from './features/album/components/view-album-detail/view-album-detail.component';
import { ViewCustomerComponent } from './features/customer/components/view-customer/view-customer.component';
import { CreateCustomerComponent } from './features/customer/components/create-customer/create-customer.component';
import { ViewCustomerDetailComponent } from './features/customer/components/view-customer-detail/view-customer-detail.component';
import { UpdateUserComponent } from './features/user/components/update-user/update-user.component';
import { SalerCommonLayoutComponent } from './shared/layouts/saler-layout/common/saler-common-layout/saler-common-layout.component';
import { ViewScheduleProjectComponent } from './features/schedule-project/components/view-schedule-project/view-schedule-project.component';
import { CreateProjectComponent } from './features/schedule-project/components/create-project/create-project.component';
import { ViewPhotoProjectComponent } from './features/photo-project/components/view-photo-project/view-photo-project.component';
import { CreateAlbumComponent } from './features/album/components/create-album/create-album.component';
import { UpdateCustomerComponent } from './features/customer/components/update-customer/update-customer.component';
import { ViewProjectDetailComponent } from './features/photo-project/components/view-project-detail/view-project-detail.component';
import { CustomerCommonLayoutComponent } from './shared/layouts/customer-layout/customer-common-layout/customer-common-layout.component';
import { CustomerViewProjectsComponent } from './features/user/components/customer-view-projects/customer-view-projects.component';
import { UpdateAlbumComponent } from './features/album/components/update-album/update-album.component';
import { UpdateProjectComponent } from './features/schedule-project/components/update-project/update-project.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },

  {
    path: 'login',
    component: LoginComponent, // ✅ Sử dụng component thay vì loadComponent
  },

  {
    path: '',
    component: PhotographerLayoutComponent,
    canActivate: [RoleGuard],
    data: { expectedRole: 'Photographer' },
    children: [
      { path: 'view-albums/:id', component: ViewAlbumsComponent },
      { path: 'view-album-detail/:id', component: ViewAlbumDetailComponent },
      { path: 'view-photo-project', component: ViewPhotoProjectComponent },
      {
        path: 'view-project-detail/:id',
        component: ViewProjectDetailComponent,
      },
      { path: 'create-album/:id', component: CreateAlbumComponent },
      { path: 'update-album/:id', component: UpdateAlbumComponent },
    ],
  },

  {
    path: '',
    component: CommonLayoutComponent, // ✅ Layout chung sẽ không bị reload
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent, // ✅ Tránh loadComponent để không re-render layout
        canActivate: [RoleGuard],
        data: { expectedRole: ['Admin'] },
      },
      {
        path: 'view-user',
        component: ViewUserComponent, // ✅ Giữ nguyên layout
        canActivate: [RoleGuard],
        data: { expectedRole: ['Admin'] },
      },
      {
        path: 'view-customer',
        component: ViewCustomerComponent, // ✅ Giữ nguyên layout
        canActivate: [RoleGuard],
        data: { expectedRole: ['Admin', 'Saler'] },
      },
      {
        path: 'create-user',
        component: CreateUserComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: ['Admin'] },
      },
      {
        path: 'create-customer',
        component: CreateCustomerComponent,
        // canActivate: [RoleGuard],
        // data: { expectedRole: ['Admin','Saler'] },
      },
      {
        path: 'update-user-private-information',
        component: UpdateUserPrivateInformationComponent,
        canActivate: [RoleGuard],
        data: {
          expectedRole: ['Admin', 'Photographer', 'Saler', 'Makeup Artist'],
        },
      },
      {
        path: 'update-user',
        component: UpdateUserComponent,
        canActivate: [RoleGuard],
        data: {
          expectedRole: ['Admin', 'Photographer', 'Saler', 'Makeup Artist'],
        },
      },
      {
        path: 'view-user-detail/:id',
        component: ViewUserDetailComponent,
        canActivate: [RoleGuard],
        data: {
          expectedRole: ['Admin'],
        },
        runGuardsAndResolvers: 'paramsChange',
      },
      {
        path: 'view-customer-detail/:id',
        component: ViewCustomerDetailComponent,
        canActivate: [RoleGuard],
        data: {
          expectedRole: ['Admin', 'Saler'],
        },
        runGuardsAndResolvers: 'paramsChange',
      },
      {
        path: 'update-customer/:id',
        component: UpdateCustomerComponent,
        canActivate: [RoleGuard],
        data: { expectedRole: ['Admin', 'Saler'] },
      },
    ],
  },

  { path: 'forgot-password', component: ForgotPasswordComponent },

  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [RoleGuard],
    data: { expectedRole: ['Admin', 'Photographer', 'Saler', 'Makeup Artist'] },
  },
  // {
  //   path: '',
  //   component: DashboardComponent, // Dashboard làm layout chính
  //   canActivate: [RoleGuard], // Chỉ Admin có thể vào Dashboard
  //   data: { expectedRole: ['Admin'] }, // RoleGuard sẽ kiểm tra quyền truy cập
  //   children: [
  //     {
  //       path: 'dashboard',
  //       loadComponent: () =>
  //         import(
  //           './features/user/components/view-user/view-user.component'
  //         ).then((m) => m.ViewUserComponent),
  //     },
  //     {
  //       path: 'dashboard/update-user-private-information',
  //       loadComponent: () =>
  //         import(
  //           './features/user/components/update-user-private-information/update-user-private-information.component'
  //         ).then((m) => m.UpdateUserPrivateInformationComponent),
  //     },
  //   ],
  // },

  {
    path: 'dashboard1',
    loadChildren: () =>
      import('./test/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },

  { path: 'access-denied', component: AccessDeniedComponent },

  { path: 'otp', component: ForgotPasswordOtpComponent },

  {
    path: 'forgot-password-new-password',
    component: ForgotPasswordNewPasswordComponent,
  },

  // For Saler:
  {
    path: '',
    component: SalerCommonLayoutComponent,
    // canActivate: [RoleGuard],
    // data: { expectedRole: 'Photographer' },
    children: [
      { path: 'view-schedule', component: ViewScheduleProjectComponent },
      { path: 'create-project', component: CreateProjectComponent },
      { path: 'update-project', component: UpdateProjectComponent },
      { path: 'view-project-detail', component: ViewProjectDetailComponent },
    ],
  },

  // For Customer:
  {
    path: '',
    component: CustomerCommonLayoutComponent,
    // canActivate: [RoleGuard],
    // data: { expectedRole: 'Photographer' },
    children: [
      { path: 'view-projects', component: CustomerViewProjectsComponent },
      // { path: 'create-project', component: CreateProjectComponent },
      // { path: 'view-project-detail', component: ViewProjectDetailComponent },
    ],
  },
];
