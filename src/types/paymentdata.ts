// ==============================
// Payment API Types
// ==============================

export interface PaymentResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: Meta;
  data: Payment[];
}

// ==============================
// Meta
// ==============================

export interface Meta {
  total: number;
  page: number;
  limit: number;
}

// ==============================
// Payment
// ==============================

export type PaymentStatus = "pending" | "completed" | string;
export type PaymentType = "subscription" | "booking" | string;
export type UserType = "findJob" | "findCare" | string;

export interface Payment {
  _id: string;
  user: User | null;
  subscription?: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentType: PaymentType;
  userType: UserType;
  booking?: string;
  adminFree?: number;
  serviceProviderFree?: number;
  caregiverRate?: number;
  category?: string | null;
  service?: Service | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// ==============================
// User
// ==============================

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  verified: boolean;
  isSubscription: boolean;
  category: string[];
  service: string[];
  location?: string;
  status: string;
  totalBooking: string[];
  completeBooking: string[];
  cencleBooking: string[];
  reviewRatting: string[];
  givenReviewRatting: string[];
  subscription?: string;
  subscriptionExpiry?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// ==============================
// Service (for booking payments)
// ==============================

export interface Service {
  _id: string;
  userId: string;
  categoryId: string | null;
  location: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  hourRate: number;
  status: string;
  days: {
    day: string[];
    time: string[];
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}
