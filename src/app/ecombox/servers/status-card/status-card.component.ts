import { Component, Input } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { ServerModelComponent } from '../../servers/server-model/server-model.component';
import { NbDialogService } from '@nebular/theme';
import { DialogNamePromptComponent } from '../../servers/dialog-name-prompt/dialog-name-prompt.component';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'ngx-test-status-card',
	styleUrls: ['./status-card.component.scss'],
	template: `
    <nb-card [ngClass]="{'off': !on}" [nbSpinner]="loading" nbSpinnerStatus="success">
      <div class="icon-container">
	<div class="icon {{ type }}" (click)="onClick()">
        <i ngClass="nb-power-circled"></i>
          <!--<ng-content></ng-content>-->
        </div>
      </div>

      <div class="details">
	<div class="title">{{ title }}</div>
	<div class="status">{{ on ? 'Démarré' : 'Arrêté' }}</div>
	<!--<div class="title" *ngIf="on">URL: <a href="{{ url }}" target="_blank">{{ url }}</a></div>-->
	<div class="title" *ngIf="on"><a href="{{ url }}" title="{{ url }}" target="_blank">Accéder au site</a> {{ mdp }}</div>
      </div>
      <div class="bt-suppr">
	<button type="button" class="btn btn-outline-danger btn-icon" (click)="confirmSuppr()">
	  <i class="nb-close"></i>
	</button>
       </div>
    </nb-card>
  `,
})
export class StatusCardComponent {

	@Input() title: string;
	@Input() type: string;
	@Input() id: string;
	@Input() on: boolean;
	@Input() url: string;
	@Input() mdp: string;
	@Input() typeContainer: string;
	@Input() nameStack: string;
	@Input() nameImage: string;
	@Input() HTTP_PROXY: string;
	@Input() HTTPS_PROXY: string;
	@Input() NO_PROXY: string;
	@Input() http_proxy: string;
	@Input() https_proxy: string;
	@Input() no_proxy: string;

	constructor(private dockerService: RestService,
		private servModel: ServerModelComponent,
		private dialogService: NbDialogService,
		private toastr: ToastrService
	) { 
		this.toastr.toastrConfig.timeOut = 5000;
	}

	loading = false;
	nameBdd: string;
	valid: string;
	retryAttempt: number = 3;
	lePort: string;
	idStack: string;
	nameImageDb: string;

	public onClick() {
		//nom du serveur de base de données associé au container principal
		this.nameBdd = this.typeContainer + "-db-" + this.title.slice(this.typeContainer.length + 1);

		if (!this.on) {
			//activation du spinner	    
			this.loading = true;

			//démarrage du container de base de données associé au container principal
			this.dockerService.startContainer(this.nameBdd).subscribe((data: any) => {

				//démarrage du container principal                  
				this.dockerService.startContainer(this.id).subscribe((data: any) => {

					//mise à jour du stack (pour gérer les mises à jour de variables d'env en cas de proxy)
					//id: idStack - voir requete ci-dessous, server: this.typeContainer, nameStack: this.nameStack, imageBdd: string, nameContainerBdd: this.nameBdd, 
					//imageContainer: string, nameContainer: this.title
					this.dockerService.getStacks().subscribe((data: Array<any>) => {
						data.forEach((stack: any) => {
							//recuperation de l'Id du stack nécessaire pour l'appel de updateStack
							if (stack.Name == this.nameStack) {
								this.idStack = stack.Id;
							}
						})

						//recupération de l'image du container de Bdd
						this.dockerService.inspectContainerByName(this.nameBdd).subscribe((data: any) => {
							let nameImageDb: string;
							nameImageDb = data.Image;

							let mdpBdd: string = "";
							let mdpRootBdd: string = "";
							let listEnv: [];
							listEnv = data.Config.Env;
							listEnv.forEach(function (env: string) {
								//recherche des mdp pour la bdd
								if (env.slice(0,14) === 'MYSQL_PASSWORD') {
									mdpBdd = env.slice(15);
								}
								else if (env.slice(0,17) === 'POSTGRES_PASSWORD') {
									mdpBdd = env.slice(18);
								}

								if (env.slice(0,19) === 'MYSQL_ROOT_PASSWORD') {
									mdpRootBdd = env.slice(20);
								}
							});

							//console.log("Démarrage du PUT : ");
							let start = Date.now();
							this.dockerService.updateStack(this.idStack,this.typeContainer,this.nameStack,nameImageDb,this.nameBdd,this.nameImage,this.title,this.HTTP_PROXY,this.HTTPS_PROXY,this.NO_PROXY,this.http_proxy,this.https_proxy,this.no_proxy, mdpBdd, mdpRootBdd).subscribe((data: any) => {
								//execution de la requete pour re-recupérer les infos actualisées (dont l'url avec le port)
								this.dockerService.getContainersByFiltre('{"name": ["' + this.title + '"]}').subscribe((data: Array<any>) => {
									data.forEach((container: any) => {
										let fin = (Date.now() - start)/1000;
										//console.log("Secondes écoulées à la fin du PUT : " + fin);
										//execution des commandes docker exec pour les serveurs prestashop et wordpress
										let cmd: string;
		
										/*if (container.Ports[0].PublicPort == null) {
											this.lePort = container.Ports[1].PublicPort;
										} else {
											this.lePort = container.Ports[0].PublicPort;
										}*/
		
										switch (this.typeContainer) {
											case 'prestashop':
											case 'blog':
											case 'woocommerce':
											case 'kanboard':
												cmd = '/tmp/config-site.sh ' + this.servModel.ipDocker + ' ' + this.servModel.portNginx + ' ' + this.nameBdd ;
												this.launchExec(this.title, cmd, this.retryAttempt);
												break;
		
											default:
												this.on = !this.on;
												this.servModel.reloadCards();
												//arret du spinner
												this.loading = false;
												this.toastr.success('Le site '+ this.title +' est démarré ');
												break;
										}
		
									}, (error: any) => {
										this.loading = false;
										this.toastr.toastrConfig.timeOut = 10000;
										this.toastr.error('Une erreur est survenue lors de la récupération des informations du site '+ this.title +'. Vous devez le stopper puis le démarrer');
										this.toastr.toastrConfig.timeOut = 5000;
									});
		
								}, (error: any) => {
									this.loading = false;
									this.toastr.error('Une erreur est survenue lors de la récupération des informations du site '+ this.title +'. Vous devez le stopper puis le démarrer');
								});
							}, (error: any) => {
								this.loading = false;
								this.toastr.error('Une erreur est survenue lors de la récupération des informations du site '+ this.title +'. Vous devez le stopper puis le démarrer');
							});

						});

					});

				}, (error: any) => {
						//arret du serveur de bdd associé au container principal
						this.dockerService.stopContainer(this.nameBdd).subscribe((data: any) => {
							this.loading = false;
							this.toastr.error('Le site n\'a pas pu être démarré. Veuillez retenter l\'opération.');
						}, (error: any) => {
							this.loading = false;
							this.toastr.error('Le site n\'a pas pu être démarré. Veuillez vérifier l\'environnement.');
						});						
				});
			}, (error: any) => {
				this.loading = false;
				this.toastr.error('Le site n\'a pas pu être démarré. Veuillez retenter l\'opération.');
			});

		} else {
			//activation du spinner
			this.loading = true;

			//arret du serveur de bdd associé au container principal
			this.dockerService.stopContainer(this.nameBdd).subscribe((data: any) => {

				//arret du container principal
				this.dockerService.stopContainer(this.id).subscribe((data: any) => {

					//arret du spinner
					this.loading = false;
					this.toastr.success('Le site '+ this.title +' est arreté ');
					this.on = !this.on;
					this.servModel.reloadCards();
				}, (error: any) => {
					this.loading = false;
					this.toastr.error('Le site '+ this.title +' n\'a pas pu être démarré. Veuillez retenter l\'opération.');
				});
			}, (error: any) => {
				if (error.status === 304){
					//le container de bdd est déjà stoppé
					//arret du container principal
					this.dockerService.stopContainer(this.id).subscribe((data: any) => {
						//arret du spinner
						this.loading = false;
						this.toastr.success('Le site '+ this.title +' est arreté ');
						this.on = !this.on;
						this.servModel.reloadCards();
					}, (error: any) => {
						if (error.status === 304){
							//le container de bdd est déjà stoppé
							this.loading = false;
							this.toastr.success('Le site '+ this.title +' est arreté ');
							this.on = !this.on;
							this.servModel.reloadCards();							
						}
						else {
							this.loading = false;
							this.toastr.error('Le site '+ this.title +' n\'a pas pu être stoppé. Veuillez retenter l\'opération.');
						}
					});
				} else {
					this.loading = false;
					this.toastr.error('Le site '+ this.title +' n\'a pas pu être stoppé. Veuillez retenter l\'opération.');
				}
			});
		}
	}

	public confirmSuppr() {
		this.dialogService.open(DialogNamePromptComponent)
			.onClose.subscribe(name => {
				this.valid = name;
				if (name == "oui") {
					this.supprContainer();
				}
			});
	}

	public supprContainer() {

		//activation du spinner
		this.loading = true;

		let idStack: string;
		let nameSftpStack: string = "sftp" + this.nameStack;
		let namePmaStack: string = "pma" + this.nameStack;

		this.dockerService.getStacks().subscribe((data: Array<any>) => {
			const listStacks = [];
			data.forEach((stack: any) => {
				//recuperation de l'Id du stack à supprimer ainsi que du stack SFTP et/ou PMA associé si ils existent
				if ((stack.Name == this.nameStack) || (stack.Name == nameSftpStack) || (stack.Name == namePmaStack)) {
					idStack = stack.Id;
					listStacks.push(idStack);
				}
			})

			this.dockerService.deleteListStacks(listStacks).subscribe(res => {
				res.forEach(idStacks => {
					//console.log("stack " + idStacks + " supprimé");
				});
				this.dockerService.purgeVolumes().subscribe((data: any) => {
					this.servModel.reloadCards();
					this.loading = false;
					this.toastr.success("Le site " + this.title + " a été supprimé.");
				});

			});
		});
	}

	private launchExec(name: string, cmd: string, retry: number) {

		const sleep = (milliseconds) => {
			return new Promise(resolve => setTimeout(resolve, milliseconds))
		}

		this.dockerService.runExecInstance(name, cmd).subscribe((data: any) => {
			this.on = !this.on;
			this.servModel.reloadCards();

			this.toastr.success('Le site '+ this.title +' est démarré.');
			//arret du spinner
			this.loading = false;
		}, (error: any) => {
			if (error.status === 607) {
				if (retry > 0) {
					retry = retry - 1;
					sleep(10000).then(() => {
						this.launchExec(name, cmd, retry--);
					})
				} else {
					this.dockerService.stopContainer(this.nameBdd).subscribe((data: any) => {

						//arret du container principal
						this.dockerService.stopContainer(this.id).subscribe((data: any) => {
							this.on = !this.on;
							this.servModel.reloadCards();
							this.toastr.error('Une erreur est survenue, veuillez retenter l\'opération.');
							//arret du spinner
							this.loading = false;
							
						}, (error: any) => {
							this.on = !this.on;
							this.servModel.reloadCards();
							//arret du spinner
							this.loading = false;
						});
					}, (error: any) => {
						this.on = !this.on;
						this.servModel.reloadCards();
						//arret du spinner
						this.loading = false;
					});
				}
			}
		});
	}

}
