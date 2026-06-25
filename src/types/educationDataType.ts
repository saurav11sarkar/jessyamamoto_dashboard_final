export interface Education {
  _id: string;
  institutionName: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
}

export interface EducationResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: Meta;
  data: Education[];
}