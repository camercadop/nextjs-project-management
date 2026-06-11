export type TokenPayload = {
    userId: string
    email: string
    iat?: number
    exp?: number
}

export type AuthTokens = {
    accessToken: string
    refreshToken?: string
}
