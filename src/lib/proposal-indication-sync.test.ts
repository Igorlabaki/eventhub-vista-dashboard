import { describe, expect, it, vi } from "vitest";
import { createIndicationSync, toggleIndication } from "./proposal-indication-sync";

function deferred() {
  let resolve!: (ids: string[]) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<string[]>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("toggleIndication", () => {
  it("marca no fim da lista e desmarca sem mexer na ordem", () => {
    expect(toggleIndication(["a", "b"], "c")).toEqual(["a", "b", "c"]);
    expect(toggleIndication(["a", "b", "c"], "b")).toEqual(["a", "c"]);
  });
});

describe("createIndicationSync", () => {
  it("grava a lista inteira, inclusive indicados de outras paginas", async () => {
    const save = vi.fn(async (ids: string[]) => ids);
    const onSaved = vi.fn();
    const sync = createIndicationSync(["outra-pagina"], { save, onSaved, onFailed: vi.fn() });

    await sync.request(toggleIndication(["outra-pagina"], "novo"));

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(["outra-pagina", "novo"]);
    expect(onSaved).toHaveBeenCalledWith(["outra-pagina", "novo"]);
  });

  it("cliques durante uma gravacao viram um envio so, com a ultima selecao", async () => {
    const first = deferred();
    const save = vi
      .fn<(ids: string[]) => Promise<string[]>>()
      .mockImplementationOnce(() => first.promise)
      .mockImplementation(async (ids) => ids);
    const onSaved = vi.fn();
    const sync = createIndicationSync([], { save, onSaved, onFailed: vi.fn() });

    const running = sync.request(["a"]);
    void sync.request(["a", "b"]);
    void sync.request(["a", "b", "c"]);
    first.resolve(["a"]);
    await running;

    expect(save.mock.calls).toEqual([[["a"]], [["a", "b", "c"]]]);
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(onSaved).toHaveBeenCalledWith(["a", "b", "c"]);
  });

  it("nao envia quando o usuario volta para o que ja esta gravado", async () => {
    const first = deferred();
    const save = vi
      .fn<(ids: string[]) => Promise<string[]>>()
      .mockImplementationOnce(() => first.promise)
      .mockImplementation(async (ids) => ids);
    const sync = createIndicationSync([], { save, onSaved: vi.fn(), onFailed: vi.fn() });

    const running = sync.request(["a"]);
    void sync.request([]);
    void sync.request(["a"]);
    first.resolve(["a"]);
    await running;

    expect(save).toHaveBeenCalledTimes(1);
  });

  it("falha volta para a ultima lista gravada e descarta o que estava na fila", async () => {
    const error = new Error("403");
    const save = vi
      .fn<(ids: string[]) => Promise<string[]>>()
      .mockImplementationOnce(async (ids) => ids)
      .mockRejectedValueOnce(error)
      .mockImplementation(async (ids) => ids);
    const onSaved = vi.fn();
    const onFailed = vi.fn();
    const sync = createIndicationSync([], { save, onSaved, onFailed });

    await sync.request(["a"]);
    await sync.request(["a", "b"]);

    expect(onFailed).toHaveBeenCalledWith(["a"], error);
    expect(save).toHaveBeenCalledTimes(2);

    await sync.request(["a", "c"]);
    expect(save).toHaveBeenLastCalledWith(["a", "c"]);
    expect(onSaved).toHaveBeenLastCalledWith(["a", "c"]);
  });
});
