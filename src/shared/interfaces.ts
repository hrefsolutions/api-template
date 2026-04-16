import { HttpStatus } from "@nestjs/common";
import { JwtPayload } from "jsonwebtoken";

export interface BaseModel {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}


export interface Payment {
  paymentId: string;
  paymentStatus: boolean;
}

export interface Extras {
  bathroom: number;
  bedrooms: number;
  total_m2: number;
  cover_m2: number;
  garage: boolean;
  services: Services;
  capacity: number;
  pileta: boolean;
}

export interface Services {
  wifi: boolean;
  elevator: boolean;
  smartTV: boolean;
  airConditioning: boolean;
  bedLinen: boolean;
  hairDryer: boolean;
  security: boolean;
  laundry: boolean;
}

export type PropertyType = "casa" | "quinta" | "departamento" | "interno";

export type CurrencyType = "USD" | "ARS";

export interface Ubication {
  country?: string;
  state?: string;
}

export interface HttpErrorDTO {
  message: string | "Internal server error";
  statusCode: HttpStatus;
}

export type HttpResponse<T> = SuccessResponse<T> | ErrorResponse;

interface SuccessResponse<T> {
  data: T;
  httpStatus: HttpStatus;
}

interface ErrorResponse {
  message: string;
  httpStatus: HttpStatus;
}

export interface HttpRequest {
  [value: string]: any;
  user: JwtPayload;
}
