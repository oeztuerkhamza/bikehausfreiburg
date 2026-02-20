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

    // Search across Germany
    const params = {
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '8',
      countrycodes: 'de', // Germany only
    };

    return this.http.get<NominatimResult[]>(this.nominatimUrl, { params }).pipe(
      map((results) => {
        const suggestions = results
          .filter((r) => r.address?.road) // Only results with a street
          .map((r) => this.mapToSuggestion(r));

        // Remove similar addresses - keep only one per street + city
        const seen = new Set<string>();
        return suggestions.filter((s) => {
          const key = `${s.strasse}|${s.stadt}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }),
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
