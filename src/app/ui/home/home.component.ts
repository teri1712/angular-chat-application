import {Component, OnDestroy, OnInit} from '@angular/core';
import {LogTrailerService} from "../../service/websocket/log-trailer.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {AccountRepository} from "../../service/auth/account-repository";

@Component({
      selector: 'app-home',
      standalone: false,

      templateUrl: './home.component.html',
      styleUrl: './home.component.css',
      providers: []
})
export class HomeComponent implements OnInit, OnDestroy {


      constructor(
              private readonly accountRepository: AccountRepository,
              stompClient: LogTrailerService,
              private readonly router: Router,
              private readonly snackBar: MatSnackBar) {
      }

      ngOnDestroy(): void {
      }

      ngOnInit(): void {
      }

}
