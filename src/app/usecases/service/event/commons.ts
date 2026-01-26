export const UN_AUTHORIZED = "UN_AUTHORIZED";

export function getAuthenticationChannel(): BroadcastChannel {
      return new BroadcastChannel("AUTHENTICATION_CHANNEL")
}

export function getMessageChannel(username: string): BroadcastChannel {
      return new BroadcastChannel("MESSAGE_CHANNEL_" + username)
}
