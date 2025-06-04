export interface WebsiteAnalytics {
  id: string;
  venueId: string;
  totalVisits: number;
  monthlyVisits: number;
  indexedPages: number;
  lastIndexed: Date;
  seoScore: number;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsResponse {
  success: true;
  message: string;
  data: WebsiteAnalytics;
  count: number;
  type: string;
}

export interface ListAnalyticsParams {
  venueId: string;
  startDate?: string;
  endDate?: string;
} 