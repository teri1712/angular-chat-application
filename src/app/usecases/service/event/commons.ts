export const UN_AUTHORIZED = "UN_AUTHORIZED";
export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";

export type AuthenticationEvent = {
      type: string
      data?: any
}


export function getAuthenticationChannel(): BroadcastChannel {
      return new BroadcastChannel("AUTHENTICATION_CHANNEL")
}
