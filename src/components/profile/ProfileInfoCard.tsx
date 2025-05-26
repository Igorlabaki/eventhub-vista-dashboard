import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { ProfileAvatarModal } from "@/components/profile/ProfileAvatarModal";
import { ProfileUserForm } from "@/components/profile/ProfileUserForm";
import { useUserStore } from "@/store/userStore";

export function ProfileInfoCard() {
  const user = useUserStore((state) => state.user);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  if (!user) return null;

  return (
    <Card>
      <CardHeader className="flex justify-center items-center md:justify-start md:items-start">
        <CardTitle>Informações Pessoais</CardTitle>
        <CardDescription className="text-center">
          Atualize suas informações pessoais e como os outros te veem na
          plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <Avatar
              className="h-32 w-32 mb-4 cursor-pointer transition-transform hover:scale-105"
              onClick={() => setIsAvatarModalOpen(true)}
            >
              <AvatarImage src={user.avatarUrl || ""} alt={user.username} />
              <AvatarFallback className="text-2xl md:text-3xl text-center">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 bg-black/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-4 w-4 text-white" />
            </div>
          </div>
          <h2 className="text-lg md:text-2xl text-center  font-bold">{user.username}</h2>
          <p className="text-gray-500">{user.email}</p>
        </div>
        <ProfileUserForm />
      </CardContent>
      <ProfileAvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={user.avatarUrl}
        username={user.username}
        userId={user.id}
      />
    </Card>
  );
}
