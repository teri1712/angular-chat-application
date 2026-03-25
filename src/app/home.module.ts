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
import {ConversationListComponent} from "./ui/conversation-list/conversation-list.component";
import {MessageListComponent} from "./ui/message-list/message-list.component";
import {SearchUserListComponent} from "./ui/search-list/search-user-list.component";
import {ThreadComponent} from "./ui/thread/thread.component";
import {MessagePanelComponent} from "./ui/message-pannel/message-panel.component";
import {MatTooltipModule} from "@angular/material/tooltip";
import {UserRepository} from "./service/repository/user-repository";
import {SearchRepository} from "./service/repository/search-repository";
import ProfileService from "./service/profile-service";
import GroupService from "./service/group-service";
import {ChatRepository, DirectRepository} from "./service/repository/chat-repository";
import {LogRepository} from "./service/repository/log-repository";
import {ConversationRepository} from "./service/repository/conversation-repository.service";
import CacheService from "./service/cache/data/cache-service";
import {DialogService} from "./service/repository/dialog.service";
import {MessageRepository} from "./service/repository/message-repository.service";
import {PresenceRepository} from "./service/repository/presence-repository.service";
import {LogTrailerService} from "./service/websocket/log-trailer.service";
import {MessageService} from "./service/message-service";
import {AccountRepository} from "./service/auth/account-repository";
import {AccountService} from "./service/auth/account.service";
import {HANDLERS} from "./service/event-handler";
import {TextHandler} from "./service/text-handler";
import {IconHandler} from "./service/icon-handler";
import {SeenHandler} from "./service/seen-handler";
import {FileHandler} from "./service/file-handler";
import {ImageHandler} from "./service/image-handler";

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
            MatTooltipModule,
            ThreadComponent,
            SearchUserListComponent,
            SettingsItemComponent,
            ConversationListComponent,
            FormsModule,
            ReactiveFormsModule,
            MessageListComponent,
            MessagePanelComponent
      ],
      declarations: [
            HomeComponent,
            SideNavComponent,
            SettingsComponent,
      ],
      providers: [
            UserRepository,
            ProfileService,
            GroupService, ChatRepository,
            DirectRepository,
            LogRepository,
            ConversationRepository,
            CacheService,
            DialogService,
            MessageRepository,
            UserRepository,
            PresenceRepository,
            LogTrailerService,
            MessageService,
            SearchRepository,
            {
                  provide: AccountRepository,
                  useExisting: AccountService
            },
            {
                  provide: HANDLERS,
                  useClass: TextHandler,
                  multi: true
            },
            {
                  provide: HANDLERS,
                  useClass: IconHandler,
                  multi: true
            },
            {
                  provide: HANDLERS,
                  useClass: SeenHandler,
                  multi: true
            },
            {
                  provide: HANDLERS,
                  useClass: FileHandler,
                  multi: true
            },
            {
                  provide: HANDLERS,
                  useClass: ImageHandler,
                  multi: true
            }
      ],
})
export class HomeModule {
}
