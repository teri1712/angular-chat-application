import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./ui/home/home.component";
import {SettingsComponent} from "./ui/settings/settings.component";
import {SearchUserListComponent} from "./ui/search-list/search-user-list.component";
import {ThreadComponent} from "./ui/thread/thread.component";
import {ConversationListComponent} from "./ui/conversation-list/conversation-list.component";
import {MessagePanelComponent} from "./ui/message-pannel/message-panel.component";

export const threadsRoute = ['/home', {
      outlets: {
            'side-bar': ['thread', 'list']
      }
}]

export const searchRoute = ['/home', {
      outlets: {
            'side-bar': ['thread', 'search']
      }
}]
export const settingRoute = ['/home', {
      outlets: {
            'side-bar': ['settings']
      }
}];

const routes: Routes = [{
      path: '',
      component: HomeComponent,
      children: [
            {
                  path: 'settings',
                  component: SettingsComponent,
                  outlet: 'side-bar'
            },
            {
                  path: 'thread',
                  component: ThreadComponent,
                  outlet: 'side-bar',
                  children: [
                        {
                              path: 'search',
                              component: SearchUserListComponent,
                        },
                        {
                              path: 'list',
                              component: ConversationListComponent,
                        }
                  ]
            },
            {
                  path: ':id',
                  component: MessagePanelComponent,
                  outlet: 'conversation'
            }
      ]
}];


@NgModule({
      imports: [RouterModule.forChild(routes)],
      exports: [RouterModule],
})
export class HomeRoutingModule {
}
