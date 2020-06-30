import { Component, OnInit } from '@angular/core';
import { GeneralService } from './services/general.service';
import { environment } from '../../environments/environment';

import { MENU_ECOMBOX_ITEMS } from './ecombox-menu';

@Component({
  selector: 'ngx-ecombox',
  templateUrl: './ecombox.component.html',
  styleUrls: ['./ecombox.component.scss'],
})
export class EcomboxComponent implements OnInit{

  public displayAnnounce: boolean = false;
  public announce: string;
  public url: string;

  menu = MENU_ECOMBOX_ITEMS;

  constructor(private generalService: GeneralService) {}

  ngOnInit(): void {
    this.generalService.getAnnounce().subscribe(response => {
      if (response) {
        this.announce = response.message;
        this.url = response.url;
        if (!response.display || (response.version === environment.ecomboxVersion)) {
          this.displayAnnounce = false;
        } else {
          this.displayAnnounce = response.display;
        }
      }
    }, (error: any) => {
        console.error('ERROR : ' + error);
    });

  }

  public onClose(): void {
    this.displayAnnounce = false;
  }

}
