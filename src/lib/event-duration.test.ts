import { describe, expect, it } from "vitest";
import { chosenServiceHours, durationServiceHours, eventDurationHours, sameDayEventHours, serviceHourFieldError, stayEventHours } from "./event-duration";

describe("duracao enviada pelo painel", () => {
    it("pernoite conta as horas ate o dia seguinte", () => {
        const hours = eventDurationHours(
            new Date("2026-06-01T22:00:00"),
            new Date("2026-06-01T02:00:00"),
        );
        expect(hours).toBe(4);
        expect(durationServiceHours(
            [{ id: "led", pricingType: "PER_HOUR" }, { id: "limpeza", pricingType: "FIXED" }],
            ["led", "limpeza"],
            new Date("2026-06-01T22:00:00"),
            new Date("2026-06-01T02:00:00"),
        )).toEqual([{ serviceId: "led", hours: 4 }]);
    });

    it("horas vazias, zero e fracao nao entram no envio", () => {
        const services = [
            { id: "led", pricingType: "PER_HOUR" },
            { id: "limpeza", pricingType: "FIXED" },
        ];
        const empty = chosenServiceHours(services, ["led", "limpeza"], {});
        const zero = chosenServiceHours(services, ["led"], { led: "0" });
        const fraction = chosenServiceHours(services, ["led"], { led: "1.5" });
        const ok = chosenServiceHours(services, ["led"], { led: "3" });
        expect(empty.serviceHours).toEqual([]);
        expect(empty.errors.led).toBeTruthy();
        expect(zero.errors.led).toBeTruthy();
        expect(fraction.errors.led).toBeTruthy();
        expect(ok).toEqual({ serviceHours: [{ serviceId: "led", hours: 3 }], errors: {} });
    });

    it("inicio e fim na mesma hora duram zero", () => {
        const start = new Date("2026-06-01T18:00:00");
        expect(eventDurationHours(start, start)).toBe(0);
        expect(durationServiceHours(
            [{ id: "led", pricingType: "PER_HOUR" }],
            ["led"],
            start,
            start,
        )).toEqual([{ serviceId: "led", hours: 0 }]);
    });
});

describe("horas do servico ate a duracao do evento", () => {
    const services = [
        { id: "led", pricingType: "PER_HOUR" },
        { id: "limpeza", pricingType: "FIXED" },
    ];

    it("5 horas num evento de 4 mostra a frase e nao entra no envio", () => {
        expect(serviceHourFieldError("5", 4)).toBe("O serviço não pode ter mais horas do que o evento (4 horas).");
        expect(serviceHourFieldError("1", 1)).toBeNull();
        expect(serviceHourFieldError("2", 1)).toBe("O serviço não pode ter mais horas do que o evento (1 hora).");
        const over = chosenServiceHours(services, ["led", "limpeza"], { led: "5" }, 4);
        expect(over.serviceHours).toEqual([]);
        expect(over.errors.led).toBe("O serviço não pode ter mais horas do que o evento (4 horas).");
        expect(over.errors.limpeza).toBeUndefined();
    });

    it("4 horas e campo vazio tiram a frase de duracao", () => {
        expect(serviceHourFieldError("4", 4)).toBeNull();
        expect(serviceHourFieldError("", 4)).toBeNull();
        expect(chosenServiceHours(services, ["led"], { led: "4" }, 4)).toEqual({
            serviceHours: [{ serviceId: "led", hours: 4 }],
            errors: {},
        });
    });

    it("fim anterior ao inicio nao aplica a frase de duracao", () => {
        expect(sameDayEventHours("2026-06-01", "22:00", "02:00")).toBeNull();
        expect(serviceHourFieldError("5", null)).toBeNull();
    });

    it("estadia usa o check-in e o check-out", () => {
        expect(stayEventHours("2026-06-01", "2026-06-02", "14:00", "12:00")).toBe(22);
    });
});
