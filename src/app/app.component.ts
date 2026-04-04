import {Component, OnInit} from '@angular/core';
import {AccountService} from "./service/auth/account.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {take} from "rxjs";

@Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      standalone: false,
      styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {

      constructor(private readonly accountRepository: AccountService, private readonly router: Router, private readonly snackBar: MatSnackBar) {

      }

      ngOnInit(): void {
            this.accountRepository.accountObservable.pipe(take(1))
                    .subscribe(account => {
                          if (account) {
                                this.router.navigate(['/home']);
                          } else {
                                this.router.navigate(["/auth/login"], {replaceUrl: true});
                          }
                    })
      }


}
