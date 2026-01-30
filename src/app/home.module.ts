import {NgModule} from '@angular/core';
import {HomeComponent} from './ui/home/home.component';
import {SideNavComponent} from './ui/side-nav/side-nav.component';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {CommonModule} from "@angular/common";
import {MatMenuModule} from "@angular/material/menu";
import {SettingsComponent} from './ui/settings/settings.component';
import {HomeRoutingModule} from "./home-route.module";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatCardModule} from "@angular/material/card";
import {MatRadioModule} from "@angular/material/radio";
import {SettingsItemComponent} from "./ui/settings-item/settings-item.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DialogListComponent} from "./ui/dialog-list/dialog-list.component";
import {MessageListComponent} from "./ui/message-list/message-list.component";
import {SearchListComponent} from "./ui/search-list/search-list.component";
import {ThreadComponent} from "./ui/thread/thread.component";
import {ProfileManagementComponent} from "./ui/profile-management/profile-management.component";

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
            ReactiveFormsModule,
            MessageListComponent,
            ProfileManagementComponent],
      declarations: [
            HomeComponent,
            SideNavComponent,
            SettingsComponent,
      ]
})
export class HomeModule {
}
