export function buildContactBody(payload: unknown, file?: File) {
  if (!file) return payload;
  const formData = new FormData();
  formData.append("payload", JSON.stringify(payload));
  formData.append("file", file, file.name);
  return formData;
}
