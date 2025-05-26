import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ProfilePasswordForm } from "@/components/profile/ProfilePasswordForm";

export function ProfileSettingsCard() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center md:text-left">Configurações de Conta</CardTitle>
        <CardDescription className="text-center md:text-left">
          Gerencie suas preferências e configurações de segurança
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Collapsible>
          <div className="">
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start mb-2"
                onClick={() => setShowPasswordForm((v) => !v)}
              >
                Alterar Senha
              </Button>
            </CollapsibleTrigger>
            {showPasswordForm && (
              <CollapsibleContent>
                <ProfilePasswordForm onSuccess={() => setShowPasswordForm(false)} />
              </CollapsibleContent>
            )}
          </div>
        </Collapsible>
        <Button variant="destructive" className="w-full justify-start">
          Excluir Conta
        </Button>
      </CardContent>
    </Card>
  );
} 