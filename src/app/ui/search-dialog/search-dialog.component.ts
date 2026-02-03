import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {FormsModule} from '@angular/forms';
import {SearchRepository} from '../../service/repository/search-repository';
import {MessageHistory} from '../../model/dto/message-history';
import {catchError, of, Subject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {Router} from "@angular/router";
import {toIdString} from "../../model/dto/chat-identifier";
import {SearchResultItemComponent} from "../search-result-item/search-result-item.component";

@Component({
      selector: 'app-search-dialog',
      standalone: true,
      imports: [
            CommonModule,
            MatDialogModule,
            MatFormFieldModule,
            MatInputModule,
            MatIconModule,
            MatListModule,
            FormsModule,
            SearchResultItemComponent
      ],
      templateUrl: './search-dialog.component.html',
      styleUrl: './search-dialog.component.css'
})
export class SearchDialogComponent implements OnInit, OnDestroy {
      protected searchQuery: string = '';
      protected searchResults: MessageHistory[] = [];
      protected isLoading: boolean = false;

      private searchSubject = new Subject<string>();
      private searchSubscription?: Subscription;

      constructor(
              private searchRepository: SearchRepository,
              private dialogRef: MatDialogRef<SearchDialogComponent>,
              private router: Router
      ) {
      }

      ngOnInit(): void {
            this.searchSubscription = this.searchSubject.pipe(
                    debounceTime(300),
                    distinctUntilChanged(),
                    switchMap(query => {
                          if (!query.trim()) {
                                this.isLoading = false;
                                return of([]);
                          }
                          this.isLoading = true;
                          return this.searchRepository.list(query).pipe(
                                  catchError(err => {
                                        console.error('Search failed', err);
                                        return of([]);
                                  })
                          );
                    })
            ).subscribe({
                  next: (results) => {
                        this.searchResults = results;
                        this.isLoading = false;
                  }
            });
      }

      onSearchChange(query: string): void {
            this.searchSubject.next(query);
      }

      onResultClick(result: MessageHistory): void {
            this.dialogRef.close();
            this.router.navigate(['/home', {
                  outlets: {
                        'conversation': [toIdString(result.chatIdentifier)]
                  }
            }]);
      }

      ngOnDestroy(): void {
            this.searchSubscription?.unsubscribe();
      }
}
