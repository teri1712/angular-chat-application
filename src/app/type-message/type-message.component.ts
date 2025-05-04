import {Component, OnDestroy, OnInit} from '@angular/core';
import {delay, Subscription, tap, timer} from "rxjs";

@Component({
      selector: 'app-type-message',
      imports: [],
      templateUrl: './type-message.component.html',
      styleUrl: './type-message.component.css'
})
export class TypeMessageComponent implements OnInit, OnDestroy {
      private dot1Sub!: Subscription
      private dot2Sub!: Subscription
      private dot3Sub!: Subscription

      protected dot1Offset: string = '0px'
      protected dot2Offset: string = '0px'
      protected dot3Offset: string = '0px'

      ngOnInit(): void {
            this.dot1Sub = timer(0, 1000).pipe(
                    tap(() => {
                          this.dot1Offset = '-4px'
                    }),
                    delay(250)).subscribe(
                    () => {
                          this.dot1Offset = '0px'
                    })
            this.dot2Sub = timer(250, 1000).pipe(
                    tap(() => {
                          this.dot2Offset = '-4px'
                    }),
                    delay(250)).subscribe(
                    () => {
                          this.dot2Offset = '0px'
                    })
            this.dot3Sub = timer(500, 1000).pipe(
                    tap(() => {
                          this.dot3Offset = '-4px'
                    }),
                    delay(250)).subscribe(
                    () => {
                          this.dot3Offset = '0px'
                    })
      }

      ngOnDestroy(): void {
            this.dot1Sub.unsubscribe()
            this.dot2Sub.unsubscribe()
            this.dot3Sub.unsubscribe()
      }

}
