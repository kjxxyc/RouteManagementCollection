import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/auth/login/login';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard';
import { RoutesListComponent } from './components/routes/routes-list/routes-list';
import { InvoicesListComponent } from './components/invoices/invoices-list/invoices-list';
import { PasswordCaptureComponent } from './components/passwords/password-capture/password-capture';
import { PaymentFormComponent } from './components/payments/payment-form/payment-form';
import { RoleManagementComponent } from './components/admin/role-management/role-management';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'routes', 
    component: RoutesListComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'invoices', 
    component: InvoicesListComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'password-capture', 
    component: PasswordCaptureComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'payments', 
    component: PaymentFormComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'admin/roles', 
    component: RoleManagementComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
