export interface CategoryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: Meta;
  data: Category[];
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
}

export interface Category {
  _id: string;
  name: string;
  image?: string; // optional because not all items have image
  findCareUser: string[];
  findJobUser: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}
