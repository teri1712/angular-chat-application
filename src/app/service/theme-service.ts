import {Injectable} from "@angular/core";


const THEME_KEY = "theme";
const DARK_CLASS = "light-theme";
const LIGHT_CLASS = "dark-theme";

@Injectable({
      providedIn: 'root'
})
export class ThemeService {

      private _theme: boolean = false

      constructor() {
            document.addEventListener('DOMContentLoaded', () => {
                  this.initTheme()
            }, {
                  once: true
            })
      }

      set theme(theme: boolean) {
            this._theme = theme
            localStorage.setItem(THEME_KEY, JSON.stringify(this._theme))
            document.body.classList.toggle(DARK_CLASS, this._theme)
            document.body.classList.toggle(LIGHT_CLASS, !this._theme)
      }

      get theme() {
            return this._theme
      }

      private initTheme(): void {
            const localTheme = localStorage.getItem(THEME_KEY);
            if (localTheme) {
                  this._theme = JSON.parse(localTheme);
                  document.body.classList.toggle(DARK_CLASS, this._theme)
                  document.body.classList.toggle(LIGHT_CLASS, !this._theme)
            }
      }
}