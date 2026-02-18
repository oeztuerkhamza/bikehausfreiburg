import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BicycleService } from '../../services/bicycle.service';
import { Bicycle, BikeStatus } from '../../models/models';

@Component({
  selector: 'app-bicycle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Fahrräder</h1>
        <a routerLink="/purchases/new" class="btn btn-primary"
          >+ Neuer Ankauf</a
        >
      </div>

      <div class="filters">
        <input
          type="text"
          placeholder="Suche nach Marke, Modell, Rahmennummer..."
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
          class="search-input"
        />
        <select
          [(ngModel)]="statusFilter"
          (change)="applyFilter()"
          class="filter-select"
        >
          <option value="">Alle Status</option>
          <option value="Available">Verfügbar</option>
          <option value="Sold">Verkauft</option>
          <option value="Reserved">Reserviert</option>
        </select>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Marke</th>
              <th>Modell</th>
              <th>Rahmennummer</th>
              <th>Zustand</th>
              <th>Status</th>
              <th class="actions-col">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let b of filteredBicycles"
              class="clickable-row"
              (click)="toggleMenu($event, b)"
            >
              <td>{{ b.marke }}</td>
              <td>{{ b.modell }}</td>
              <td class="mono">{{ b.rahmennummer }}</td>
              <td>
                <span
                  class="badge"
                  [class]="'badge-' + b.zustand.toLowerCase()"
                >
                  {{ b.zustand }}
                </span>
              </td>
              <td>
                <span class="badge" [class]="'badge-' + b.status.toLowerCase()">
                  {{ statusLabel(b.status) }}
                </span>
              </td>
              <td class="actions-cell">
                <span class="action-icon">⋮</span>
                <!-- Popup Menu -->
                <div
                  *ngIf="activeMenuId === b.id"
                  class="popup-menu"
                  (click)="$event.stopPropagation()"
                >
                  <button class="popup-item" (click)="goToDetail(b)">
                    <span class="popup-icon">🔍</span>
                    Details
                  </button>
                  <button
                    *ngIf="b.status === 'Available'"
                    class="popup-item popup-item-primary"
                    (click)="goToSale(b)"
                  >
                    <span class="popup-icon">💰</span>
                    Verkaufen
                  </button>
                  <div class="popup-divider"></div>
                  <button
                    class="popup-item popup-item-danger"
                    (click)="deleteBicycle(b)"
                  >
                    <span class="popup-icon">🗑️</span>
                    Löschen
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p *ngIf="filteredBicycles.length === 0" class="empty">
          Keine Fahrräder gefunden
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 1200px;
        margin: 0 auto;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .filters {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }
      .search-input {
        flex: 1;
        min-width: 250px;
        padding: 10px 14px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 6px;
        font-size: 0.95rem;
        background: var(--input-bg, #fff);
        color: var(--text-color, #333);
      }
      .filter-select {
        padding: 10px 14px;
        border: 1px solid var(--border-color, #ddd);
        border-radius: 6px;
        background: var(--input-bg, #fff);
        color: var(--text-color, #333);
      }
      .table-container {
        background: var(--card-bg, #fff);
        border-radius: 10px;
        padding: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        overflow-x: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th {
        text-align: left;
        padding: 10px 8px;
        border-bottom: 2px solid var(--border-color, #eee);
        font-size: 0.85rem;
        color: var(--text-secondary, #555);
      }
      td {
        padding: 10px 8px;
        border-bottom: 1px solid var(--border-color, #f0f0f0);
      }
      .clickable-row {
        cursor: pointer;
        transition: background-color 0.15s ease;
      }
      .clickable-row:hover {
        background-color: var(--hover-bg, #f5f5f5);
      }
      .mono {
        font-family: monospace;
      }
      .badge {
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
      }
      .badge-available {
        background: #d4edda;
        color: #155724;
      }
      .badge-sold {
        background: #f8d7da;
        color: #721c24;
      }
      .badge-reserved {
        background: #fff3cd;
        color: #856404;
      }
      .badge-neu {
        background: #cce5ff;
        color: #004085;
      }
      .badge-gebraucht {
        background: #e2e3e5;
        color: #383d41;
      }
      .actions-col {
        width: 80px;
        text-align: center;
      }
      .actions-cell {
        position: relative;
        text-align: center;
      }
      .action-icon {
        font-size: 1.3rem;
        color: var(--text-secondary, #666);
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.15s ease;
      }
      .action-icon:hover {
        background-color: var(--hover-bg, #eee);
      }
      .popup-menu {
        position: absolute;
        top: 100%;
        right: 0;
        z-index: 1000;
        min-width: 160px;
        background: var(--card-bg, #fff);
        border: 1px solid var(--border-color, #ddd);
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        padding: 6px 0;
        animation: fadeIn 0.15s ease;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .popup-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 14px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 0.9rem;
        color: var(--text-color, #333);
        text-align: left;
        transition: background-color 0.15s ease;
      }
      .popup-item:hover {
        background-color: var(--hover-bg, #f5f5f5);
      }
      .popup-item-primary {
        color: var(--primary-color, #2e7d32);
      }
      .popup-item-primary:hover {
        background-color: rgba(46, 125, 50, 0.1);
      }
      .popup-item-danger {
        color: #dc3545;
      }
      .popup-item-danger:hover {
        background-color: rgba(220, 53, 69, 0.1);
      }
      .popup-icon {
        font-size: 1rem;
      }
      .popup-divider {
        height: 1px;
        background: var(--border-color, #eee);
        margin: 6px 0;
      }
      .empty {
        text-align: center;
        color: var(--text-secondary, #999);
        padding: 40px;
      }
    `,
  ],
})
export class BicycleListComponent implements OnInit {
  bicycles: Bicycle[] = [];
  filteredBicycles: Bicycle[] = [];
  searchTerm = '';
  statusFilter = '';
  activeMenuId: number | null = null;

  constructor(
    private bicycleService: BicycleService,
    private router: Router,
    private elementRef: ElementRef,
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close menu when clicking outside
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.activeMenuId = null;
    }
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.bicycleService.getAll().subscribe((data) => {
      this.bicycles = data;
      this.applyFilter();
    });
  }

  onSearch() {
    if (this.searchTerm.length >= 2) {
      this.bicycleService.search(this.searchTerm).subscribe((data) => {
        this.bicycles = data;
        this.applyFilter();
      });
    } else if (this.searchTerm.length === 0) {
      this.load();
    }
  }

  applyFilter() {
    this.filteredBicycles = this.statusFilter
      ? this.bicycles.filter((b) => b.status === this.statusFilter)
      : [...this.bicycles];
  }

  statusLabel(s: BikeStatus): string {
    const map: Record<string, string> = {
      Available: 'Verfügbar',
      Sold: 'Verkauft',
      Reserved: 'Reserviert',
    };
    return map[s] || s;
  }

  toggleMenu(event: MouseEvent, bicycle: Bicycle) {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === bicycle.id ? null : bicycle.id;
  }

  closeMenu() {
    this.activeMenuId = null;
  }

  goToDetail(b: Bicycle) {
    this.closeMenu();
    this.router.navigate(['/bicycles', b.id]);
  }

  goToSale(b: Bicycle) {
    this.closeMenu();
    this.router.navigate(['/sales/new'], { queryParams: { bicycleId: b.id } });
  }

  deleteBicycle(b: Bicycle) {
    this.closeMenu();
    if (confirm(`Fahrrad "${b.marke} ${b.modell}" wirklich löschen?`)) {
      this.bicycleService.delete(b.id).subscribe({
        next: () => this.load(),
        error: (err) => {
          const msg = err.error?.error || 'Fehler beim Löschen des Fahrrads.';
          alert(msg);
        },
      });
    }
  }
}
