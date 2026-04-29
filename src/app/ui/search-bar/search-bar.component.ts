import {Component, inject, model, OnInit} from '@angular/core';
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {Router} from "@angular/router";
import {MatIconButton} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {toObservable} from "@angular/core/rxjs-interop";
import {searchRoute, threadsRoute} from "../../home-route.module";

@Component({
    selector: 'app-search-bar',
    imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatIconButton, FormsModule],
    templateUrl: './search-bar.component.html',
    styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent implements OnInit {

    protected query = model('')
    private router = inject(Router)

    constructor() {

        toObservable(this.query)
            .subscribe({
                next: (query) => {
                    if (query) {
                        console.log(query)
                        this.router.navigate(searchRoute, {
                            queryParams: {query: query}
                        });
                    } else {
                        this.router.navigate(threadsRoute)
                    }
                }
            })
    }

    ngOnInit(): void {
    }

    protected clear() {
        this.query.set('');
    }
}
