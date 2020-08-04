import { RouterModule, Routes, Router } from '@angular/router';
import { NgModule } from '@angular/core';

import { EcomboxComponent} from './ecombox.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';
import { AideComponent } from './aide/aide.component';
import { RedirectGuard } from './redirect-guard';

const routes: Routes = [{
  path: '',
  component: EcomboxComponent,
  children: [{
    path: 'dashboard',
    component: DashboardComponent,
  }, {
    path: 'servers',
    loadChildren: './servers/servers.module#ServersModule',
  }, {
    path: 'aide',
    component: AideComponent,
  }, {
    path: 'portainer',
    canActivate: [RedirectGuard],
    component: RedirectGuard,
    data: {
      externalUrl: 'http://llb.ac-corse.fr:11251/portainer/',
    },
  }, {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  }, {
    path: '**',
    component: NotFoundComponent,
  }],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EcomboxRoutingModule {
}
