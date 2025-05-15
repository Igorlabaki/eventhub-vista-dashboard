import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, X } from "lucide-react";

interface ProfileAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  username: string;
  onSave: (file: File) => void;
}

export function ProfileAvatarModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  username,
  onSave
}: ProfileAvatarModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatarUrl || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (selectedFile) {
      onSave(selectedFile);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md ">
        <DialogHeader>
          <DialogTitle>Alterar Foto de Perfil</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage src={previewUrl} alt={username} />
              <AvatarFallback className="text-3xl">
                {username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {previewUrl && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 rounded-full h-6 w-6"
                onClick={() => {
                  setPreviewUrl("");
                  setSelectedFile(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="w-full space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="flex items-center justify-center gap-2 w-full p-2 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <Upload className="h-5 w-5" />
              <span>Escolher uma imagem</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!selectedFile}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 