import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import {
  AddressService,
  AddressSuggestion,
} from '../../services/address.service';

@Component({
  selector: 'app-address-autocomplete',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="autocomplete-container">
      <input
        type="text"
        [placeholder]="placeholder"
        [(ngModel)]="inputValue"
        (ngModelChange)="onInputChange($event)"
        (focus)="onFocus()"
        autocomplete="off"
      />
      <div
        class="suggestions"
        *ngIf="showSuggestions && suggestions.length > 0"
      >
        <div
          class="suggestion-item"
          *ngFor="let s of suggestions"
          (click)="selectSuggestion(s)"
        >
          <span class="main">{{ s.strasse }} {{ s.hausnummer }}</span>
          <span class="sub">{{ s.plz }} {{ s.stadt }}</span>
        </div>
      </div>
      <div class="loading" *ngIf="isLoading">
        <span>Suche...</span>
      </div>
    </div>
  `,
  styles: [
    `
      .autocomplete-container {
        position: relative;
        width: 100%;
      }
      input {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.95rem;
      }
      input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      .suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #fff;
        border: 1px solid #ddd;
        border-top: none;
        border-radius: 0 0 6px 6px;
        max-height: 250px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      .suggestion-item {
        padding: 10px 12px;
        cursor: pointer;
        border-bottom: 1px solid #f0f0f0;
        transition: background 0.15s;
      }
      .suggestion-item:last-child {
        border-bottom: none;
      }
      .suggestion-item:hover {
        background: #f8fafc;
      }
      .suggestion-item .main {
        display: block;
        font-weight: 500;
        color: #333;
      }
      .suggestion-item .sub {
        display: block;
        font-size: 0.85rem;
        color: #666;
        margin-top: 2px;
      }
      .loading {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #fff;
        padding: 10px;
        border: 1px solid #ddd;
        border-top: none;
        border-radius: 0 0 6px 6px;
        color: #666;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class AddressAutocompleteComponent implements OnDestroy {
  @Input() placeholder = 'Adresse eingeben...';
  @Input() initialValue = '';
  @Output() addressSelected = new EventEmitter<AddressSuggestion>();

  inputValue = '';
  suggestions: AddressSuggestion[] = [];
  showSuggestions = false;
  isLoading = false;

  private searchSubject = new Subject<string>();
  private subscription: Subscription;

  constructor(
    private addressService: AddressService,
    private elementRef: ElementRef,
  ) {
    this.subscription = this.searchSubject
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((query) => {
          if (query.length < 3) {
            this.suggestions = [];
            this.isLoading = false;
            return [];
          }
          this.isLoading = true;
          return this.addressService.searchAddress(query);
        }),
      )
      .subscribe((results) => {
        this.suggestions = results;
        this.isLoading = false;
        this.showSuggestions = results.length > 0;
      });
  }

  ngOnInit() {
    if (this.initialValue) {
      this.inputValue = this.initialValue;
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  onInputChange(value: string) {
    this.searchSubject.next(value);
  }

  onFocus() {
    if (this.suggestions.length > 0) {
      this.showSuggestions = true;
    }
  }

  selectSuggestion(suggestion: AddressSuggestion) {
    this.inputValue = `${suggestion.strasse} ${suggestion.hausnummer}`.trim();
    this.showSuggestions = false;
    this.suggestions = [];
    this.addressSelected.emit(suggestion);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showSuggestions = false;
    }
  }
}
