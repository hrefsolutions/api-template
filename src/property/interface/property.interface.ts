import { CurrencyType, Extras, PropertyType, Ubication } from "../../shared/interfaces";

export interface PropertyDTO {
  _id?: string;
  name: string;
  price: number;
  address: string;
  description: string;
  propertyType: PropertyType;
  extras: Extras;
  currency: CurrencyType;
  coverImg: string;
  img: string[];
  coordinates: number[];
  ubication: Ubication
}

export interface UpdatePropertyDTO extends Partial<PropertyDTO> {}