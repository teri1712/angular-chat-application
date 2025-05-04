import {Component} from '@angular/core';
import {AccountService} from "./core/service/auth/account.service";
import {Router} from "@angular/router";

@Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      standalone: false,
      styleUrl: './app.component.css',
})
export class AppComponent {

      ready: boolean = false;

      constructor(accountRepository: AccountService, router: Router) {
            accountRepository.accountObservable.subscribe(account => {
                  if (account) {
                        router.navigate(['/home']);
                  } else {
                        router.navigate(['/auth/login']);
                  }
                  this.ready = true;
            })
      }


}
