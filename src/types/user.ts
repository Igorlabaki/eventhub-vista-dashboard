import { User } from "@/components/ui/user-list";

export interface UserByEmailResponse {
  success: true,
  message: string,
  data: User,
  count: number,
  type: string
}