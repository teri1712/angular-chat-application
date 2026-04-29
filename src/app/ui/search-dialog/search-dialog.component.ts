import {Component, inject, model} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {FormsModule} from '@angular/forms';
import {SearchRepository} from '../../service/repository/search-repository';
import {catchError, of} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {SearchResultItemComponent} from "../search-result-item/search-result-item.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {rxResource, toObservable, toSignal} from "@angular/core/rxjs-interop";

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
export class SearchDialogComponent {
    private searchRepository = inject(SearchRepository)
    public dialogRef = inject(MatDialogRef<SearchDialogComponent>);
    private data = inject<{ chatId: string }>(MAT_DIALOG_DATA);

    query = model<string>('')

    private debounceQuery = toSignal(toObservable(this.query)
        .pipe(
            debounceTime(300),
        ))

    results = rxResource({
        params: () => {
            const query = this.query();
            const debounceQuery = this.debounceQuery()?.trim()
            if (debounceQuery && query === debounceQuery)
                return ({
                    query: debounceQuery,
                })
            return undefined
        },
        stream: (request) => {
            const params = request.params
            return this.searchRepository.list({
                query: params.query,
                chatId: this.data.chatId,
            }).pipe(
                catchError(err => {
                    console.error('Search failed', err);
                    return of([]);
                })
            );
        },
    });

    onClose() {
        this.dialogRef.close();
    }
}
