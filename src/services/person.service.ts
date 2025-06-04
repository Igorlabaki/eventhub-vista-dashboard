import { api } from '@/lib/axios';
import { 
  CreatePersonDTO,
  UpdatePersonDTO,
  ListPersonParams,
  PersonListResponse,
  PersonByIdResponse,
  PersonUpdateResponse,
  PersonCreateResponse,
  PersonDeleteResponse
} from '@/types/person';

export const personService = {
  createPerson: async (data: CreatePersonDTO) => {
    const response = await api.post<PersonCreateResponse>('/person/create', data);
    return response.data;
  },

  createManyPersons: async (data: CreatePersonDTO[]) => {
    const response = await api.post<PersonCreateResponse>('/person/createMany', data);
    return response.data;
  },

  getPersonById: async (personId: string) => {
    const response = await api.get<PersonByIdResponse>(`/person/getById/${personId}`);
    return response.data;
  },

  updatePerson: async (data: UpdatePersonDTO) => {
    const response = await api.put<PersonUpdateResponse>('/person/update', data);
    return response.data;
  },

  listPersons: async (params: ListPersonParams) => {
    const queryParams = new URLSearchParams();
    if (params.proposalId) queryParams.append('proposalId', params.proposalId);
    if (params.name) queryParams.append('name', params.name);
    if (params.type) queryParams.append('type', params.type);

    const response = await api.get<PersonListResponse>(`/person/list?${queryParams.toString()}`);
    return response.data;
  },

  deletePerson: async (personId: string) => {
    const response = await api.delete<PersonDeleteResponse>(`/person/delete/${personId}`);
    return response.data;
  }
}; 