import { Component, Input } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { SftpComponent } from '../../servers/sftp/sftp.component';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'ngx-test-sftp-card',
  styleUrls: ['./sftp-card.component.scss'],
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
      <div class="status">{{ on ? '' : 'Cliquer pour activer le SFTP' }}</div>
      <div class="title" *ngIf="on">{{ url }}</div>
    </div>
    <div class="etat {{ actif }}">
      <!--<button type="button" class="btn btn-danger shape-rectangle">
        <i>Désactivé</i>
      </button>-->
      <i><b>{{ on ? 'SFTP activé' : 'SFTP désactivé' }}</b></i>
    </div>
  </nb-card>

  `,
})
export class SftpCardComponent {

  @Input() title: string;
  @Input() type: string;
  @Input() id: string;
  @Input() on: boolean;
  @Input() url: string;
  @Input() typeContainer: string;
  @Input() nameStack: string;
  @Input() actif: string;

  constructor(private dockerService: RestService, 
    private servSftp: SftpComponent,
    private toastr: ToastrService) { 
      this.toastr.toastrConfig.timeOut = 5000;
    }

  loading = false;

  public onClick(){
    if(!this.on) {
      //activation du spinner
      this.loading = true;

      this.dockerService.createStackSftp(this.typeContainer,this.nameStack).subscribe((data: any) => {

        //si serveur Odoo, un docker exec est nécessaire
        if (this.typeContainer == "odoo"){
          let cmd: string;
          cmd = "chown -R 101:101 /home/adminOdoo/addons";
  
            this.dockerService.createExec(this.title,cmd).subscribe((data: any) => {
  
              this.dockerService.startExec(data.Id).subscribe((data: any) => {
  
                this.actif= "active";
                this.on = !this.on;
                this.servSftp.reloadCards();
                
                //arret du spinner
                this.loading = false;
                this.toastr.success('Le SFTP est activé pour '+ this.title);
  
              });
            });
        }
        else {
          this.actif= "active";
          this.on = !this.on;
          this.servSftp.reloadCards();
          
          //arret du spinner
          this.loading = false;
          this.toastr.success('Le SFTP est activé pour '+ this.title);
        }

      },
      (error: any) => {
        this.toastr.error("Le SFTP n'a pas été démarré pour " + this.title + ", veuillez retenter l'opération");
      });
    } 
    else {
      //activation du spinner
      this.loading = true;
      let idStack: string;
      let nameSftpStack: string = "sftp" + this.nameStack;

      this.dockerService.getStacks().subscribe((data: Array<any>) => {
        data.forEach((stack: any) => {
          if (stack.Name == nameSftpStack) {
            idStack = stack.Id;	  
            this.dockerService.deleteStack(idStack).subscribe((data: any) => {
              this.actif= "desactive";
              this.on = !this.on;
              this.servSftp.reloadCards();
              this.loading = false;
              this.toastr.success('Le SFTP est désactivé pour '+ this.title);
            });
          }
        });
      },
      (error: any) => {
        this.toastr.error("Le SFTP n'a pas été désactivé pour " + this.title + ", veuillez retenter l'opération");
      });

    }
    
  }

}
