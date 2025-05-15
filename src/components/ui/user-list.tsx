
import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { SearchInput } from "@/components/ui/search-input"

export interface User {
  id: string
  username: string
  email: string
}

interface UserItemProps {
  user: User
  onClick?: (user: User) => void
  badge?: React.ReactNode
}

export function UserItem({ user, onClick, badge }: UserItemProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(user)}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="font-medium">{user.username}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
        {badge}
      </CardContent>
    </Card>
  )
}

interface UserListProps {
  users: User[]
  onUserClick: (user: User) => void
  searchPlaceholder?: string
  emptyMessage?: string
  renderBadge?: (user: User) => React.ReactNode
  className?: string
}

export function UserList({
  users,
  onUserClick,
  searchPlaceholder = "Filtrar usuários...",
  emptyMessage = "Nenhum usuário encontrado",
  renderBadge,
  className
}: UserListProps) {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [users, searchTerm])

  return (
    <div className={cn("space-y-4", className)}>
      <SearchInput
        placeholder={searchPlaceholder}
        onSearch={setSearchTerm}
      />

      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              onClick={onUserClick}
              badge={renderBadge?.(user)}
            />
          ))
        )}
      </div>
    </div>
  )
}
