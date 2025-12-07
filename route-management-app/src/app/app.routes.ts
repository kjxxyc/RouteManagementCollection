import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RoutesListComponent } from './routes/routes-list.component';
import { PaymentsListComponent } from './payments/payments-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InvoicesListComponent } from './invoices/invoices-list.component';
import { ReportsComponent } from './reports/reports.component';

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'dashboard', component: DashboardComponent },
	{ path: 'rutas', component: RoutesListComponent },
	{ path: 'facturas', component: InvoicesListComponent },
	{ path: 'pagos', component: PaymentsListComponent },
	{ path: 'reportes', component: ReportsComponent },
	{ path: '**', redirectTo: '' }
];
