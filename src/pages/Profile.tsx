import { useState } from "react";
import { Camera } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import { ErrorPage } from "@/components/ErrorPage";
import { SidebarNav } from "@/components/SidebarNav";
import { ProfileUserForm } from "@/components/profile/ProfileUserForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileAvatarModal } from "@/components/profile/ProfileAvatarModal";
import { ProfilePasswordForm } from "@/components/profile/ProfilePasswordForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ProfileInfoCard } from "@/components/profile/ProfileInfoCard";
import { ProfileSettingsCard } from "@/components/profile/ProfileSettingsCard";

export default function Profile() {
  const user = useUserStore((state) => state.user);

  if (!user)
    return (
      <ErrorPage
        title="Usuário não encontrado"
        message="Não foi possível encontrar as informações do usuário."
      />
    );

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNav />
      <div className="flex flex-col flex-1 min-h-0">
        <Header
          title="Meu Perfil"
          subtitle="Gerencie suas informações pessoais"
        />
        <div className="flex-1 p-8 overflow-auto">
          <div className="grid gap-6 md:grid-cols-2">
            <ProfileInfoCard />
            <ProfileSettingsCard />
          </div>
        </div>
      </div>
    </div>
  );
}
