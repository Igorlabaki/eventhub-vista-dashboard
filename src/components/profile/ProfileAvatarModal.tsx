import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, X } from "lucide-react";
import { AsyncActionButton } from "@/components/AsyncActionButton";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/components/ui/use-toast";
import { showSuccessToast } from "@/components/ui/success-toast";
import { handleBackendError, handleBackendSuccess } from "@/lib/error-handler";

interface ProfileAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  username: string;
  userId: string;
}

export function ProfileAvatarModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  username,
  userId
}: ProfileAvatarModalProps) {
  const user = useUserStore((state) => state.user);
  const updateAvatar = useUserStore((state) => state.updateAvatar);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatarUrl || "");
  const { toast } = useToast();

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

  const handleAvatarUpdate = async () => {
    try {
      if (!selectedFile) throw new Error("Selecione um arquivo.");
      const response = await updateAvatar({
        userId,
        file: selectedFile
      });
      const { title, message } = handleBackendSuccess(response, "Avatar atualizado com sucesso!");
      showSuccessToast({
        title,
        description: message
      });
      onClose();
    } catch (error: unknown) {
      const { title, message } = handleBackendError(error, "Erro ao atualizar avatar. Tente novamente mais tarde.");
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90%] md:max-w-[40%] rounded-md">
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
            <AsyncActionButton
              onClick={handleAvatarUpdate}
              label="Salvar"
              disabled={!selectedFile}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 