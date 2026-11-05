type RequiredService = {
  id: string;
  rpaRequired?: boolean;
  rpaMinPeople?: number | null;
};

export function requiredServiceIds(services: RequiredService[], guestNumber: number) {
  return services
    .filter((service) => Boolean(service.rpaRequired && service.rpaMinPeople && guestNumber >= service.rpaMinPeople))
    .map((service) => service.id);
}
