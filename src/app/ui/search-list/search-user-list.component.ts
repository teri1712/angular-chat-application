import {Component, computed, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {catchError, of} from "rxjs";
import {UserRepository} from "../../service/repository/user-repository";
import {SearchUserComponent} from "../search-item/search-user.component";
import {CommonModule} from "@angular/common";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {debounceTime} from "rxjs/operators";
import {threadsRoute} from "../../home-route.module";
import {rxResource, toObservable, toSignal} from "@angular/core/rxjs-interop";

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

    private router = inject(Router)
    private activatedRoute = inject(ActivatedRoute)
    private userRepository = inject(UserRepository)
    private queryParams = toSignal(this.activatedRoute.queryParamMap)
    private query = computed(() => {
        const query = this.queryParams()?.get('query');
        return query ?? '';
    });

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
            return this.userRepository.list(params.query).pipe(
                catchError(err => {
                    console.error('Search failed', err);
                    return of([]);
                })
            );
        },
    });

    ngOnInit(): void {
    }

    protected clear() {
        this.router.navigate(threadsRoute);
    }

    ngOnDestroy(): void {
    }
}
