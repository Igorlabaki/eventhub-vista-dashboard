import { create } from 'zustand';
import { 
  Person, 
  CreatePersonDTO, 
  UpdatePersonDTO,
  ListPersonParams
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
  fetchPersons: (params: ListPersonParams) => Promise<void>;
  fetchPersonById: (personId: string) => Promise<void>;
  createPerson: (data: CreatePersonDTO) => Promise<BackendResponse<Person>>;
  createManyPersons: (data: CreatePersonDTO[]) => Promise<BackendResponse<Person>>;
  updatePerson: (data: UpdatePersonDTO) => Promise<BackendResponse<Person>>;
  deletePerson: (id: string) => Promise<BackendResponse<void>>;
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
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar as pessoas.",
        persons: [] 
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPersonById: async (personId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await personService.getPersonById(personId);
      set({ currentPerson: response.data });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível carregar a pessoa.",
        currentPerson: null 
      });
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
      return {
        success: true,
        message: "Pessoa criada com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar a pessoa.",
        isLoading: false 
      });
      throw err;
    }
  },

  createManyPersons: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await personService.createManyPersons(data);
      set((state) => ({ 
        persons: [...state.persons, response.data],
        isLoading: false 
      }));
      return {
        success: true,
        message: "Pessoas criadas com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível criar as pessoas.",
        isLoading: false 
      });
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
      return {
        success: true,
        message: "Pessoa atualizada com sucesso",
        data: response.data
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível atualizar a pessoa.",
        isLoading: false 
      });
      throw err;
    }
  },

  deletePerson: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await personService.deletePerson(id);
      set((state) => ({
        persons: state.persons.filter((p) => p.id !== id),
        currentPerson: state.currentPerson && state.currentPerson.id === id ? null : state.currentPerson,
        isLoading: false
      }));
      return {
        success: true,
        message: "Pessoa excluída com sucesso",
        data: undefined
      };
    } catch (err: unknown) {
      const error = err as ApiError;
      set({ 
        error: error?.response?.data?.message || "Não foi possível excluir a pessoa.",
        isLoading: false 
      });
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