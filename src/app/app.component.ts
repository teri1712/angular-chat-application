import {Component, OnInit} from '@angular/core';
import {AccountService} from "./service/auth/account.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      standalone: false,
      styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {

      inSession?: Boolean;

      constructor(private readonly accountRepository: AccountService, private readonly router: Router, private readonly snackBar: MatSnackBar) {

      }

      ngOnInit(): void {
            this.accountRepository.accountObservable.subscribe(account => {
                  if (account) {
                        this.router.navigate(['/home']);
                        this.inSession = true;
                  } else {
                        if (this.inSession) {
                              const ref = this.snackBar.open("Account Session has expired!", "Logout");
                              ref.onAction().subscribe(() => {
                                    this.router.navigate(["/auth/login"], {replaceUrl: true});
                              });
                        } else {
                              this.router.navigate(["/auth/login"], {replaceUrl: true});
                        }
                        this.inSession = false;
                  }
            })
      }


}
