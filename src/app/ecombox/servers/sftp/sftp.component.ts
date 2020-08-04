import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { SolarData } from '../../../@core/data/solar';
import { takeWhile } from 'rxjs/operators';
import { RestService } from '../../services/rest.service';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

interface CardSettings {
	title: string;
	iconClass: string;
	id: string;
	type: string;
	on: boolean;
	actif: string;
	url: string;
	typeContainer: string;
	nameStack: string;
}

@Component({
	selector: 'ngx-sftp',
	templateUrl: './sftp.component.html',
	styleUrls: ['./sftp.component.scss']
})
export class SftpComponent implements OnInit, OnDestroy {

	noSitePresta: string;
	noSiteOdoo: string;
	nomsSftp = [];
	listSftp = [];
	loading = false;
	private alive = true;
	solarValue: number;
	ipDocker: string;
	port: string;
	nameContainer: string;
	HTTP_PROXY: string;
	HTTPS_PROXY: string;
	NO_PROXY: string;
	http_proxy: string;
	https_proxy: string;
	no_proxy: string;
	statusCardsPresta: string;
	commonStatusCardsPrestaSet: Array<CardSettings> = [];
	statusCardsPrestaByThemes: {
		corporate: Array<CardSettings>;
	} = {
			corporate: this.commonStatusCardsPrestaSet
		};
	statusCardsOdoo: string;
	commonStatusCardsOdooSet: Array<CardSettings> = [];
	statusCardsOdooByThemes: {
		corporate: Array<CardSettings>;
	} = {
			corporate: this.commonStatusCardsOdooSet
		};

	constructor(private themeService: NbThemeService,
		private solarService: SolarData,
		private dockerService: RestService) {
	}

	reloadCards() {
		this.commonStatusCardsPrestaSet.splice(0, this.commonStatusCardsPrestaSet.length);
		this.commonStatusCardsOdooSet.splice(0, this.commonStatusCardsOdooSet.length);
		this.displayContainers();
	}

	//supprime les stacks SFTP non opérationnels
	//par exemple si e-comBox est coupé sans que les SFTP n'aient été désactivés avant
	//leur état sera "exited"
	//voir si il faut gérer d'autres états
	private deleteSftp(){
		this.dockerService.getContainersByFiltre('{"name": ["^sftp"], "status": ["exited"]}').subscribe((dataSftpExit: Array<any>) => {
			dataSftpExit.forEach((containerSftpExit: any) => {
				//recupération de l'id du stack
				let idStack: string;
				let nameStack: string;
				nameStack = "sftp" + containerSftpExit.Names[0].slice(6);
				this.dockerService.getStacks().subscribe((data: Array<any>) => {
					data.forEach((stack: any) => {
					  if (stack.Name === nameStack) {
						idStack = stack.Id;	  
						this.dockerService.deleteStack(idStack).subscribe((data: any) => {
							console.log("stack SFTP supprimé");
						});
					  }
					});
				  });
			})
		});
	}

	//recupère la liste des stacks SFTP opérationnels
	private displayContainers() {
		this.loading = true;
		let mdp: string;
		let servSftp = {
			nomSftp: "",
			portSftp: "",
			mdpSftp: ""
		};

		this.nomsSftp.splice(0, this.nomsSftp.length);
		this.listSftp.splice(0, this.listSftp.length);

		//recupération des serveurs SFTP existant
		this.dockerService.getContainersByFiltre('{"name": ["^sftp"], "label":["com.docker.compose.app=ecombox-sftp"]}').subscribe((dataSftp: Array<any>) => {
			let nom: string;

			if(dataSftp.length > 0){
				dataSftp.forEach((containerSftp: any) => {
					nom = containerSftp.Names[0];
					nom = nom.slice(1, nom.length);
					this.nomsSftp.push(nom);
				})

				//la recupération du mot de passe dans la variable d'environnement SFTP_PASS
				//ne peuvent se faire qu'avec une requête "inspect"
				//getSftpInfos permet d'enchainer l'ensemble des requêtes inspect nécessaires et de poursuivre
				//qu'une fois l'ensemle des infos récupérées
				this.dockerService.getSftpInfos(this.nomsSftp).subscribe(res => {
					res.forEach(sftp => {
						let listEnv: [];
						listEnv = sftp.Config.Env;
						listEnv.forEach(function (env: string) {
							//recherche du mdp pour la bdd
							if (env.slice(0,10) === 'SFTP_PASS=') {
								mdp = env.slice(10);
							}
						});
	
						servSftp = {
							nomSftp: sftp.Name.slice(1,sftp.Name.length),
							portSftp: sftp.NetworkSettings.Ports['22/tcp']['0']['HostPort'],
							mdpSftp: mdp
						};

						this.listSftp.push(servSftp);	
					})

					this.recupListSites();
				});

			}
			else{
				this.recupListSites();
			}

		});

	}

	recupListSites() {
		//récupération des prestashop
		this.dockerService.getContainersByFiltre('{"name": ["^prestashop"], "status": ["running"], "label":["com.docker.compose.app=ecombox"]}').subscribe((data: Array<any>) => {

			let name: string;
			let portSftp: string;
			let mdpSftp: string;
			let status: boolean;
			let actif: string;
				
			if(data.length === 0) {
				this.noSitePresta = "Aucun site Prestashop démarré.";
			}
			else {
				this.noSitePresta = "";
			}

			data.forEach((containerPresta: any) => {
				name = containerPresta.Names[0];
				name = name.slice(1, name.length);

				//verification de l'existence d'un serveur SFTP associé et récupération du port d'écoute
				let search = this.listSftp.find(sftp => sftp.nomSftp === 'sftp_' + containerPresta.Labels["com.docker.compose.project"]);

				if (search) {
					status = true;
					portSftp = search.portSftp;
					mdpSftp = search.mdpSftp;
					actif = "active";
				}
				else {
					status = false;
					portSftp = "";
					actif = "desactive";
				}

				let cardPresta: CardSettings = {
					title: name,
					iconClass: 'nb-power-circled',
					id: containerPresta.Id,
					type: 'success',
					on: status,
					actif: actif,
					url: 'Hôte : ' + this.ipDocker + ' Port : ' + portSftp + ' MDP : ' + mdpSftp,
					typeContainer: 'prestashop',
					nameStack: containerPresta.Labels["com.docker.compose.project"]
				};

				this.commonStatusCardsPrestaSet.push(cardPresta);
			})

			this.loading = false;
		});

		//récupération des odoo
		this.dockerService.getContainersByFiltre('{"name": ["^odoo"], "status": ["running"], "label":["com.docker.compose.app=ecombox"]}').subscribe((data: Array<any>) => {

			let name: string;
			let portSftp: string;
			let mdpSftp: string;
			let status: boolean;
			let actif: string;

			if(data.length === 0) {
				this.noSiteOdoo = "Aucun site Odoo démarré.";
			}
			else {
				this.noSiteOdoo = "";
			}

			data.forEach((containerOdoo: any) => {
				name = containerOdoo.Names[0];
				name = name.slice(1, name.length);

				//verification de l'existence d'un serveur SFTP associé et récupération du port d'écoute
				let search = this.listSftp.find(sftp => sftp.nomSftp === 'sftp_' + containerOdoo.Labels["com.docker.compose.project"]);

				if (search) {
					status = true;
					portSftp = search.portSftp;
					mdpSftp = search.mdpSftp;
					actif = "active";
				}
				else {
					status = false;
					portSftp = "";
					actif = "desactive";
				}

				let cardOdoo: CardSettings = {
					title: name,
					iconClass: 'nb-power-circled',
					id: containerOdoo.Id,
					type: 'success',
					on: status,
					actif: actif,
					url: 'Hôte : ' + this.ipDocker + ' Port : ' + portSftp + ' Mdp : ' + mdpSftp,
					typeContainer: 'odoo',
					nameStack: containerOdoo.Labels["com.docker.compose.project"]
				};

				this.commonStatusCardsOdooSet.push(cardOdoo);
			})
			this.loading = false;
		});
	}

	ngOnDestroy() {
		this.alive = false;
	}

	ngOnInit() {

		this.dockerService.inspectContainerByName('portainer-proxy').subscribe((data: any) => {
			// la valeur à récupérer dans Env[] commence toujours par 'URL_UTILE:' il faut donc supprimer les 10 premiers caractères
			// this.ipDocker = data.Config.Env[0].slice(10);
			let tabEnv = [];
			let ip: string;
			let HTTP_PROXY: string;
			let HTTPS_PROXY: string;
			let NO_PROXY: string;
			let http_proxy: string;
			let https_proxy: string;
			let no_proxy: string;

			tabEnv = data.Config.Env;
			tabEnv.forEach(function (env) {
				//recherche de l'IP de docker
				if (env.slice(0, 9) === 'URL_UTILE') {
					ip = env.slice(10);
				}

				//recherche des variables d'env pour le cas où un proxy est configuré
				if (env.slice(0,10) === 'HTTP_PROXY'){
					HTTP_PROXY = env.slice(11);
				}
				else if (env.slice(0,11) === 'HTTPS_PROXY'){
					HTTPS_PROXY = env.slice(12);
				}
				else if (env.slice(0,8) === 'NO_PROXY'){
					NO_PROXY = env.slice(9);
				}
				else if (env.slice(0,10) === 'http_proxy'){
					http_proxy = env.slice(11);
				}
				else if (env.slice(0,11) === 'https_proxy'){
					https_proxy = env.slice(12);
				}
				else if (env.slice(0,8) === 'no_proxy'){
					no_proxy = env.slice(9);
				}

			});
			this.ipDocker = ip;
			this.HTTP_PROXY = HTTP_PROXY;
			this.HTTPS_PROXY = HTTPS_PROXY;
			this.NO_PROXY = NO_PROXY;
			this.http_proxy = http_proxy;
			this.https_proxy = https_proxy;
			this.no_proxy = no_proxy;

			this.deleteSftp();

			this.displayContainers();
		});

		this.themeService.getJsTheme()
			.pipe(takeWhile(() => this.alive))
			.subscribe(theme => {
				this.statusCardsPresta = this.statusCardsPrestaByThemes[theme.name];
				this.statusCardsOdoo = this.statusCardsOdooByThemes[theme.name];
			});

		this.solarService.getSolarData()
			.pipe(takeWhile(() => this.alive))
			.subscribe((data) => {
				this.solarValue = data;
			});
	}

}
