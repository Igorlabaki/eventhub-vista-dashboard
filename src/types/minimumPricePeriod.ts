export interface MinimumPricePeriod {
  id: string;
  title: string;
  startDay: string;
  endDay: string;
  price: number;
  venueId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMinimumPricePeriodDTO {
  venueId: string;
  title: string;
  startDay: string;
  endDay: string;
  price: number;
}

export interface UpdateMinimumPricePeriodDTO {
  id: string;
  title: string;
  startDay: string;
  endDay: string;
  price: number;
}

export interface MinimumPricePeriodListResponse {
  success: true;
  message: string;
  data: {
    minimumPricePeriodList: MinimumPricePeriod[];
  };
  count: number;
  type: string;
}

export interface MinimumPricePeriodMutationResponse {
  success: true;
  message: string;
  data: MinimumPricePeriod;
  count: number;
  type: string;
}
