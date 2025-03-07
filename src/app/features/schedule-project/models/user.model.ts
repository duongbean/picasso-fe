import { StreamState } from 'node:http2';

export interface GetListPhotographersResponse {
  id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  isActive: boolean;
}

export interface GetListCustomersResponse {
  id: string;
  email: string;
  name: string;
  gender: number;
  phoneNumber: string;
  numberOfAppoitment: number;

  /**
   *       "id": "bd269612-45c3-46ed-ad59-337b3a5395a6",
      "email": "customer1@example.com",
      "name": "John Doe",
      "gender": 0,
      "phoneNumber": "0123456789",
      "numberOfApm": 3
   */
}

export interface RequestCreateCustomer {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: number;
  email: string;
  wardId: number;
  detailAddress: string;
  phoneNumber: string;
}
