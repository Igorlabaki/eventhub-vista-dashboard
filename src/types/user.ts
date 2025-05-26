export interface UserByEmailResponse {
  success: boolean,
  message: string,
  data: User,
  count: number,
  type: string
}
export interface UpdateUserResponse {
  success: boolean,
  message: string,
  data: User,
  count: number,
  type: string
}

export type User = {
  id: string;
  email: string;
  username: string;
  password: string;
  avatarUrl?: string | null;
  googleId?: string | null;
  fcmToken?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  emailConfirmationToken?: string | null;
  emailConfirmationExpires?: Date | null;
  emailConfirmed: boolean;
/*   // Relacionamentos (arrays de outros tipos)
  session: any[]; // Substitua por Session[] se tiver o type Session
  histories: any[]; // Substitua por History[] se tiver o type History
  refreshToken: any[]; // Substitua por RefreshToken[] se tiver o type RefreshToken
  userOrganizations: any[]; // Substitua por UserOrganization[] se tiver o type UserOrganization */
};