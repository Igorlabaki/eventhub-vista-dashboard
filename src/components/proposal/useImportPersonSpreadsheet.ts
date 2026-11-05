import { useRef, useState } from "react";
import { CreatePersonDTO, PersonType } from "@/types/person";
import { useToast } from "@/hooks/use-toast";
import { handleBackendError } from "@/lib/error-handler";
import { usePersonStore } from "@/store/personStore";
import {
  normalizePersonName,
  peopleToSave,
  spreadsheetFailureMessage,
  spreadsheetNothingSavedMessage,
  spreadsheetSavedMessage,
} from "@/lib/person-spreadsheet";
import { readPersonSpreadsheet } from "@/lib/read-person-spreadsheet";

type ListedPerson = CreatePersonDTO & { id?: string };

export function usePersonSpreadsheetImport(options: {
  proposalId: string | undefined;
  type: PersonType;
  list: ListedPerson[];
  setList: (update: (current: ListedPerson[]) => ListedPerson[]) => void;
  remainingSlots: number | null;
  busy: boolean;
}) {
  const [importing, setImporting] = useState(false);
  const importingRef = useRef(false);
  const listRef = useRef(options.list);
  listRef.current = options.list;
  const { toast } = useToast();
  const createManyPersons = usePersonStore((state) => state.createManyPersons);

  const importFile = async (file: File) => {
    if (!options.proposalId || options.busy || importingRef.current) return;
    importingRef.current = true;
    setImporting(true);
    try {
      const parsed = await readPersonSpreadsheet(file);
      if (!parsed.ok) {
        toast({
          title: "Planilha não gravada",
          description: spreadsheetFailureMessage(parsed.reason),
          variant: "destructive",
        });
        return;
      }
      const decision = peopleToSave({
        people: parsed.people,
        existingNames: listRef.current.map((person) => person.name),
        remainingSlots: options.remainingSlots,
      });
      if (decision.toSave.length === 0) {
        toast({
          title: "Planilha não gravada",
          description: spreadsheetNothingSavedMessage(decision),
          variant: "destructive",
        });
        return;
      }
      const proposalId = options.proposalId;
      const response = await createManyPersons(
        decision.toSave.map((person) => ({
          name: person.name,
          email: person.email,
          proposalId,
          type: options.type,
        }))
      );
      const imported = new Set(decision.toSave.map((person) => normalizePersonName(person.name)));
      options.setList((current) => {
        const pending = current.filter(
          (person) => !person.id && !imported.has(normalizePersonName(person.name))
        );
        return [...response.data.personList, ...pending];
      });
      toast({
        title: "Lista gravada",
        description: spreadsheetSavedMessage(decision.toSave.length, decision.overCap, decision.duplicates),
      });
    } catch (error: unknown) {
      const { title, message } = handleBackendError(
        error,
        "Não foi possível gravar a planilha. Nada foi gravado."
      );
      toast({ title, description: message, variant: "destructive" });
    } finally {
      importingRef.current = false;
      setImporting(false);
    }
  };

  return { importing, importFile };
}
