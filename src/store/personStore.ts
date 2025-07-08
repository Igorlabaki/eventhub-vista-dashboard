import { create } from 'zustand';
import { 
  Person, 
  CreatePersonDTO, 
  UpdatePersonDTO,
  ListPersonParams,
  PersonListResponse,
  PersonByIdResponse,
  PersonDeleteResponse,
  PersonUpdateResponse,
  PersonCreateResponse
} from '@/types/person';
import { personService } from '@/services/person.service';
import { BackendResponse } from '@/lib/error-handler';

interface PersonStore {
  persons: Person[];
  currentPerson: Person | null;
  isLoading: boolean;
  error: string | null;
  setPersons: (persons: Person[]) => void;
  setCurrentPerson: (person: Person | null) => void;
  fetchPersons: (params: ListPersonParams) => Promise<PersonListResponse>;
  fetchPersonById: (personId: string) => Promise<PersonByIdResponse>;
  createPerson: (data: CreatePersonDTO) => Promise<PersonCreateResponse>;
  createManyPersons: (data: CreatePersonDTO[]) => Promise<PersonListResponse>;
  updatePerson: (data: UpdatePersonDTO) => Promise<PersonUpdateResponse>;
  deletePerson: (id: string) => Promise<PersonDeleteResponse>;
  addPerson: (person: Person) => void;
  updatePersonInStore: (person: Person) => void;
  removePerson: (id: string) => void;
  clearError: () => void;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const usePersonStore = create<PersonStore>((set, get) => ({
  persons: [],
  currentPerson: null,
  isLoading: false,
  error: null,
  setPersons: (persons) => set({ persons }),
  setCurrentPerson: (person) => set({ currentPerson: person }),
  
  fetchPersons: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await personService.listPersons(params);
      set({ persons: response.data.personList });
      return response;
    } catch (err: unknown) {
      set({ persons: [] });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPersonById: async (personId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await personService.getPersonById(personId);
      set({ currentPerson: response.data });
      return response;
    } catch (err: unknown) {
      set({ currentPerson: null });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  createPerson: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await personService.createPerson(data);
      set((state) => ({ 
        persons: [...state.persons, response.data],
        isLoading: false 
      }));
      return response;
    } catch (err: unknown) {
      set({ isLoading: false });
      throw err;
    }
  },

  createManyPersons: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await personService.createManyPersons(data);
      set((state) => ({ 
        persons: [...state.persons, ...response.data.personList],
        isLoading: false 
      }));
      return response;
    } catch (err: unknown) {
      set({ isLoading: false });
      throw err;
    }
  },

  updatePerson: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await personService.updatePerson(data);
      set((state) => ({
        persons: state.persons.map((p) => p.id === response.data.id ? response.data : p),
        currentPerson: state.currentPerson && state.currentPerson.id === response.data.id ? response.data : state.currentPerson,
        isLoading: false
      }));
      return response;
    } catch (err: unknown) {
      set({ isLoading: false });
      throw err;
    }
  },

  deletePerson: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await personService.deletePerson(id);
      set((state) => ({
        persons: state.persons.filter((p) => p.id !== id),
        currentPerson: state.currentPerson && state.currentPerson.id === id ? null : state.currentPerson,
        isLoading: false
      }));
      return response;
    } catch (err: unknown) {
      set({ isLoading: false });
      throw err;
    }
  },

  addPerson: (person) => set((state) => ({ persons: [...state.persons, person] })),
  
  updatePersonInStore: (person) => set((state) => ({
    persons: state.persons.map((p) => p.id === person.id ? person : p),
    currentPerson: state.currentPerson && state.currentPerson.id === person.id ? person : state.currentPerson,
  })),
  
  removePerson: (id) => set((state) => ({
    persons: state.persons.filter((p) => p.id !== id),
    currentPerson: state.currentPerson && state.currentPerson.id === id ? null : state.currentPerson,
  })),
  
  clearError: () => set({ error: null }),
})); 