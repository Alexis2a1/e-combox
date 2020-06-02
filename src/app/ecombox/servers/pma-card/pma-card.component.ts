import { Component, Input } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { PmaComponent } from '../../servers/pma/pma.component';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'ngx-test-pma-card',
  styleUrls: ['./pma-card.component.scss'],
  template: `
    <nb-card [ngClass]="{'off': !on}" [nbSpinner]="loading" nbSpinnerStatus="success">
    <div class="icon-container">
      <div class="icon {{ type }}" (click)="onClick()">
        <i ngClass="nb-angle-double-right"></i>
      </div>
    </div>
    <div class="details">
      <div class="title">{{ title }}</div>
      <div><br/></div>
      <div class="status">{{ on ? '' : 'Cliquer pour activer phpMyAdmin' }}</div>
      <div class="title" *ngIf="on">URL: <a href="{{ url }}" target="_blank">{{ url }}</a></div>
    </div>
    <div class="etat {{ actif }}">
      <i><b>{{ on ? 'PMA activé' : 'PMA désactivé' }}</b></i>
    </div>
  </nb-card>

  `,
})
export class PmaCardComponent {

  @Input() title: string;
  @Input() type: string;
  @Input() id: string;
  @Input() on: boolean;
  @Input() url: string;
  @Input() typeContainer: string;
  @Input() nameStack: string;
  @Input() actif: string;

  constructor(private dockerService: RestService, 
    private servPma: PmaComponent,
    private toastr: ToastrService) { 
      this.toastr.toastrConfig.timeOut = 5000;
    }

  loading = false;

  public onClick(){
    if(!this.on) {
      //activation du spinner
      this.loading = true;

      //recupération du suffixe
      let suffixe: string;
			  //selon le type de serveur
			  switch(this.typeContainer) {
				  case "prestashop": {
            suffixe = this.title.slice(10, this.title.length);
					  break;
				  }

				  case "blog": {
					  suffixe = this.title.slice(4, this.title.length);
					  break;
				  }
				  
				  case "woocommerce": {
					  suffixe = this.title.slice(11, this.title.length);
					  break;
          }
          
				  case "odoo": {
					  suffixe = this.title.slice(4, this.title.length);
					  break;
				  }

        }

      //récupération de DB_PASS pour l'accès à la base de données
      this.dockerService.inspectContainerByName(this.typeContainer + suffixe).subscribe((data: any) => {
        let mdp : string = "";
        let listEnv: [];
        listEnv = data.Config.Env;
        listEnv.forEach(function (env: string) {
          //recherche du mdp pour la bdd
          if (env.slice(0,8) === 'DB_PASS=') {
            mdp = env.slice(8);
          }
        });

        this.dockerService.createStackPma(this.typeContainer,this.nameStack, suffixe, mdp).subscribe((data: any) => {
          this.actif= "active";
          this.on = !this.on;
          this.servPma.reloadCards();
          
          //arret du spinner
          this.loading = false;
          this.toastr.success('phpMyAdmin est activé pour '+ this.title);
        },
        (error: any) => {
          this.loading = false;
          this.toastr.error("phpMyAdmin n'a pas été démarré pour " + this.title + ", veuillez retenter l'opération");
        });

      });

    } 
    else {
      //activation du spinner
      this.loading = true;
      let idStack: string;
      let namePmaStack: string = "pma" + this.nameStack;

      this.dockerService.getStacks().subscribe((data: Array<any>) => {
        data.forEach((stack: any) => {
          if (stack.Name == namePmaStack) {
            idStack = stack.Id;	  
            this.dockerService.deleteStack(idStack).subscribe((data: any) => {
              this.actif= "desactive";
              this.on = !this.on;
              this.servPma.reloadCards();
              this.loading = false;
              this.toastr.success('phpMyAdmin est désactivé pour '+ this.title);
            });
          }
        });
      },
      (error: any) => {
        this.loading = false;
        this.toastr.error("phpMyAdmin n'a pas été désactivé pour " + this.title + ", veuillez retenter l'opération");
      });

    }
    
  }

}
