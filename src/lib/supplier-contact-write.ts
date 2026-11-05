import { ContactType } from "@/types/contact";

type ContactWrite = {
  type?: ContactType;
  category?: string;
  description?: string;
};

export function supplierContactWrite<T extends ContactWrite>(
  data: T,
  file?: File | null,
  removeLogo?: boolean,
) {
  if (data.type !== ContactType.SUPPLIER) {
    return {
      data: { ...data, category: undefined, description: undefined },
      file: undefined as File | undefined,
      removeLogo: false,
    };
  }
  const chosen = file ?? undefined;
  return {
    data,
    file: chosen,
    removeLogo: Boolean(removeLogo) && !chosen,
  };
}
