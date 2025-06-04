import { Venue } from "./venue";

export type SeasonalFeeType = "SURCHARGE" | "DISCOUNT";

export interface SeasonalFee {
  id: string;
  type: SeasonalFeeType;
  title: string;
  startDay?: string;
  endDay?: string;
  fee: number;
  venueId: string;
  affectedDays?: string;
  createdAt?: string;
  updatedAt?: string;
  venue?: Venue;
}

export interface CreateSeasonalFeeDTO {
  type: SeasonalFeeType;
  title: string;
  startDay?: string;
  endDay?: string;
  fee: number;
  venueId: string;
  affectedDays?: string;
}

export interface UpdateSeasonalFeeDTO {
  seasonalFeeId: string;
  venueId: string;
  data: {
    type: SeasonalFeeType;
    title: string;
    startDay?: string;
    endDay?: string;
    fee: number;
    affectedDays?: string;
  };
}

export interface SeasonalFeeByIdResponse {
  success: true;
  message: string;
  data: {
    seasonalFee: SeasonalFee;
  };
  count: number;
  type: string;
}

export interface SeasonalFeeListResponse {
  success: true;
  message: string;
  data: {
    seasonalfeeList: SeasonalFee[];
  };
  count: number;
  type: string;
}

export interface SeasonalFeeCreateResponse {
  success: true;
  message: string;
  data: SeasonalFee;
  count: number;
  type: string;
}

export interface SeasonalFeeDeleteResponse {
  success: true;
  message: string;
  data: SeasonalFee;
  count: number;
  type: string;
}

export interface SeasonalFeeUpdateResponse {
  success: true;
  message: string;
  data: SeasonalFee;
  count: number;
  type: string;
} 