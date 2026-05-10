import {effect, Injectable, signal, WritableSignal} from "@angular/core";


const THEME_KEY = "theme";
const DARK_CLASS = "light-theme";
const LIGHT_CLASS = "dark-theme";

export type theme = 'dark' | 'light'

@Injectable({
    providedIn: 'root'
})
export class ThemeService {

    private readonly _theme: WritableSignal<theme>;

    constructor() {
        const localTheme = localStorage.getItem(THEME_KEY);
        const initialTheme = localTheme ? JSON.parse(localTheme) : 'dark';
        this._theme = signal(initialTheme);

        effect(() => {
            this.applyTheme(this._theme())
        });
    }

    setTheme(theme: theme) {
        this._theme.set(theme);
    }

    get theme() {
        return this._theme.asReadonly();
    }

    private applyTheme(theme: theme): void {
        localStorage.setItem(THEME_KEY, JSON.stringify(theme))
        document.body.classList.toggle(DARK_CLASS, theme === 'dark')
        document.body.classList.toggle(LIGHT_CLASS, theme === 'light')
    }
}