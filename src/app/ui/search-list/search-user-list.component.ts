import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {catchError, of, Subject, Subscription, tap} from "rxjs";
import {UserRepository} from "../../service/repository/user-repository";
import {SearchUserComponent} from "../search-item/search-user.component";
import {CommonModule} from "@angular/common";
import {User} from "../../model/dto/user";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {debounceTime, distinctUntilChanged, switchMap} from "rxjs/operators";
import {threadsRoute} from "../../home-route.module";

@Component({
      selector: 'app-search-user-list',
      imports: [
            SearchUserComponent,
            CommonModule,
            MatProgressSpinner
      ],
      templateUrl: './search-user-list.component.html',
      styleUrl: './search-user-list.component.css'
})
export class SearchUserListComponent implements OnDestroy, OnInit {

      private searchSubject = new Subject<string>();
      private searchSubscription?: Subscription;

      protected result: User[] = [];
      protected isLoading: boolean = false;
      private routeSub: Subscription

      constructor(
              private readonly router: Router,
              private readonly activatedRoute: ActivatedRoute,
              private readonly userRepository: UserRepository) {
            this.routeSub = this.activatedRoute.queryParamMap
                    .subscribe(params => {
                          const query = params.get('query');
                          if (!!query) {
                                this.searchSubject.next(query);
                          }
                    });
      }

      ngOnInit(): void {
            this.searchSubscription = this.searchSubject.pipe(
                    tap(() => {
                          this.isLoading = true;
                    }),
                    debounceTime(300),
                    distinctUntilChanged(),
                    switchMap(query => {
                          if (!query.trim()) {
                                this.isLoading = false;
                                return of([]);
                          }
                          return this.userRepository.list(query).pipe(
                                  catchError(err => {
                                        console.error('Search failed', err);
                                        return of([]);
                                  })
                          );
                    })
            ).subscribe({
                  next: (result) => {
                        this.result = result;
                        this.isLoading = false;
                  }
            });
      }

      protected clear() {
            this.router.navigate(threadsRoute);
      }

      ngOnDestroy(): void {
            this.routeSub.unsubscribe();
            this.searchSubscription?.unsubscribe();
      }
}
