import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'bicycles',
    loadComponent: () =>
      import('./pages/bicycles/bicycle-list.component').then(
        (m) => m.BicycleListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'bicycles/:id',
    loadComponent: () =>
      import('./pages/bicycles/bicycle-detail.component').then(
        (m) => m.BicycleDetailComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'labels',
    loadComponent: () =>
      import('./pages/bicycles/bicycle-labels.component').then(
        (m) => m.BicycleLabelsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./pages/customers/customer-list.component').then(
        (m) => m.CustomerListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'purchases',
    loadComponent: () =>
      import('./pages/purchases/purchase-list.component').then(
        (m) => m.PurchaseListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'purchases/new',
    loadComponent: () =>
      import('./pages/purchases/purchase-form.component').then(
        (m) => m.PurchaseFormComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'purchases/missing',
    loadComponent: () =>
      import('./pages/purchases/missing-purchases.component').then(
        (m) => m.MissingPurchasesComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'purchases/missing/new',
    loadComponent: () =>
      import('./pages/purchases/missing-purchase-form.component').then(
        (m) => m.MissingPurchaseFormComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'purchases/edit/:id',
    loadComponent: () =>
      import('./pages/purchases/purchase-edit.component').then(
        (m) => m.PurchaseEditComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'sales',
    loadComponent: () =>
      import('./pages/sales/sale-list.component').then(
        (m) => m.SaleListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'sales/new',
    loadComponent: () =>
      import('./pages/sales/sale-form.component').then(
        (m) => m.SaleFormComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'sales/edit/:id',
    loadComponent: () =>
      import('./pages/sales/sale-edit.component').then(
        (m) => m.SaleEditComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'returns',
    loadComponent: () =>
      import('./pages/returns/return-list.component').then(
        (m) => m.ReturnListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'returns/new',
    loadComponent: () =>
      import('./pages/returns/return-form.component').then(
        (m) => m.ReturnFormComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'parts',
    loadComponent: () =>
      import('./pages/parts/parts-list.component').then(
        (m) => m.PartsListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'expenses',
    loadComponent: () =>
      import('./pages/expenses/expense-list.component').then(
        (m) => m.ExpenseListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'invoices',
    loadComponent: () =>
      import('./pages/invoices/invoice-list.component').then(
        (m) => m.InvoiceListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'statistics',
    loadComponent: () =>
      import('./pages/statistics/statistics.component').then(
        (m) => m.StatisticsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component').then(
        (m) => m.SettingsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'archive',
    loadComponent: () =>
      import('./pages/archive/archive.component').then(
        (m) => m.ArchiveComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'neue-fahrraeder',
    loadComponent: () =>
      import('./pages/neue-fahrraeder/neue-fahrrad-list.component').then(
        (m) => m.NeueFahrradListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'neue-fahrraeder/new',
    loadComponent: () =>
      import('./pages/neue-fahrraeder/neue-fahrrad-form.component').then(
        (m) => m.NeueFahrradFormComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'neue-fahrraeder/edit/:id',
    loadComponent: () =>
      import('./pages/neue-fahrraeder/neue-fahrrad-form.component').then(
        (m) => m.NeueFahrradFormComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'homepage-accessories',
    loadComponent: () =>
      import('./pages/homepage-accessories/homepage-accessory-list.component').then(
        (m) => m.HomepageAccessoryListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'homepage-accessories/new',
    loadComponent: () =>
      import('./pages/homepage-accessories/homepage-accessory-form.component').then(
        (m) => m.HomepageAccessoryFormComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'homepage-accessories/edit/:id',
    loadComponent: () =>
      import('./pages/homepage-accessories/homepage-accessory-form.component').then(
        (m) => m.HomepageAccessoryFormComponent,
      ),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
