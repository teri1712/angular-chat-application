import {Component} from '@angular/core';
import {AccountService} from "./service/auth/account.service";
import {Router, RouterOutlet} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {IconRegistry} from "./res/IconRegistry";
import {ThemeService} from "./service/theme-service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [
        RouterOutlet
    ],
    styleUrl: './app.component.css',
})
export class AppComponent {


    constructor(
        private readonly accountRepository: AccountService,
        private readonly router: Router,
        private readonly snackBar: MatSnackBar,
        iconRegistry: IconRegistry,
        themeService: ThemeService,
    ) {

    }


}
