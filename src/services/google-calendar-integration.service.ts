import { api } from "@/lib/axios";

export interface GoogleCalendarAutoStatusResponse {
  connected: boolean;
  needsGooglePermission?: boolean;
  calendarId?: string;
}

export interface GoogleCalendarListResponse {
  calendars: { id: string; summary: string; primary: boolean }[];
}

export const googleCalendarIntegrationService = {
  getAutoStatus: async (
    organizationId: string
  ): Promise<GoogleCalendarAutoStatusResponse> => {
    const response = await api.get<GoogleCalendarAutoStatusResponse>(
      `/integrations/google-calendar/auto-status`,
      { params: { organizationId } }
    );
    return response.data;
  },

  getConnectUrl: async (organizationId: string): Promise<string> => {
    const response = await api.get<{ redirectUrl: string }>(
      `/integrations/google-calendar/connect-url`,
      { params: { organizationId } }
    );
    return response.data.redirectUrl;
  },

  getCalendars: async (
    organizationId: string
  ): Promise<GoogleCalendarListResponse["calendars"]> => {
    const response = await api.get<GoogleCalendarListResponse>(
      `/integrations/google-calendar/calendars`,
      { params: { organizationId } }
    );
    return response.data.calendars;
  },

  selectCalendar: async (
    organizationId: string,
    calendarId: string
  ): Promise<void> => {
    await api.post("/integrations/google-calendar/select-calendar", {
      organizationId,
      calendarId,
    });
  },

  disconnect: async (organizationId: string): Promise<void> => {
    await api.post("/integrations/google-calendar/disconnect", {
      organizationId,
    });
  },
};
