import { PropertyDTO } from "../../property/interface/property.interface";

interface PropertyForPaymentLink extends Partial<PropertyDTO> {}

export interface PaymentData {
  property: PropertyForPaymentLink;
  successUrl: string;
  failureUrl: string;
  autoReturn?: AutoReturn;
}
type AutoReturn = "all" | "approved";
