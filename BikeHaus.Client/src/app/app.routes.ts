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
    path: 'returns/edit/:id',
    loadComponent: () =>
      import('./pages/returns/return-form.component').then(
        (m) => m.ReturnFormComponent,
      ),
    canActivate: [authGuard],
  },
  // Reservierungen. Die Komponenten existierten schon, waren aber nie
  // verdrahtet — ohne diese Routen war der ganze Bereich in der App nicht
  // erreichbar. Die Pfade entsprechen den routerLinks in den Komponenten
  // (/reservations, /reservations/new, /reservations/:id,
  // /reservations/:id/convert).
  {
    path: 'reservations',
    loadComponent: () =>
      import('./pages/reservations/reservation-list.component').then(
        (m) => m.ReservationListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'reservations/new',
    loadComponent: () =>
      import('./pages/reservations/reservation-form.component').then(
        (m) => m.ReservationFormComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'reservations/:id/convert',
    loadComponent: () =>
      import('./pages/reservations/reservation-convert.component').then(
        (m) => m.ReservationConvertComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'reservations/:id',
    loadComponent: () =>
      import('./pages/reservations/reservation-form.component').then(
        (m) => m.ReservationFormComponent,
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
    path: 'export',
    loadComponent: () =>
      import('./pages/export/export.component').then((m) => m.ExportComponent),
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
    path: 'rental-statistics',
    loadComponent: () =>
      import('./pages/rental-statistics/rental-statistics.component').then(
        (m) => m.RentalStatisticsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'email-kampagne',
    loadComponent: () =>
      import('./pages/email-campaign/email-campaign.component').then(
        (m) => m.EmailCampaignComponent,
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
    path: 'e-bikes',
    loadComponent: () =>
      import('./pages/e-bikes/e-bike-list.component').then(
        (m) => m.EBikeListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'e-bikes/new',
    loadComponent: () =>
      import('./pages/e-bikes/e-bike-form.component').then(
        (m) => m.EBikeFormComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'e-bikes/edit/:id',
    loadComponent: () =>
      import('./pages/e-bikes/e-bike-form.component').then(
        (m) => m.EBikeFormComponent,
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
  {
    path: 'mietfahrraeder',
    loadComponent: () =>
      import('./pages/mietfahrraeder/mietfahrrad-list.component').then(
        (m) => m.MietfahrradListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'mietfahrraeder/new',
    loadComponent: () =>
      import('./pages/mietfahrraeder/mietfahrrad-form.component').then(
        (m) => m.MietfahrradFormComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'mietfahrraeder/edit/:id',
    loadComponent: () =>
      import('./pages/mietfahrraeder/mietfahrrad-form.component').then(
        (m) => m.MietfahrradFormComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'rental-availability',
    loadComponent: () =>
      import(
        './pages/rental-availability/rental-availability.component'
      ).then((m) => m.RentalAvailabilityComponent),
    canActivate: [authGuard],
  },
  {
    path: 'rentals',
    loadComponent: () =>
      import('./pages/rentals/rental-list.component').then(
        (m) => m.RentalListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'rentals/new',
    loadComponent: () =>
      import('./pages/rentals/rental-form.component').then(
        (m) => m.RentalFormComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'rentals/edit/:id',
    loadComponent: () =>
      import('./pages/rentals/rental-form.component').then(
        (m) => m.RentalFormComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'rentals/:id',
    loadComponent: () =>
      import('./pages/rentals/rental-detail.component').then(
        (m) => m.RentalDetailComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'bicycle-calendar',
    loadComponent: () =>
      import('./pages/bicycle-calendar/bicycle-calendar.component').then(
        (m) => m.BicycleCalendarComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'rental-bookings',
    loadComponent: () =>
      import('./pages/rental-bookings/rental-booking-list.component').then(
        (m) => m.RentalBookingListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'rental-bookings/new',
    loadComponent: () =>
      import('./pages/rental-bookings/rental-booking-form.component').then(
        (m) => m.RentalBookingFormComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'rental-bookings/:id/umwandeln',
    loadComponent: () =>
      import('./pages/rental-bookings/rental-booking-umwandeln.component').then(
        (m) => m.RentalBookingUmwandelnComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'rental-bookings/:id',
    loadComponent: () =>
      import('./pages/rental-bookings/rental-booking-detail.component').then(
        (m) => m.RentalBookingDetailComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'rental-accessories',
    loadComponent: () =>
      import('./pages/rental-accessories/rental-accessory-list.component').then(
        (m) => m.RentalAccessoryListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'renovation-costs',
    loadComponent: () =>
      import('./pages/renovation-costs/renovation-cost-list.component').then(
        (m) => m.RenovationCostListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'rental-reviews',
    loadComponent: () =>
      import('./pages/rental-reviews/rental-review-list.component').then(
        (m) => m.RentalReviewListComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'whatsapp',
    loadComponent: () =>
      import('./pages/whatsapp/whatsapp.component').then(
        (m) => m.WhatsappComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'ai-email',
    loadComponent: () =>
      import('./pages/ai-email-assistant/ai-email-assistant.component').then(
        (m) => m.AiEmailAssistantComponent,
      ),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
