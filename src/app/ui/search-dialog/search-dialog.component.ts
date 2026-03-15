import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {FormsModule} from '@angular/forms';
import {SearchRepository} from '../../service/repository/search-repository';
import {MessageHistory} from '../../model/dto/message-history';
import {catchError, of, Subject, Subscription, tap} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {SearchResultItemComponent} from "../search-result-item/search-result-item.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

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
            SearchResultItemComponent,
            MatProgressSpinner
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
              public dialogRef: MatDialogRef<SearchDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private readonly data: { chatId: string; }
      ) {
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
                          return this.searchRepository.list({
                                query: query,
                                chatId: this.data.chatId,
                          }).pipe(
                                  catchError(err => {
                                        console.error('Search failed', err);
                                        return of([]);
                                  })
                          );
                    })
            ).subscribe({
                  next: (results) => {
                        console.log(results)
                        this.searchResults = results;
                        this.isLoading = false;
                  }
            });
      }

      onSearchChange(query: string): void {
            this.searchSubject.next(query);
      }

      ngOnDestroy(): void {
            this.searchSubscription?.unsubscribe();
      }

      close() {
            this.dialogRef.close();
      }
}
