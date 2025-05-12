
import * as React from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Permission {
  enum: string
  display: string
}

interface PermissionManagerProps {
  userId: string
  userName: string
  venueId: string
  venueName: string
  viewPermissions: Permission[]
  editPermissions: Permission[]
  proposalPermissions: Permission[]
  userPermissions: {
    [userId: string]: {
      [venueId: string]: string[]
    }
  }
  onGoBack: () => void
  onSavePermissions: (permissions: string[]) => void
}

export function PermissionManager({
  userId,
  userName,
  venueId,
  venueName,
  viewPermissions,
  editPermissions,
  proposalPermissions,
  userPermissions,
  onGoBack,
  onSavePermissions
}: PermissionManagerProps) {
  const { toast } = useToast()
  const [permissions, setPermissions] = React.useState<string[]>(
    userPermissions[userId]?.[venueId] || []
  )

  const hasPermission = (permissionKey: string): boolean => {
    return permissions.includes(permissionKey)
  }

  const togglePermission = (permissionKey: string) => {
    setPermissions(prev => {
      const permissionIndex = prev.indexOf(permissionKey)
      
      if (permissionIndex >= 0) {
        return prev.filter(p => p !== permissionKey)
      } else {
        return [...prev, permissionKey]
      }
    })
  }

  const handleSavePermissions = () => {
    onSavePermissions(permissions)
    
    toast({
      title: "Permissões atualizadas",
      description: "As permissões do usuário foram atualizadas com sucesso."
    })
  }

  const renderPermissionSection = (sectionTitle: string, permissionsList: Permission[]) => (
    <div>
      <h3 className="text-lg font-semibold mb-4">{sectionTitle}:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {permissionsList.map((permission) => (
          <div 
            key={permission.enum}
            className="flex items-center justify-between p-3 border rounded-md"
          >
            <span>{permission.display}</span>
            <RadioGroup 
              value={hasPermission(permission.enum) ? "enabled" : "disabled"}
              onValueChange={(value) => {
                if (value === "enabled" && !hasPermission(permission.enum)) {
                  togglePermission(permission.enum)
                } else if (value === "disabled" && hasPermission(permission.enum)) {
                  togglePermission(permission.enum)
                }
              }}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="disabled" id={`${permission.enum}-disabled`} />
                <Label htmlFor={`${permission.enum}-disabled`} className="text-gray-500">Não</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="enabled" id={`${permission.enum}-enabled`} />
                <Label htmlFor={`${permission.enum}-enabled`} className="text-gray-500">Sim</Label>
              </div>
            </RadioGroup>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <div className="flex items-center mb-6">
        <Button variant="outline" size="icon" className="mr-2" onClick={onGoBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Permissões: {venueName}
          </h2>
          <p className="text-sm text-gray-500">
            Gerenciar permissões de {userName}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* View Permissions Section */}
        {renderPermissionSection("Permissões de Visualização", viewPermissions)}

        <Separator />

        {/* Edit Permissions Section */}
        {renderPermissionSection("Permissões de Edição", editPermissions)}

        <Separator />

        {/* Proposal Permissions Section */}
        {renderPermissionSection("Permissões de Eventos / Orçamentos", proposalPermissions)}

        <div className="mt-8">
          <Button className="w-full" onClick={handleSavePermissions}>
            Atualizar
          </Button>
        </div>
      </div>
    </>
  )
}
