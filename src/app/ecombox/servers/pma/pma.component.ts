import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { SolarData } from '../../../@core/data/solar';
import { takeWhile } from 'rxjs/operators';
import { RestService } from '../../services/rest.service';

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
  selector: 'ngx-pma',
  templateUrl: './pma.component.html',
  styleUrls: ['./pma.component.scss']
})
export class PmaComponent implements OnInit, OnDestroy {

  loading = false;
  private alive = true;
  solarValue: number;
  ipDocker: string;
  portNginx: string;
  port: string;
  nameContainer: string;
  statusCardsPresta: string;
  commonStatusCardsPrestaSet: Array<CardSettings> = [];
  statusCardsPrestaByThemes: {
	  corporate: Array<CardSettings>;
  } = {
	  corporate: this.commonStatusCardsPrestaSet
  };
  /*
  statusCardsOdoo: string;
  commonStatusCardsOdooSet: Array<CardSettings> = [];
  statusCardsOdooByThemes: {
	  corporate: Array<CardSettings>;
  } = {
	  corporate: this.commonStatusCardsOdooSet
  };
  */
  statusCardsBlog: string;
  commonStatusCardsBlogSet: Array<CardSettings> = [];
  statusCardsBlogByThemes: {
	  corporate: Array<CardSettings>;
  } = {
	  corporate: this.commonStatusCardsBlogSet
  };
  statusCardsWoo: string;
  commonStatusCardsWooSet: Array<CardSettings> = [];
  statusCardsWooByThemes: {
	  corporate: Array<CardSettings>;
  } = {
	  corporate: this.commonStatusCardsWooSet
  };

  constructor(private themeService: NbThemeService,
	private solarService: SolarData,
	private dockerService: RestService) { 
  }

  reloadCards(){
	this.commonStatusCardsPrestaSet.splice(0, this.commonStatusCardsPrestaSet.length);
	//this.commonStatusCardsOdooSet.splice(0, this.commonStatusCardsOdooSet.length);
	this.commonStatusCardsBlogSet.splice(0, this.commonStatusCardsBlogSet.length);
	this.commonStatusCardsWooSet.splice(0, this.commonStatusCardsWooSet.length);
	this.displayContainers();
}

  private displayContainers() {

	  const listPma = [];

	//recupération des serveurs phpMyAdmin existant
	this.dockerService.getContainersByFiltre('{"name": ["^pma"]}').subscribe((dataPma: Array<any>) => {
		let nom : string;
		let servPma = {
			nomPma : "",
			portPma : ""
		};
		dataPma.forEach((containerPma: any) => {
			nom = containerPma.Names[0];
			nom = nom.slice(1, nom.length);
			servPma = {
				nomPma : nom,
				portPma : containerPma.Ports[0].PublicPort
			};

			listPma.push(servPma);
		})

		//récupération des prestashop
		this.dockerService.getContainersByFiltre('{"name": ["^prestashop"], "status": ["running"]}').subscribe((dataPresta: Array<any>) => {

			let name: string;
			let nameType: string;
			let nameDb: string;
			let portPma : string;
			let status: boolean;
			let actif: string;

			dataPresta.forEach((containerPresta: any) => {
				name = containerPresta.Names[0];
				name = name.slice(1, name.length);

				nameType = name.slice(0,13);
				nameDb = "prestashop-db";
				if (nameType != nameDb) {
					//verification de l'existence d'un serveur PMA associé et récupération du port d'écoute
					let search =  listPma.find(pma => pma.nomPma === 'pma_' + containerPresta.Labels["com.docker.compose.project"]);

					if (search){
						status = true;
						portPma = search.portPma;
						actif = "active";
					}
					else{
						status = false;
						portPma = "";
						actif = "desactive";
					}

					let cardPresta: CardSettings = {
						title: name,
						iconClass: 'nb-power-circled',
						id: containerPresta.Id,
						type: 'success',
						on: status,
						actif: actif,
						//url: 'http://' + this.ipDocker + ':' + portPma,
						url: 'http://' + this.ipDocker + ':' + this.portNginx + "/pma-" + containerPresta.Labels["com.docker.compose.project"] + "/",
						typeContainer: 'prestashop',
						nameStack: containerPresta.Labels["com.docker.compose.project"]
					};
					
					this.commonStatusCardsPrestaSet.push(cardPresta);

				}
			})
		});

		/*
		//récupération des odoo
		this.dockerService.getContainersByFiltre('{"name": ["^odoo"]}').subscribe((dataOdoo: Array<any>) => {

			let name: string;
			let nameType: string;
			let nameDb: string;
			let portPma : string;
			let status: boolean;
			let actif: string;

			dataOdoo.forEach((containerOdoo: any) => {
				name = containerOdoo.Names[0];
				name = name.slice(1, name.length);

				nameType = name.slice(0,7);
				nameDb = "odoo-db";
				if (nameType != nameDb) {
					//verification de l'existence d'un serveur PMA associé et récupération du port d'écoute
					let search =  listPma.find(pma => pma.nomPma === 'pma_' + containerOdoo.Labels["com.docker.compose.project"]);

					if (search){
						status = true;
						portPma = search.portPma;
						actif = "active";
					}
					else{
						status = false;
						portPma = "";
						actif = "desactive";
					}

					let cardOdoo: CardSettings = {
						title: name,
						iconClass: 'nb-power-circled',
						id: containerOdoo.Id,
						type: 'success',
						on: status,
						actif: actif,
						url: 'http://' + this.ipDocker + ':' + portPma,
						typeContainer: 'odoo',
						nameStack: containerOdoo.Labels["com.docker.compose.project"]
					};
					
					this.commonStatusCardsOdooSet.push(cardOdoo);

				}

			})
		});
		*/

		//récupération des blog
		this.dockerService.getContainersByFiltre('{"name": ["^blog"], "status": ["running"]}').subscribe((dataBlog: Array<any>) => {

			let name: string;
			let nameType: string;
			let nameDb: string;
			let portPma : string;
			let status: boolean;
			let actif: string;

			dataBlog.forEach((containerBlog: any) => {
				name = containerBlog.Names[0];
				name = name.slice(1, name.length);

				nameType = name.slice(0,7);
				nameDb = "blog-db";
				if (nameType != nameDb) {
					//verification de l'existence d'un serveur PMA associé et récupération du port d'écoute
					let search =  listPma.find(pma => pma.nomPma === 'pma_' + containerBlog.Labels["com.docker.compose.project"]);

					if (search){
						status = true;
						portPma = search.portPma;
						actif = "active";
					}
					else{
						status = false;
						portPma = "";
						actif = "desactive";
					}

					let cardBlog: CardSettings = {
						title: name,
						iconClass: 'nb-power-circled',
						id: containerBlog.Id,
						type: 'success',
						on: status,
						actif: actif,
						//url: 'http://' + this.ipDocker + ':' + portPma,
						url: 'http://' + this.ipDocker + ':' + this.portNginx + "/pma-" + containerBlog.Labels["com.docker.compose.project"] + "/",
						typeContainer: 'blog',
						nameStack: containerBlog.Labels["com.docker.compose.project"]
					};
					
					this.commonStatusCardsBlogSet.push(cardBlog);

				}

			})
		});

		//récupération des woocommerce
		this.dockerService.getContainersByFiltre('{"name": ["^woocommerce"], "status": ["running"]}').subscribe((dataWoo: Array<any>) => {

			let name: string;
			let nameType: string;
			let nameDb: string;
			let portPma : string;
			let status: boolean;
			let actif: string;

			dataWoo.forEach((containerWoo: any) => {
				name = containerWoo.Names[0];
				name = name.slice(1, name.length);

				nameType = name.slice(0,14);
				nameDb = "woocommerce-db";
				if (nameType != nameDb) {
					//verification de l'existence d'un serveur PMA associé et récupération du port d'écoute
					let search =  listPma.find(pma => pma.nomPma === 'pma_' + containerWoo.Labels["com.docker.compose.project"]);

					if (search){
						status = true;
						portPma = search.portPma;
						actif = "active";
					}
					else{
						status = false;
						portPma = "";
						actif = "desactive";
					}

					let cardWoo: CardSettings = {
						title: name,
						iconClass: 'nb-power-circled',
						id: containerWoo.Id,
						type: 'success',
						on: status,
						actif: actif,
						//url: 'http://' + this.ipDocker + ':' + portPma,
						url: 'http://' + this.ipDocker + ':' + this.portNginx + "/pma-" + containerWoo.Labels["com.docker.compose.project"] + "/",
						typeContainer: 'woocommerce',
						nameStack: containerWoo.Labels["com.docker.compose.project"]
					};
					
					this.commonStatusCardsWooSet.push(cardWoo);

				}

			})
		});


	});


}

ngOnDestroy() {
	this.alive = false;
}

ngOnInit() {
		this.dockerService.inspectContainerByName('portainer-proxy').subscribe((data: any) => {
			//l'IP de docker est stockée dans le tableau Env[] et la valeur commence toujours par "URL_UTILE:" il faut donc supprimer les 10 premiers caractères
			for (let i in data.Config.Env) {
				if(data.Config.Env[i].includes('URL_UTILE')){
					this.ipDocker = data.Config.Env[i].slice(10);
				}
			}
			
			//this.displayContainers();
		});

		this.dockerService.inspectContainerByName('nginx').subscribe((data: any) => {
			// la valeur à récupérer dans Env[] commence toujours par 'NGINX_PORT:' il faut donc supprimer les 11 premiers caractères
			let tabEnv = [];
			let port: string;

			tabEnv = data.Config.Env;
			tabEnv.forEach(function (env) {
				//recherche du port de NGINX
				if (env.slice(0, 10) === 'NGINX_PORT') {
					port = env.slice(11);
				}

			});
			this.portNginx = port;

			this.displayContainers();
		});


		this.themeService.getJsTheme()
			.pipe(takeWhile(() => this.alive))
			.subscribe(theme => {
				this.statusCardsPresta = this.statusCardsPrestaByThemes[theme.name];
				//this.statusCardsOdoo = this.statusCardsOdooByThemes[theme.name];
				this.statusCardsWoo = this.statusCardsWooByThemes[theme.name];
				this.statusCardsBlog = this.statusCardsBlogByThemes[theme.name];
			});

		this.solarService.getSolarData()
			.pipe(takeWhile(() => this.alive))
			.subscribe((data) => {
				this.solarValue = data;
			});
	}

}
