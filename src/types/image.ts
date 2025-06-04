export interface Image {
  id: string;
  imageUrl: string;
  description?: string;
  position: number;
  createdAt?: Date;
  updatedAt?: Date;
  responsiveMode?: string;
  tag?: string;
  venueId: string;
}

export interface CreateImageDTO {
  venueId: string;
  imageUrl: string;
  description: string;
  tag?: string;
  position?: string;
  responsiveMode?: string;  
  file: File;
}

export interface UpdateImageDTO {
  imageId: string;
  venueId: string;
  imageUrl: string;
  description: string;
  tag?: string;
  position?: string;
  responsiveMode?: string;
  file: File;
}

export interface ListImageParams {
  venueId: string;
  responsiveMode?: string;
  description?: string;
}

export interface GetByTagImageParams {
  venueId: string;
  tag?: string;
  responsiveMode?: string;
}

export interface ImageByIdResponse {
  success: true;
  message: string;
  data: Image;
  count: number;
  type: string;
}

export interface ImageListResponse {
  success: true;
  message: string;
  data: {
    imageList: Image[];
  };
  count: number;
  type: string;
}

export interface ImageCreateResponse {
  success: true;
  message: string;
  data: Image;
  count: number;
  type: string;
}

export interface ImageDeleteResponse {
  success: true;
  message: string;
  data: Image;
  count: number;
  type: string;
}

export interface ImageUpdateResponse {
  success: true;
  message: string;
  data: Image;
  count: number;
  type: string;
} 