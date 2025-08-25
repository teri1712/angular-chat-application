import { Preference } from './preference';

export class PreferenceEvent {
  constructor(public preference: Preference) {}

  static from(raw: any): PreferenceEvent {
    const preference = raw.preference ? Preference.from(raw.preference) : new Preference();
    return new PreferenceEvent(preference);
  }
}
