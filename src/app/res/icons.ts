export const iconBundles: { [key: number]: string } = {
      1: 'like',
      2: 'google',
      3: 'send',
}

export function getIcon(resourceId: number): string {
      return iconBundles[resourceId];
}