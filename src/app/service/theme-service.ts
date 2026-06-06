import {effect, Injectable, signal, WritableSignal} from "@angular/core";


const THEME_KEY = "theme";
const DARK_CLASS = "dark-theme";
const LIGHT_CLASS = "light-theme";

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
        const root = document.documentElement;
        root.classList.remove(DARK_CLASS, LIGHT_CLASS);
        root.classList.add(theme === 'dark' ? DARK_CLASS : LIGHT_CLASS);
    }
}