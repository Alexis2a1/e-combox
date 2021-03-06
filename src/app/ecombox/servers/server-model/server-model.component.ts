import { Component, Input, OnInit, OnDestroy, TemplateRef} from '@angular/core';
import { NbThemeService, NbDialogConfig } from '@nebular/theme';
import { SolarData } from '../../../@core/data/solar';
import { takeWhile } from 'rxjs/operators';
import { RestService } from '../../services/rest.service';
import { NbToastrService } from '@nebular/theme';
import { ToastrService } from 'ngx-toastr';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import { ShowcaseDialogComponent } from '../../servers/showcase-dialog/showcase-dialog.component';

interface CardSettings {
	title: string;
	iconClass: string;
	id: string;
	type: string;
	on: boolean;
	url: string;
	typeContainer: string;
	nameStack: string;
	nameImage: string;
	HTTP_PROXY: string;
	HTTPS_PROXY: string;
	NO_PROXY: string;
	http_proxy: string;
	https_proxy: string;
	no_proxy: string;
}

@Component({
	selector: 'ngx-server-model',
	styleUrls: ['./server-model.component.scss'],
	templateUrl: './server-model.component.html',
})

export class ServerModelComponent implements OnInit, OnDestroy {
	@Input() nomServeur: string;
	@Input() typeServeur: string;
	@Input() ok: boolean = false;
	@Input() option: any;
	@Input() nomArt: string;
	@Input() isOdoo: boolean = false;
	@Input() isRunning : boolean;

	message: string;
	private alive = true;
	loading = false;
	loadingSite = false;
	ipDocker: string;
	HTTP_PROXY: string ='';
	HTTPS_PROXY: string ='';
	NO_PROXY: string ='';
	http_proxy: string ='';
	https_proxy: string ='';
	no_proxy: string ='';
	port: string;
	nameContainer: string;
	typeDb: string = '';
	solarValue: number;
	statusCards: string;
	commonStatusCardsSet: Array<CardSettings> = [];
	statusCardsByThemes: {
		corporate: Array<CardSettings>;
	} = {
			corporate: this.commonStatusCardsSet,
		};

	options = [
		{ value: 'vierge', label: 'vierge' },
		{ value: 'perso', label: 'Art Concept Stories' },
	];

	oldUrlWP: string;
	newUrlWP: string;
	retryAttempt: number = 1;
	id: string;
	nomBdd: string;
	lePort: string;
	nomSite: string;
	idStack;

	listURL = [];

	constructor(private themeService: NbThemeService,
		private solarService: SolarData,
		private dockerService: RestService,
		private toastrService: NbToastrService,
		private toastr: ToastrService,
		private dialogService: NbDialogService) {
			this.toastr.toastrConfig.timeOut = 10000;
		}

	checkRadio(val) {
		if (val === 'perso') {
			this.nomArt = 'art-';
		} else {
			this.nomArt = '';
		}
	}

	checkSuffixe(suffixe: string) {
		let cpt: number = 0;
		let newServeur: string;

		if (this.nomArt === 'art-') {
			newServeur = this.typeServeur + '-art-' + suffixe;
		} else {
			newServeur = this.typeServeur + '-' + suffixe;
		}

		this.commonStatusCardsSet.forEach(function (card) {
			if (newServeur === card.title) {
				cpt++;
			}

		});

		return cpt;
	}

	displayURL() {
		this.dialogService.open(ShowcaseDialogComponent, {
			context: {
				title: 'Liste des sites ' + this.typeServeur + ' avec leur URL',
				listURL: this.listURL,
				typeSite: this.typeServeur,
			}
		});
	}

	reloadCards() {
		this.displayContainers();
	}

	private displayContainers() {
		this.isRunning = false;
		this.commonStatusCardsSet.splice(0, this.commonStatusCardsSet.length);
		this.listURL.splice(0, this.listURL.length);

		this.dockerService.getContainersByFiltre('{"name": ["^' + this.typeServeur + '"]}').subscribe((data: Array<any>) => {
			data.forEach((container: any) => {
				let name: string = container.Names[0];
				name = name.slice(1, name.length);
				let nameType: string;
				let nameDb: string;
				let backOffice: string = '';
				let nameStack: string;
				let nameImage: string;

				// selon le type de serveur
				switch (this.typeServeur) {
					case 'prestashop': {
						nameType = name.slice(0, 13);
						backOffice = '/administration';
						break;
					}

					case 'blog': {
						nameType = name.slice(0, 7);
						backOffice = '/wp-admin';
						break;
					}

					case 'woocommerce': {
						nameType = name.slice(0, 14);
						backOffice = '/wp-admin';
						break;
					}

					case 'mautic': {
						nameType = name.slice(0, 9);
						break;
					}

					case 'suitecrm': {
						nameType = name.slice(0, 11);
						break;
					}

					case 'odoo': {
						nameType = name.slice(0, 7);
						backOffice = '/web/database/selector';
						break;
					}

					case 'kanboard': {
						nameType = name.slice(0, 11);
						break;
					}

					case 'humhub': {
						nameType = name.slice(0, 9);
						break;
					}

				}

				nameDb = this.typeServeur + '-db';

				if (nameType !== nameDb) {
					let status: boolean = false;
					this.nameContainer = name;

					if (container.State === 'running') {
						this.isRunning = true;
						status = true;
						if (container.Ports[0].PublicPort == null) {
							this.port = container.Ports[1].PublicPort;
						} else {
							this.port = container.Ports[0].PublicPort;
						}
						this.listURL.push({site: this.nameContainer, url: 'http://' + this.ipDocker + ':' + this.port + backOffice});

					}

					nameStack = container.Labels['com.docker.compose.project'];
					nameImage = container.Image;

					const testCard: CardSettings = {
						title: this.nameContainer,
						// défini l'icone du bouton démarrer/stopper un serveur
						iconClass: 'nb-power-circled',
						id: container.Id,
						type: 'success',
						on: status,
						url: 'http://' + this.ipDocker + ':' + this.port + backOffice,
						//url: 'http://' + this.ipDocker + ':9999/' + this.nameContainer + backOffice,
						typeContainer: this.typeServeur,
						nameStack: nameStack,
						nameImage: nameImage,
						HTTP_PROXY: this.HTTP_PROXY,
						HTTPS_PROXY: this.HTTPS_PROXY,
						NO_PROXY: this.NO_PROXY,
						http_proxy: this.http_proxy,
						https_proxy: this.https_proxy,
						no_proxy: this.no_proxy,
					};

					this.commonStatusCardsSet.push(testCard);
				}
			});
			

		}, (error: any) => {
			if (error.status === 500) {
				this.loading = false;
				this.toastr.error('Une erreur de réseau empêche la récupération des sites ' + this.nomSite + '. Vous devez vérifier l\'environnement.');
			}
			else {
				this.loading = false;
				this.toastr.error('Une erreur est survenue lors de la récupération des sites. Vous devez retenter l\'opération.');
			}
		});
	}

	validSuffixe(suffixe: string) {
		if (this.dockerService.creationInProgress) {
			this.toastr.warning('La création d\'un site est déjà en cours, veuillez attendre la fin de la création \
			et retenter l\'opération');
		} else {
			let cpt: number;
			cpt = this.checkSuffixe(suffixe);

			if (((this.typeServeur === 'prestashop') || (this.typeServeur === 'woocommerce')) && (this.option === undefined)) {
				this.message = 'Veuillez sélectionner un type de serveur.';
			} else if (suffixe === '') {
				this.message = 'Veuillez saisir un suffixe.';
			} else {
				// verification que le suffixe n'est pas déjà utilisé pour ce type de serveur
				if (cpt !== 0) {
					this.message = 'Un serveur avec le même suffixe existe déjà';
				} else {
					const regex = RegExp('^[a-z0-9]+$');
					if (regex.test(suffixe)) {
						if ((this.typeServeur === 'prestashop') || (this.typeServeur === 'woocommerce')) {
							this.typeDb = this.option;
						}
						this.message = '';
						this.validCreate(suffixe);
					} else {
						this.message = 'Le suffixe ne peut contenir que des minuscules et des chiffres';
					}
				}
			}
		}
	}

	validCreate(suffixe: string) {
		// activation du spinner
		this.loading = true;

		if (this.typeDb === 'perso') {
			this.nomSite = this.typeServeur + '-art-' + suffixe;
			this.nomBdd = this.typeServeur + '-db-art-' + suffixe;
		} else {
			this.nomSite = this.typeServeur + '-' + suffixe;
			this.nomBdd = this.typeServeur + '-db-' + suffixe;
		}

		this.toastr.info('Création du site en cours. Veuillez patienter, cela peut prendre quelques minutes. ');

		this.dockerService.createStack(this.typeServeur, suffixe, this.typeDb, this.HTTP_PROXY, this.HTTPS_PROXY, this.NO_PROXY, this.http_proxy, this.https_proxy, this.no_proxy).subscribe((data: any) => {
			this.idStack = data.Id;

			if ((this.typeServeur === 'prestashop') || (this.typeServeur === 'woocommerce') || (this.typeServeur === 'blog')) {

				// tslint:disable-next-line:max-line-length
				this.toastr.info('Le site ' + this.nomSite + ' est en cours d\'initialisation. Merci de patienter encore quelques instants.');

				// execution de la requete pour re-recupérer les infos actualisées (dont l'url avec le port)
				this.dockerService.getContainersByFiltre('{"name": ["' + this.nomSite + '"]}').subscribe((data: Array<any>) => {
					data.forEach((container: any) => {
						this.id = container.Id;
						let cmd: string;

						if (container.Ports[0].PublicPort == null) {
							this.lePort = container.Ports[1].PublicPort;
						} else {
							this.lePort = container.Ports[0].PublicPort;
						}

						// execution des commandes docker exec pour les serveurs prestashop et wordpress
						cmd = '/tmp/change-url.sh ' + this.ipDocker + ' ' + this.lePort + ' ' + this.nomBdd;
						this.launchExec(this.nomSite, this.nomBdd, this.id, cmd, this.retryAttempt);

					}, (error: any) => {
						this.toastr.error('Une erreur est survenue lors de l\'initialisation du site ' + this.nomSite +
							'. Vous devez le stopper puis le démarrer pour relancer l\'initialisation.');
					});
				});
			} else {

				//pour suitecrm, mautic un délai de 70s est ajouté
				//pour les autres types aucun délai
				let delai: number;
				let cmd: string;
				switch (this.typeServeur) {
					
					case 'suitecrm':
					case 'humhub':
						delai = 70000;
						break;
					case 'odoo':
					case 'mautic':
					case 'kanboard':
						delai = 0;
						break;
				}

				if (delai > 0){
					this.toastr.info('Le site ' + this.nomSite + ' est en cours d\'initialisation. Merci de patienter encore un peu.');
				}
				
				setTimeout(() => {
					// execution des commandes docker exec pour la maj de nginx
					//cmd = '/tmp/modif-nginx.sh ' + this.ipDocker + ' ' + this.lePort + ' ' + this.nomSite;
					//this.launchExecNginx(cmd);
					this.reloadCards();
					this.loading = false;
					this.toastr.success('Le site ' + this.nomSite + ' est opérationnel.');
				}, delai);

			}

		}, (error: any) => {
			if (error.status === 500){
				this.loading = false;
				if (this.dockerService.creationInProgress) {
					this.toastr.error('La création d\'un site est déjà en cours, veuillez patienter quelques instants \
					et retenter l\'opération');
				} else {
					this.toastr.error('Une erreur de réseau empêche la création du site ' + this.nomSite +
						'. Vous devez vérifier l\'environnement.');
				}
			} else if (error.status === 0) {
				// Cas rencontré uniquement sur les VMs Debian 9 et 10
				// Le stack est créé mais le client coupe la connexion avant d'obtenir la réponse du serveur

				if (this.typeServeur === 'prestashop' || this.typeServeur === 'woocommerce' || this.typeServeur === 'blog') {
					this.toastr.info('Veuillez patienter le site ' + this.nomSite + ' est toujours en cours d\'initialisation.');
					setTimeout(() => {
						this.toastr.info('Le site ' + this.nomSite + ' sera bientôt opérationnel. Merci de patienter.');

						setTimeout(() => {
							this.loading = false;
							this.dockerService.stopContainer(this.nomBdd).subscribe((data: any) => {

								// arret du container principal
								this.dockerService.stopContainer(this.nomSite).subscribe((data: any) => {
									this.loading = false;
									this.reloadCards();
									this.toastr.warning('Un problème est survenu. Veuillez démarrer le site '
										+ this.nomSite + ' manuellement.');
								});
							});
						}, 120000);
					}, 120000);
				} else {
					this.toastr.info('Veuillez patienter le site ' + this.nomSite + ' est toujours en cours d\'initialisation.');
					setTimeout(() => {
						this.loading = false;
						this.reloadCards();
						this.toastr.success('Le site ' + this.nomSite + ' est opérationnel.');
					}, 120000);
				}
			} else{
				this.loading = false;
				this.toastr.error('Une erreur est survenue lors de la création du site ' + this.nomSite +
					'. Vous devez retenter l\'opération.');			
			}
		});

	}

	private launchExec(name: string, nameBDD: string, id: string, cmd: string, retry: number, startAll: boolean = false) {

		const sleep = (milliseconds) => {
			return new Promise(resolve => setTimeout(resolve, milliseconds));
		};

		this.dockerService.runExecInstance(name, cmd).subscribe((data: any) => {

			if (!startAll) {
				this.reloadCards();
				// arret du spinner
				this.loading = false;
			} else {
				this.loadingSite = false;
				this.toastr.success('Le site ' + name.slice(1, name.length) + ' est opérationnel.');
			}

			
		}, (error: any) => {
			if (error.status === 607) {
				if (retry > 0) {
					retry = retry - 1;
					sleep(10000).then(() => {
						this.launchExec(name, nameBDD, id, cmd, retry--, startAll);
					});
				} else {
					//Au bout des 3 "retry" le script change-url.sh renvoie toujours "ERREUR, MySQL"
					//Le site ne peut donc pas être opérationnel, il faut supprimer le stack correspondant
					this.dockerService.deleteStack(this.idStack).subscribe((data: any) => {
						this.dockerService.purgeVolumes().subscribe((data: any) => {
							this.reloadCards();
							this.loading = false;
							this.toastr.warning('Une erreur est survenue, le site ' + name +
								' n\'a pas pu être créé. Tentez de le créer de nouveau.');
						});
					});
				}
			}
			else if (error.status === 608){
				//le script change-url.sh renvoie "Connection refused", il y a un pb à priori de proxy
				//Le site ne peut donc pas être opérationnel, il faut supprimer le stack correspondant
				this.dockerService.deleteStack(this.idStack).subscribe((data: any) => {
					this.dockerService.purgeVolumes().subscribe((data: any) => {
						this.reloadCards();
						this.loading = false;
						this.toastr.warning('La configuration réseau empêche la création du site ' + name +
							'. Vérifiez votre environnement.');
					});
				});
			}
		});
	}

	startAll() {
		// activation du spinner
		this.loadingSite = true;

		// recupération de la liste des serveurs éteints pour le type concerné
		this.dockerService.getContainersByFiltre('{"name": ["^' + this.typeServeur + '"]}').subscribe((data: Array<any>) => {
			const listServDb = [];
			const listServ = [];
			const listContainersForExec = [];
			let name: string;
			let nameType: string;
			let nameDb: string;

			data.forEach((container: any) => {
				if (container.State !== 'running') {
					name = container.Names[0].slice(1, container.Names[0].length);

					// selon le type de serveur
					switch (this.typeServeur) {
						case 'prestashop': {
							nameType = name.slice(0, 13);
							break;
						}

						case 'blog': {
							nameType = name.slice(0, 7);
							break;
						}

						case 'woocommerce': {
							nameType = name.slice(0, 14);
							break;
						}

						case 'mautic': {
							nameType = name.slice(0, 9);
							break;
						}

						case 'suitecrm': {
							nameType = name.slice(0, 11);
							break;
						}

						case 'odoo': {
							nameType = name.slice(0, 7);
							break;
						}

						case 'kanboard': {
							nameType = name.slice(0, 11);
							break;
						}

						case 'humhub': {
							nameType = name.slice(0, 9);
							break;
						}

					}

					nameDb = this.typeServeur + '-db';
					if (nameType === nameDb) {
						listServDb.push(container.Id);

					} else {
						listServ.push(container.Id);

						if (nameType.includes('prestashop') || nameType.includes('woocommerce') || nameType.includes('blog')) {
							listContainersForExec.push(container.Names[0]);
						}
					}

				}
			});

			this.dockerService.startAllStopped(listServDb).subscribe(res => {

				this.dockerService.startAllStopped(listServ).subscribe(res => {

					listContainersForExec.forEach(name => {
						// tslint:disable-next-line:max-line-length
						this.dockerService.getContainersByFiltre('{"name": ["^' + name + '"]}').subscribe((data: Array<any>) => {

							// execution des commandes docker exec pour les serveurs prestashop et wordpress
							let cmd: string;
							let port: any;

							if (data[0].Ports[0].PublicPort == null) {
								port = data[0].Ports[1].PublicPort;
							} else {
								port = data[0].Ports[0].PublicPort;
							}

							const nameBDD = this.typeServeur + '-db-' + name.split(this.typeServeur + '-')[1];
							cmd = '/tmp/change-url.sh ' + this.ipDocker + ' ' + port + ' ' + nameBDD;

							this.launchExec(name, nameBDD, data[0].Id, cmd, this.retryAttempt, true);

						});
					});

					this.reloadCards();
				});

			});
		});

	}

	stopAll() {

		// activation du spinner
		this.loadingSite = true;

		// recupération de la liste des serveurs allumés pour le type concerné
		this.dockerService.getContainersByFiltre('{"name": ["^' + this.typeServeur + '"]}').subscribe((data: Array<any>) => {
			const listServDb = [];
			const listServ = [];
			let name: string;
			let nameType: string;
			let nameDb: string;

			data.forEach((container: any) => {
				if (container.State === 'running') {
					name = container.Names[0].slice(1, container.Names[0].length);

					// selon le type de serveur
					switch (this.typeServeur) {
						case 'prestashop': {
							nameType = name.slice(0, 13);
							break;
						}

						case 'blog': {
							nameType = name.slice(0, 7);
							break;
						}

						case 'woocommerce': {
							nameType = name.slice(0, 14);
							break;
						}

						case 'mautic': {
							nameType = name.slice(0, 9);
							break;
						}

						case 'suitecrm': {
							nameType = name.slice(0, 11);
							break;
						}

						case 'odoo': {
							nameType = name.slice(0, 7);
							break;
						}

						case 'kanboard': {
							nameType = name.slice(0, 11);
							break;
						}

						case 'humhub': {
							nameType = name.slice(0, 9);
							break;
						}

					}

					nameDb = this.typeServeur + '-db';
					if (nameType === nameDb) {
						listServDb.push(container.Id);
					} else {
						listServ.push(container.Id);
					}

				}
			});

			this.dockerService.stopAllRunning(listServDb).subscribe(res => {

				this.dockerService.stopAllRunning(listServ).subscribe(res => {
					this.reloadCards();
					this.toastr.success('Tous les sites ' + this.typeServeur + ' sont stoppés.');
					this.loadingSite = false;
				});

			});
		});
	}

	ngOnDestroy() {
		this.alive = false;
	}

	ngOnInit() {

		if (this.typeServeur === 'blog') {
			this.nomServeur = 'Wordpress - blog';
		} else {
			this.nomServeur = this.typeServeur;
		}

		if ((this.typeServeur === 'prestashop') || (this.typeServeur === 'woocommerce')) {
			this.ok = true;
		}

		if (this.typeServeur === 'odoo') {
			this.isOdoo = true;
		}

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

			this.displayContainers();
		}, (error: any) => {
			this.toastr.error('Une erreur est survenue. Vous devez vérifier l\'environnement.');
		});

		this.themeService.getJsTheme()
			.pipe(takeWhile(() => this.alive))
			.subscribe(theme => {
				this.statusCards = this.statusCardsByThemes[theme.name];
			});

		this.solarService.getSolarData()
			.pipe(takeWhile(() => this.alive))
			.subscribe((data) => {
				this.solarValue = data;
			});
	}


}
