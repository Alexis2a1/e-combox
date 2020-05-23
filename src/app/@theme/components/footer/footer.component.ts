import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">Created with ♥ by <b><a href="https://llb.ac-corse.fr" 
    target="_blank">BTS SIO - LLB</a> & <a href="https://www.reseaucerta.org" 
    target="_blank">Certa</a></b> 2020 - version en développement</span>
    <div class="socials">
      <a href="https://www.reseaucerta.org" target="_blank"><img src="assets/images/logoCerta.gif" height="40"></a>
      <!--<a href="#" target="_blank" class="ion ion-social-github"></a>
      <a href="#" target="_blank" class="ion ion-social-facebook"></a>
      <a href="#" target="_blank" class="ion ion-social-twitter"></a>
      <a href="#" target="_blank" class="ion ion-social-linkedin"></a>-->
    </div>
  `,
})
export class FooterComponent {
}
