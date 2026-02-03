import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./ui/home/home.component";
import {SettingsComponent} from "./ui/settings/settings.component";
import {MessageListComponent} from "./ui/message-list/message-list.component";
import {SearchListComponent} from "./ui/search-list/search-list.component";
import {ThreadComponent} from "./ui/thread/thread.component";
import {DialogListComponent} from "./ui/dialog-list/dialog-list.component";

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
                              component: SearchListComponent,
                        },
                        {
                              path: 'list',
                              component: DialogListComponent,
                        }
                  ]
            },
            {
                  path: ':id',
                  component: MessageListComponent,
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
