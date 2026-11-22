import { useEffect, useState } from "react";
import { shouldResolvePublicLinksHost } from "@/lib/public-venue-links";
import { venueService } from "@/services/venue.service";
import VenueLinks from "@/pages/VenueLinks";

type HostVenueLinksProps = {
    hostname?: string;
    resolve?: (host: string) => Promise<{ venueId: string; name: string }>;
};

export function HostVenueLinks({ hostname, resolve = venueService.resolveVenueDomain }: HostVenueLinksProps = {}) {
    const host = hostname ?? window.location.hostname;
    const canResolve = shouldResolvePublicLinksHost(host);
    const [venueName, setVenueName] = useState<string | null>(null);
    const [missing, setMissing] = useState(false);

    useEffect(() => {
        if (!canResolve) return;
        let active = true;
        resolve(host)
            .then((data) => {
                if (!active) return;
                setVenueName(data.name);
                setMissing(false);
            })
            .catch(() => {
                if (!active) return;
                setVenueName(null);
                setMissing(true);
            });
        return () => {
            active = false;
        };
    }, [canResolve, host, resolve]);

    if (!canResolve) return <p>Este endereço não abre um espaço.</p>;
    if (missing) return <p>Espaço não encontrado.</p>;
    if (!venueName) return <p>Carregando o link tree.</p>;
    return <VenueLinks venueKey={venueName} />;
}
