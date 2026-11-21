import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { publicVenueLinksShareUrl } from "@/lib/public-venue-links";

export function LinkTreeQr({ url }: { url: string }) {
    return (
        <div className="flex justify-center rounded-xl bg-white p-4" data-link={url}>
            <QRCodeSVG value={url} size={220} includeMargin />
        </div>
    );
}

export function LinkTreeShareActions({ venueName }: { venueName: string }) {
    const [qrOpen, setQrOpen] = useState(false);
    const publicUrl = venueName.trim() ? publicVenueLinksShareUrl(venueName.trim()) : "";
    if (!publicUrl) return null;

    return (
        <>
            <Button asChild variant="outline" className="h-10 shrink-0 rounded-full">
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    Abrir link tree
                </a>
            </Button>
            <Button type="button" variant="outline" className="h-10 shrink-0 rounded-full" onClick={() => setQrOpen(true)}>
                QR code
            </Button>
            <Dialog open={qrOpen} onOpenChange={setQrOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogTitle>QR code do link tree</DialogTitle>
                    <DialogDescription>Aponte a câmera para abrir o link tree deste espaço.</DialogDescription>
                    <LinkTreeQr url={publicUrl} />
                </DialogContent>
            </Dialog>
        </>
    );
}
