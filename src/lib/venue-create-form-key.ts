export function venueCreateFormKey(recordId: string | undefined, session: number) {
  return recordId ? recordId : `new-${session}`;
}
