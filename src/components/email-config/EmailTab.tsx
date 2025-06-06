import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Proposal } from "@/types/proposal";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { X } from "lucide-react";

interface EmailTabProps {
  proposal: Proposal | null;
  venueUrl?: string;
  venueName?: string;
  form: UseFormReturn<{
    message: string;
    file?: File | null;
  }>;
}

export function EmailTab({ proposal, venueUrl, venueName, form }: EmailTabProps) {
  const [preview, setPreview] = useState<string | null>(null);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("file", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    form.setValue("file", null);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="message"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea
                {...field}
                className="min-h-[300px] resize-none"
                placeholder="Digite sua mensagem aqui..."
              />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <Label htmlFor="file">Imagem de fundo (opcional)</Label>
        <div className="flex items-center gap-4">
          <Input
            id="file"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="flex-1"
          />
          {preview && (
            <button
              type="button"
              onClick={removeImage}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {preview && (
          <div className="mt-2">
            <img
              src={preview}
              alt="Preview"
              className="max-h-[200px] rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
} 