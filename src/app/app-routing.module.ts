import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
  { path: 'ecombox', loadChildren: 'app/ecombox/ecombox.module#EcomboxModule'},
  { path: '', redirectTo: 'ecombox', pathMatch: 'full' },
  { path: '**', redirectTo: 'ecombox' },
];

const config: ExtraOptions = {
  useHash: true,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
