import { Venue } from "@/components/ui/venue-list";

export interface Text {
  id: string;
  area: string;
  title?: string;
  position: number;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  venueId: string;
  venue: Venue;
}

export interface CreateTextDTO {
  area: string;
  text: string;
  venueId: string;
  position: number;
  title?: string;
}

export interface CreateTextOrganizationDTO {
  area: string;
  text: string;
  organizationId: string;
  position: number;
  title?: string;
}

export interface UpdateTextDTO {
  textId: string;
  venueId: string;
  data: {
    area?: string;
    title?: string;
    position?: number;
    text?: string;
  };
}
export interface UpdateTextOrganizationDTO {
  textId: string;
  organziationId: string;
  data: {
    area?: string;
    title?: string;
    position?: number;
    text?: string;
  };
}


export interface ListTextParams {
  venueId: string;
  area?: string;
}
export interface ListTextOrganizationParams {
  organizationId: string;
  area?: string;
}
export interface TextByIdResponse {
  success: true;
  message: string;
  data: Text;
  count: number;
  type: string;
}

export interface TextListResponse {
  success: true;
  message: string;
  data: {
    textList: Text[];
  };
  count: number;
  type: string;
}

export interface TextCreateResponse {
  success: true;
  message: string;
  data: Text;
  count: number;
  type: string;
}

export interface TextDeleteResponse {
  success: true;
  message: string;
  data: Text;
  count: number;
  type: string;
}

export interface TextUpdateResponse {
  success: true;
  message: string;
  data: Text;
  count: number;
  type: string;
} 