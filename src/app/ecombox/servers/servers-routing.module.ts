import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { ServersComponent } from './servers.component';
import { BlogComponent } from './blog/blog.component';
import { WoocommerceComponent } from './woocommerce/woocommerce.component';
import { PrestashopComponent } from './prestashop/prestashop.component';
import { MauticComponent } from './mautic/mautic.component';
import { OdooComponent } from './odoo/odoo.component';
import { SuitecrmComponent } from './suitecrm/suitecrm.component';
import { KanboardComponent } from './kanboard/kanboard.component';
import { HumhubComponent } from './humhub/humhub.component';
import { SftpComponent } from './sftp/sftp.component';
import { PmaComponent } from './pma/pma.component';

const routes: Routes = [{
  path: '',
  component: ServersComponent,
  children: [{
	  path: 'blog',
	  component: BlogComponent,
  }, {
	  path: 'woocommerce',
	  component: WoocommerceComponent,
  }, {
	  path: 'prestashop',
	  component: PrestashopComponent,
  }, {
	  path: 'mautic',
	  component: MauticComponent,
  }, {
	  path: 'odoo',
	  component: OdooComponent,
  }, {
	  path: 'kanboard',
	  component: KanboardComponent,
  }, {
	  path: 'humhub',
	  component: HumhubComponent,
  }, {          
	  path: 'suitecrm',
	  component: SuitecrmComponent,
  }, {
	  path: 'sftp',
	  component: SftpComponent,
  }, {
	  path: 'pma',
	  component: PmaComponent,
  },
],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServersRoutingModule {
}
