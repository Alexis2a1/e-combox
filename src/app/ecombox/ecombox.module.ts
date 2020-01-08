import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { EcomboxRoutingModule } from './ecombox-routing.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ThemeModule } from '../@theme/theme.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { TokenInterceptor} from './services/token-interceptor';


import { EcomboxComponent } from './ecombox.component';
import { RestService } from './services/rest.service';
import { GeneralService } from './services/general.service';
import { AideComponent } from './aide/aide.component';
import { RedirectGuard } from './redirect-guard';

const ECOMBOX_COMPONENTS = [
  EcomboxComponent,
];

@NgModule({
  declarations: [
    ...ECOMBOX_COMPONENTS,
    AideComponent,
  ],
  imports: [
    CommonModule,
    EcomboxRoutingModule,
    DashboardModule,
    ThemeModule,
    MiscellaneousModule,
    HttpClientModule,
  ],
  providers: [
    RestService,
    GeneralService,
    RedirectGuard,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
  ],
})
export class EcomboxModule { }
