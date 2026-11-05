import { describe, expect, it } from "vitest";
import { buildContactBody } from "./contact-body";

describe("buildContactBody", () => {
  it("sem arquivo segue json", () => {
    const payload = { name: "Casa" };
    expect(buildContactBody(payload)).toBe(payload);
  });

  it("com arquivo manda payload e file", () => {
    const file = new File(["img"], "logo.png", { type: "image/png" });
    const body = buildContactBody({ name: "Casa", description: "Bolos" }, file);
    expect(body).toBeInstanceOf(FormData);
    const form = body as FormData;
    expect(form.get("payload")).toBe(JSON.stringify({ name: "Casa", description: "Bolos" }));
    expect(form.get("file")).toBeInstanceOf(File);
  });
});
