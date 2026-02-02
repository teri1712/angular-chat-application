import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";


const THEME_KEY = "theme";
const DARK_CLASS = "light-theme";
const LIGHT_CLASS = "dark-theme";

@Injectable({
      providedIn: 'root'
})
export class ThemeService {

      private _themeSubject: BehaviorSubject<boolean>;

      constructor() {
            const localTheme = localStorage.getItem(THEME_KEY);
            const initialTheme = localTheme ? JSON.parse(localTheme) : false;
            this._themeSubject = new BehaviorSubject<boolean>(initialTheme);

            this.applyTheme(initialTheme);
      }

      set theme(theme: boolean) {
            localStorage.setItem(THEME_KEY, JSON.stringify(theme))
            this._themeSubject.next(theme);
            this.applyTheme(theme);
      }

      get theme() {
            return this._themeSubject.value;
      }

      get themeObservable(): Observable<boolean> {
            return this._themeSubject.asObservable();
      }

      private applyTheme(theme: boolean): void {
            document.body.classList.toggle(DARK_CLASS, theme)
            document.body.classList.toggle(LIGHT_CLASS, !theme)
      }
}