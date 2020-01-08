import { Component } from '@angular/core';

import { MENU_ECOMBOX_ITEMS } from './ecombox-menu';

@Component({
  selector: 'ngx-ecombox',
  templateUrl: './ecombox.component.html',
  styleUrls: ['./ecombox.component.scss'],
})
export class EcomboxComponent {

  menu = MENU_ECOMBOX_ITEMS;

}
