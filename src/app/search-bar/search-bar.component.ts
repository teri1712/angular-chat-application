import {Component} from '@angular/core';
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {Router} from "@angular/router";
import {searchRoute, threadsRoute} from "../home-route.module";
import {MatIconButton} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";

@Component({
      selector: 'app-search-bar',
      imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatIconButton, FormsModule, NgIf],
      templateUrl: './search-bar.component.html',
      styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent {

      protected query: String = ""

      constructor(private router: Router) {
      }

      protected clear() {
            this.query = "";
            this.router.navigate(threadsRoute);
      }

      protected onChange(text: string) {
            if (text.trim().length > 0) {
                  this.router.navigate(searchRoute, {
                        queryParams: {query: text}
                  });

            } else {
                  this.router.navigate(threadsRoute);
            }
      }
}
