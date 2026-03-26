export interface Preference {
      readonly iconId: number,
      readonly customName?: string,
      readonly customAvatar?: string,
      /** URL of the chat background image */
      readonly themeBackground?: string,
      /** Slug matching one of the 5 chat themes, e.g. "silver-mist" */
      readonly themeName?: string
}
