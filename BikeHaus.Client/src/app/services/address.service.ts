import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface AddressSuggestion {
  displayName: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  stadt: string;
  land: string;
}

interface NominatimResult {
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AddressService {
  // Using Nominatim (OpenStreetMap) - free, no API key required
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  searchAddress(query: string): Observable<AddressSuggestion[]> {
    if (!query || query.length < 3) {
      return of([]);
    }

    // Focus search on Germany/Freiburg area
    const params = {
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '8',
      countrycodes: 'de', // Germany only
      viewbox: '7.6,48.1,8.1,47.8', // Freiburg area bounding box
      bounded: '0', // Allow results outside viewbox but prefer inside
    };

    return this.http.get<NominatimResult[]>(this.nominatimUrl, { params }).pipe(
      map((results) =>
        results
          .filter((r) => r.address?.road) // Only results with a street
          .map((r) => this.mapToSuggestion(r)),
      ),
      catchError(() => of([])),
    );
  }

  private mapToSuggestion(result: NominatimResult): AddressSuggestion {
    const addr = result.address;
    const stadt =
      addr.city || addr.town || addr.village || addr.municipality || '';

    return {
      displayName: result.display_name,
      strasse: addr.road || '',
      hausnummer: addr.house_number || '',
      plz: addr.postcode || '',
      stadt: stadt,
      land: addr.country || 'Deutschland',
    };
  }
}
