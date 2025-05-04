import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './auth.guard';

const routes: Routes = [
      {
            path: 'auth',
            loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
      },
      {
            path: 'home',
            canActivate: [AuthGuard],
            loadChildren: () => import('./home.module').then((m) => m.HomeModule),
      },
];

@NgModule({
      imports: [RouterModule.forRoot(routes)],
      exports: [RouterModule],
})
export class AppRoutingModule {
}
