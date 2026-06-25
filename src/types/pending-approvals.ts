type Category = {
  _id: string;
  image: string;
  name: string;
  description: string;
  banner: string[];
  findCareUser: string[];
  findJobUser: string[];
  createdAt: string;
  updatedAt: string;
};

type Service = {
  _id: string;
  userId: string;
  categoryId: string;
  location: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  typeOfInterest: string;
  helpOfInterest: string;
  days: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Cleaner = {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  profileImage?: string;

  role: string;
  verified: boolean;
  isSubscription: boolean;

  category: Category[];
  service: Service[];

  location?: string;
  city?: string;
  countery?: string;

  status: string;
  userStatus: string;

  NIDNumber?: string;

  totalBooking: string[];
  completeBooking: string[];
  cencleBooking: string[];

  reviewRatting: string[];
  givenReviewRatting: string[];

  certifications: string[];
  language: string[];
  agegroup: string[];
  education: string[];
  canHelpWith: string[];
  professionalSkill: string[];
  perferences: string[];
  galary: string[];

  createdAt: string;
  updatedAt: string;
};

export type PendingApprovalsResponse = {
  statusCode: number;
  success: boolean;
  message: string;

  meta: {
    total: number;
    page: number;
    limit: number;
  };

  data: Cleaner[];
};