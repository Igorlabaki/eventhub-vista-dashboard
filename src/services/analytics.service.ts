import { api } from '@/lib/axios';
import { 
  ListAnalyticsParams,
  AnalyticsResponse
} from '@/types/analytics';

const VERCEL_API_URL = 'https://api.vercel.com/v1';
const VERCEL_PROJECT_ID = import.meta.env.VITE_VERCEL_PROJECT_ID;
const VERCEL_API_TOKEN = import.meta.env.VITE_VERCEL_API_TOKEN;

export const analyticsService = {
  getAnalytics: async (params: ListAnalyticsParams) => {
   
    try {
      // Obtém as métricas de visitas
      const visitsResponse = await fetch(
        `${VERCEL_API_URL}/insights/visits?projectId=${VERCEL_PROJECT_ID}&from=${params.startDate}&to=${params.endDate}`,
        {
          headers: {
            Authorization: `Bearer ${VERCEL_API_TOKEN}`,
          },
        }
      );

      if (!visitsResponse.ok) {
        const errorData = await visitsResponse.json();
       
        throw new Error(`Erro ao buscar visitas: ${errorData.message || visitsResponse.statusText}`);
      }

      const visitsData = await visitsResponse.json();
  

      // Obtém as métricas de SEO
      const seoResponse = await fetch(
        `${VERCEL_API_URL}/insights/performance?projectId=${VERCEL_PROJECT_ID}`,
        {
          headers: {
            Authorization: `Bearer ${VERCEL_API_TOKEN}`,
          },
        }
      );

      if (!seoResponse.ok) {
        const errorData = await seoResponse.json();
      
        throw new Error(`Erro ao buscar SEO: ${errorData.message || seoResponse.statusText}`);
      }

      const seoData = await seoResponse.json();
    

      // Formata os dados para o formato esperado pela aplicação
      const analyticsData = {
        id: params.venueId,
        venueId: params.venueId,
        totalVisits: visitsData.totalVisits || 0,
        monthlyVisits: visitsData.monthlyVisits || 0,
        indexedPages: seoData.indexedPages || 0,
        lastIndexed: new Date(seoData.lastIndexed || new Date()),
        seoScore: seoData.seoScore || 0,
        keywords: seoData.keywords || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        success: true,
        message: "Métricas carregadas com sucesso",
        data: analyticsData,
        count: 1,
        type: "analytics"
      };
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      throw error;
    }
  }
}; 