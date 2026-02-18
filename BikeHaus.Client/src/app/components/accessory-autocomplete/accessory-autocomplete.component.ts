import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccessoryCatalogService } from '../../services/accessory-catalog.service';
import { AccessoryCatalogList } from '../../models/models';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-accessory-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="autocomplete-container">
      <input
        type="text"
        [(ngModel)]="searchText"
        (ngModelChange)="onSearchChange($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
        [placeholder]="placeholder"
        class="autocomplete-input"
      />
      <div
        class="suggestions"
        *ngIf="showSuggestions && suggestions.length > 0"
      >
        <div
          class="suggestion-item"
          *ngFor="let item of suggestions"
          (mousedown)="selectItem(item)"
        >
          <span class="item-name">{{ item.bezeichnung }}</span>
          <span class="item-price"
            >{{ item.standardpreis | number: '1.2-2' }} €</span
          >
          <span class="item-category" *ngIf="item.kategorie">{{
            item.kategorie
          }}</span>
        </div>
      </div>
      <div
        class="suggestions"
        *ngIf="
          showSuggestions && suggestions.length === 0 && searchText.length >= 2
        "
      >
        <div class="no-results">Keine Treffer</div>
      </div>
    </div>
  `,
  styles: [
    `
      .autocomplete-container {
        position: relative;
        width: 100%;
      }
      .autocomplete-input {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.95rem;
      }
      .suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 100;
        max-height: 200px;
        overflow-y: auto;
        margin-top: 4px;
      }
      .suggestion-item {
        padding: 10px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        border-bottom: 1px solid #eee;
      }
      .suggestion-item:last-child {
        border-bottom: none;
      }
      .suggestion-item:hover {
        background: #f5f7fa;
      }
      .item-name {
        flex: 1;
        font-weight: 500;
      }
      .item-price {
        color: #4361ee;
        font-weight: 500;
      }
      .item-category {
        background: #e9ecef;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        color: #666;
      }
      .no-results {
        padding: 12px;
        color: #999;
        text-align: center;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class AccessoryAutocompleteComponent {
  @Input() placeholder = 'Zubehör suchen...';
  @Output() itemSelected = new EventEmitter<AccessoryCatalogList>();

  searchText = '';
  suggestions: AccessoryCatalogList[] = [];
  showSuggestions = false;

  private searchSubject = new Subject<string>();

  constructor(private service: AccessoryCatalogService) {
    this.searchSubject
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((query) =>
          query.length >= 2 ? this.service.search(query) : Promise.resolve([]),
        ),
      )
      .subscribe((results) => {
        this.suggestions = results;
      });
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  onFocus() {
    this.showSuggestions = true;
    if (this.searchText.length >= 2) {
      this.searchSubject.next(this.searchText);
    }
  }

  onBlur() {
    // Small delay to allow click on suggestions
    setTimeout(() => {
      this.showSuggestions = false;
    }, 150);
  }

  selectItem(item: AccessoryCatalogList) {
    this.itemSelected.emit(item);
    this.searchText = '';
    this.suggestions = [];
    this.showSuggestions = false;
  }
}
