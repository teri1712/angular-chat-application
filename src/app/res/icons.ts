export const messageIconBundles: { [key: number]: string } = {
      1: 'like',
      2: 'heart',
      3: 'pig',
      4: 'paw'
}

export const iconBundles: { [key: number]: string } = {
      ...messageIconBundles,
      5: 'google',
      6: 'send',
}

export function getIcon(resourceId: number): string {
      return iconBundles[resourceId];
}