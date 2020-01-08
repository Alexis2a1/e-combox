import { NgModule } from '@angular/core';

import { NgxEchartsModule } from 'ngx-echarts';

import { ThemeModule } from '../../@theme/theme.module';
import { DashboardComponent } from './dashboard.component';
import { ContainerSectionComponent } from './container-section/container-section.component';
import { MemoryComponent } from './memory/memory.component';
import { ContainerInfoComponent } from './container-info/container-info.component';
import { SharedModule } from '../services/shared/shared.module';


@NgModule({
  imports: [
    ThemeModule,
    NgxEchartsModule,
    SharedModule,
  ],
  declarations: [
    DashboardComponent,
    ContainerSectionComponent,
    MemoryComponent,
    ContainerInfoComponent,
  ],
})
export class DashboardModule { }
