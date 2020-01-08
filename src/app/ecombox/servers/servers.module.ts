import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeModule } from '../../@theme/theme.module';
import { ServersRoutingModule } from './servers-routing.module';
import { NbDialogModule } from '@nebular/theme';
import { DialogNamePromptComponent } from './dialog-name-prompt/dialog-name-prompt.component';
import { ShowcaseDialogComponent } from './showcase-dialog/showcase-dialog.component';
import { WordpressComponent } from './wordpress/wordpress.component';
import { ServersComponent } from './servers.component';
import { StatusCardComponent } from './status-card/status-card.component';
import { PrestashopComponent } from './prestashop/prestashop.component';
import { SftpComponent } from './sftp/sftp.component';
import { SftpCardComponent } from './sftp-card/sftp-card.component';
import { ToastrComponent } from './toastr/toastr.component';
import { ServerModelComponent } from './server-model/server-model.component';
import { MauticComponent } from './mautic/mautic.component';
import { OdooComponent } from './odoo/odoo.component';
import { WoocommerceComponent } from './woocommerce/woocommerce.component';
import { SuitecrmComponent } from './suitecrm/suitecrm.component';
import { KanboardComponent } from './kanboard/kanboard.component';
import { HumhubComponent } from './humhub/humhub.component';
import { BlogComponent } from './blog/blog.component';
import { PmaComponent } from './pma/pma.component';
import { PmaCardComponent } from './pma-card/pma-card.component';

@NgModule({
  declarations: [
    WordpressComponent, 
    ServersComponent,
    StatusCardComponent,
    PrestashopComponent,
    SftpComponent,
    SftpCardComponent,
    ToastrComponent,
    ServerModelComponent,
    MauticComponent,
    OdooComponent,
    WoocommerceComponent,
    SuitecrmComponent,
    KanboardComponent,
    HumhubComponent,
    BlogComponent,
    PmaComponent,
    PmaCardComponent,
    DialogNamePromptComponent,
    ShowcaseDialogComponent,
  ],
  imports: [
    CommonModule,
    ThemeModule,
    ServersRoutingModule,
	  NbDialogModule.forChild(),
  ],
  entryComponents: [
    DialogNamePromptComponent,
    ShowcaseDialogComponent,
  ],
})
export class ServersModule { }
