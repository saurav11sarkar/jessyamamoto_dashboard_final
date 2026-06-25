export interface CountryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: Meta;
  data: Country[];
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
}

export interface City {
  cityName: string;
  neighborhoods: string[];
}

export interface Country {
  _id: string;
  countryName?: string;

  // NEW STRUCTURE
  cities?: City[];

  // OLD STRUCTURE (Backward Compatibility)
  cityName?: string[];
  neighborhoods?: string[];

  image?: string;

  createdAt: string;
  updatedAt: string;

  __v: number;
}