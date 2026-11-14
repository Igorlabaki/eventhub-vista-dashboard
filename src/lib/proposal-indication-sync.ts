export function toggleIndication(ids: string[], contactId: string) {
  return ids.includes(contactId) ? ids.filter((id) => id !== contactId) : [...ids, contactId];
}

function sameIds(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

type IndicationSyncOptions = {
  save: (ids: string[]) => Promise<string[]>;
  onSaved: (ids: string[]) => void;
  onFailed: (confirmed: string[], error: unknown) => void;
};

// O PUT substitui a lista inteira: um envio por vez, sempre com a ultima selecao.
export function createIndicationSync(initial: string[], { save, onSaved, onFailed }: IndicationSyncOptions) {
  let confirmed = initial;
  let desired = initial;
  let running = false;

  async function flush() {
    if (running) return;
    running = true;
    try {
      while (!sameIds(desired, confirmed)) {
        const target = desired;
        try {
          confirmed = await save(target);
        } catch (error) {
          desired = confirmed;
          onFailed(confirmed, error);
          return;
        }
        if (sameIds(desired, target)) desired = confirmed;
      }
      onSaved(confirmed);
    } finally {
      running = false;
    }
  }

  return {
    request(ids: string[]) {
      desired = ids;
      return flush();
    },
  };
}
