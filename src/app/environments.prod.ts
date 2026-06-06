export const environment = {
    get API_URL() { return (window as any).APP_CONFIG?.API_URL; },
    get WEBSOCKET_HOST() { return (window as any).APP_CONFIG?.WEBSOCKET_HOST; },
    get googleClientId() { return (window as any).APP_CONFIG?.GOOGLE_CLIENT_ID; }
};
