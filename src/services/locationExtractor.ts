/**
 * Extract locations from article content
 * Falls back to company HQ locations if no place mentioned
 */

// Known company HQ locations (expand as needed)
const COMPANY_LOCATIONS: Record<string, { name: string; lat: number; lng: number }> = {
  // AI & Tech Companies
  openai: { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
  google: { name: 'Mountain View, CA', lat: 37.3882, lng: -122.0724 },
  anthropic: { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
  meta: { name: 'Menlo Park, CA', lat: 37.4847, lng: -122.148 },
  microsoft: { name: 'Redmond, WA', lat: 47.6739, lng: -122.121 },
  apple: { name: 'Cupertino, CA', lat: 37.3317, lng: -122.0311 },
  amazon: { name: 'Seattle, WA', lat: 47.6205, lng: -122.3493 },
  nvidia: { name: 'Santa Clara, CA', lat: 37.377, lng: -121.9723 },
  tesla: { name: 'Palo Alto, CA', lat: 37.4847, lng: -122.148 },
  ibm: { name: 'Armonk, NY', lat: 41.115, lng: -73.7267 },

  // Asian Tech
  alibaba: { name: 'Hangzhou, China', lat: 30.274, lng: 120.1551 },
  tencent: { name: 'Shenzhen, China', lat: 22.5431, lng: 114.0579 },
  baidu: { name: 'Beijing, China', lat: 39.9042, lng: 116.4074 },
  huawei: { name: 'Shenzhen, China', lat: 22.5431, lng: 114.0579 },
  bytedance: { name: 'Beijing, China', lat: 39.9042, lng: 116.4074 },
  sony: { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  toyota: { name: 'Toyota, Japan', lat: 35.0828, lng: 137.1686 },
  samsung: { name: 'Seoul, South Korea', lat: 37.5665, lng: 126.978 },

  // Universities
  mit: { name: 'Cambridge, MA', lat: 42.3601, lng: -71.0589 },
  stanford: { name: 'Stanford, CA', lat: 37.4275, lng: -122.1697 },
  berkeley: { name: 'Berkeley, CA', lat: 37.8722, lng: -122.2597 },
  oxford: { name: 'Oxford, UK', lat: 51.7520, lng: -1.2577 },
  cambridge: { name: 'Cambridge, UK', lat: 52.2053, lng: 0.1218 },
};

// US States/Cities
const US_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'mountain view': { lat: 37.3882, lng: -122.0724 },
  'palo alto': { lat: 37.4847, lng: -122.148 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'seattle': { lat: 47.6205, lng: -122.3493 },
  'new york': { lat: 40.7128, lng: -74.006 },
  'boston': { lat: 42.3601, lng: -71.0589 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'austin': { lat: 30.2672, lng: -97.7431 },
  'california': { lat: 36.7783, lng: -119.4179 },
  'texas': { lat: 31.9686, lng: -99.9018 },
};

// Global cities
const GLOBAL_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'beijing': { lat: 39.9042, lng: 116.4074 },
  'shanghai': { lat: 31.2304, lng: 121.4737 },
  'shenzhen': { lat: 22.5431, lng: 114.0579 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'seoul': { lat: 37.5665, lng: 126.978 },
  'hong kong': { lat: 22.3193, lng: 114.1694 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'berlin': { lat: 52.52, lng: 13.405 },
  'toronto': { lat: 43.6629, lng: -79.3957 },
  'vancouver': { lat: 49.2827, lng: -123.1207 },
  'mumbai': { lat: 19.076, lng: 72.8777 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
};

export interface Location {
  name: string;
  lat: number;
  lng: number;
  source: 'content' | 'company' | 'fallback';
}

export class LocationExtractor {
  /**
   * Extract location from article content
   */
  extract(title: string, description: string): Location | null {
    const text = `${title} ${description}`.toLowerCase();

    // Try to find company mentions and get their locations
    for (const [company, location] of Object.entries(COMPANY_LOCATIONS)) {
      if (text.includes(company)) {
        return { ...location, source: 'company' };
      }
    }

    // Try to find specific city mentions
    for (const [city, coords] of Object.entries(GLOBAL_LOCATIONS)) {
      if (text.includes(city)) {
        return { name: city, ...coords, source: 'content' };
      }
    }

    for (const [city, coords] of Object.entries(US_LOCATIONS)) {
      if (text.includes(city)) {
        return { name: city, ...coords, source: 'content' };
      }
    }

    // No location found
    return null;
  }

  /**
   * Get location by company name
   */
  getCompanyLocation(companyName: string): Location | null {
    const company = companyName.toLowerCase();
    const loc = COMPANY_LOCATIONS[company];
    if (loc) {
      return { ...loc, source: 'company' };
    }
    return null;
  }
}

export const locationExtractor = new LocationExtractor();
