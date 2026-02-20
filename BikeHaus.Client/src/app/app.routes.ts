import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BicycleListComponent } from './pages/bicycles/bicycle-list.component';
import { BicycleDetailComponent } from './pages/bicycles/bicycle-detail.component';
import { CustomerListComponent } from './pages/customers/customer-list.component';
import { PurchaseListComponent } from './pages/purchases/purchase-list.component';
import { PurchaseFormComponent } from './pages/purchases/purchase-form.component';
import { PurchaseEditComponent } from './pages/purchases/purchase-edit.component';
import { SaleListComponent } from './pages/sales/sale-list.component';
import { SaleFormComponent } from './pages/sales/sale-form.component';
import { SaleEditComponent } from './pages/sales/sale-edit.component';
import { ReturnListComponent } from './pages/returns/return-list.component';
import { ReturnFormComponent } from './pages/returns/return-form.component';
import { ReservationListComponent } from './pages/reservations/reservation-list.component';
import { ReservationFormComponent } from './pages/reservations/reservation-form.component';
import { ReservationConvertComponent } from './pages/reservations/reservation-convert.component';
import { PartsListComponent } from './pages/parts/parts-list.component';
import { ExpenseListComponent } from './pages/expenses/expense-list.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  {
    path: 'bicycles',
    component: BicycleListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'bicycles/:id',
    component: BicycleDetailComponent,
    canActivate: [authGuard],
  },
  {
    path: 'customers',
    component: CustomerListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'purchases',
    component: PurchaseListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'purchases/new',
    component: PurchaseFormComponent,
    canActivate: [authGuard],
  },
  {
    path: 'purchases/edit/:id',
    component: PurchaseEditComponent,
    canActivate: [authGuard],
  },
  { path: 'sales', component: SaleListComponent, canActivate: [authGuard] },
  { path: 'sales/new', component: SaleFormComponent, canActivate: [authGuard] },
  {
    path: 'sales/edit/:id',
    component: SaleEditComponent,
    canActivate: [authGuard],
  },
  {
    path: 'reservations',
    component: ReservationListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'reservations/new',
    component: ReservationFormComponent,
    canActivate: [authGuard],
  },
  {
    path: 'reservations/:id',
    component: ReservationListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'reservations/:id/convert',
    component: ReservationConvertComponent,
    canActivate: [authGuard],
  },
  { path: 'returns', component: ReturnListComponent, canActivate: [authGuard] },
  {
    path: 'returns/new',
    component: ReturnFormComponent,
    canActivate: [authGuard],
  },
  { path: 'parts', component: PartsListComponent, canActivate: [authGuard] },
  {
    path: 'expenses',
    component: ExpenseListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'statistics',
    component: StatisticsComponent,
    canActivate: [authGuard],
  },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
