import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {UserRepository} from "../core/service/repository/user-repository";
import {SearchItemComponent} from "../search-item/search-item.component";
import {CommonModule} from "@angular/common";
import {Dialog} from "../model/dialog";
import {Conversation} from "../model/conversation";

@Component({
      selector: 'app-search-list',
      imports: [
            SearchItemComponent,
            CommonModule
      ],
      templateUrl: './search-list.component.html',
      styleUrl: './search-list.component.css'
})
export class SearchListComponent implements OnDestroy {

      protected dialogs: Dialog[] = [];
      private routeSub: Subscription

      constructor(
              private readonly router: Router,
              private readonly activatedRoute: ActivatedRoute,
              private readonly userRepository: UserRepository) {
            this.routeSub = this.activatedRoute.queryParamMap
                    .subscribe(params => {
                          const query = params.get('query');
                          if (!!query) {
                                this.search(query);
                          }
                    });
      }

      private search(query: string) {
            this.userRepository.list(query).subscribe(dialogs => {
                  this.dialogs = dialogs;
            })
      }

      protected onClick(conversation: Conversation) {
            this.router.navigate(['/home', {
                  outlets: {
                        'conversation': [conversation.identifier.toString()]
                  }
            }])
      }

      ngOnDestroy(): void {
            this.routeSub.unsubscribe();
      }
}
