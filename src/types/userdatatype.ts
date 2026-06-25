// types.ts

export interface Category {
  _id: string;
  image?: string;
  name: string;
  banner?: string[];
  findCareUser?: string[];
  findJobUser?: string[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface DaySchedule {
  day: string;
  startTime: string;
  endTime: string;
  _id: string;
}

export interface Service {
  _id: string;
  userId: string;
  categoryId: string;
  location: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  hourRate?: number;
  status: string;
  zip?: string;
  lat?: number;
  lng?: number;
  days: DaySchedule[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;

  verified: boolean;
  isSubscription: boolean;

  category: Category[];
  service: Service[];

  status: string;
  userStatus?: string;

  createdAt: string;
  updatedAt: string;

  subscription?: string;
  subscriptionExpiry?: string;

  profileImage?: string[];

  bio?: string;
  phone?: string;
  gender?: string;

  totalBooking?: string[];
  completeBooking?: string[];
  cencleBooking?: string[];

  location?: string;
  city?: string;
  countery?: string;

  zip?: string;
  lat?: number;
  lng?: number;

  NIDNumber?: string;
}

export interface Meta {
  total: number;
  page: number;
  limit: number;
}

export interface UserResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: Meta;
  data: User[];
}