import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of filteredBicycles">
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
              <td class="actions">
                <a
                  [routerLink]="['/bicycles', b.id]"
                  class="btn btn-sm btn-outline"
                  >Details</a
                >
                <button
                  *ngIf="b.status === 'Available'"
                  class="btn btn-sm btn-primary"
                  [routerLink]="['/sales/new']"
                  [queryParams]="{ bicycleId: b.id }"
                >
                  Verkaufen
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  (click)="deleteBicycle(b)"
                >
                  ×
                </button>
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
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.95rem;
      }
      .filter-select {
        padding: 10px 14px;
        border: 1px solid #ddd;
        border-radius: 6px;
      }
      .table-container {
        background: #fff;
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
        border-bottom: 2px solid #eee;
        font-size: 0.85rem;
        color: #555;
      }
      td {
        padding: 10px 8px;
        border-bottom: 1px solid #f0f0f0;
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
      .actions {
        display: flex;
        gap: 6px;
      }
      .empty {
        text-align: center;
        color: #999;
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

  constructor(private bicycleService: BicycleService) {}

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

  deleteBicycle(b: Bicycle) {
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
