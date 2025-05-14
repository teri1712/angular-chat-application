import {NgModule} from '@angular/core';
import {HomeComponent} from './home/home.component';
import {SideNavComponent} from './side-nav/side-nav.component';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {CommonModule} from "@angular/common";
import {MatMenuModule} from "@angular/material/menu";
import {SettingsComponent} from './settings/settings.component';
import {HomeRoutingModule} from "./home-route.module";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatCardModule} from "@angular/material/card";
import {MatRadioModule} from "@angular/material/radio";
import {SettingsItemComponent} from "./settings-item/settings-item.component";
import {FormsModule} from "@angular/forms";
import {DialogListComponent} from "./dialog-list/dialog-list.component";
import {MessageListComponent} from "./message-list/message-list.component";
import {SearchListComponent} from "./search-list/search-list.component";
import {ThreadComponent} from "./thread/thread.component";

@NgModule({
      imports: [
            HomeRoutingModule,
            MatButtonModule,
            CommonModule,
            MatDividerModule,
            MatMenuModule,
            MatCardModule, MatRadioModule,
            MatCheckboxModule,
            MatSlideToggleModule,
            MatIconModule,
            ThreadComponent,
            SearchListComponent,
            SettingsItemComponent,
            DialogListComponent,
            FormsModule,
            MessageListComponent],
      declarations: [
            HomeComponent,
            SideNavComponent,
            SettingsComponent,
      ]
})
export class HomeModule {
}
