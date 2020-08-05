import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin, concat } from 'rxjs';
import { catchError, tap, timeout, concatMap, mergeMap, last } from 'rxjs/operators';

const endpoint = 'http://llb.ac-corse.fr:11251/portainer/api/';

const portainerUser = {
  Username: 'admin',
  Password: 'portnairAdmin',
};

const paramsGithubStack = {
  Name: '',	
  RepositoryURL: 'https://gitlab.com/e-combox/e-comBox_docker-compose',
  RepositoryReferenceName: 'refs/heads/dev',
  ComposeFilePathInRepository: '',
  RepositoryAuthentication: false,
  Env: [
  {
    name: 'SUFFIXE',
    value: ''
  },
  {
    name: 'HTTP_PROXY',
    value: ''
  },
  {
    name: 'HTTPS_PROXY',
    value: ''
  },
  {
    name: 'http_proxy',
    value: ''
  },
  {
    name: 'https_proxy',
    value: ''
  },
  {
    name: 'NO_PROXY',
    value: ''
  },
  {
    name: 'no_proxy',
    value: ''
  },
  {
    name: 'DB_PASS',
    value: ''
  },
  {
    name: 'ROOT_DB_PASS',
    value: ''
  },
  ]
};

const paramsUpdateStack = {
  StackFileContent: '',
  Prune: false
};

const paramsGithubStackSftp = {
  Name: '',	
  RepositoryURL: 'https://gitlab.com/e-combox/e-comBox_docker-compose',
  RepositoryReferenceName: 'refs/heads/dev',
  ComposeFilePathInRepository: '',
  RepositoryAuthentication: false,
  Env: [
  {
    name: 'NOMSTACK',
    value: ''
  },{
    name: 'SFTP_PASS',
    value: ''
  },
  ]
};

const paramsGithubStackPma = {
  Name: '',	
  RepositoryURL: 'https://gitlab.com/e-combox/e-comBox_docker-compose',
  RepositoryReferenceName: 'refs/heads/dev',
  ComposeFilePathInRepository: '',
  RepositoryAuthentication: false,
  Env: [
  {
    name: 'NOMSTACK',
    value: ''
  },
  {
    name: 'NOMCONTENEUR_DB',
    value: ''
  },{
    name: 'DB_PASS',
    value: ''
  },

  ]
};

const paramsExec = {
  AttachStdin: false, 
  AttachStdout: true,
  AttachStderr: true,
  Tty: false,
  Cmd: ['/bin/bash', '-c', ''],
};

const startExec = {
  Detach: false,
  Tty: false,
};


@Injectable({
  providedIn: 'root',
})
export class RestService {

  creationInProgress: boolean = false;
  typeOfServer: string = '';

  constructor(private http: HttpClient) { }

  // Connexion à Portainer permettant de récupérer le token d'authentification
  authenticate(): Observable<any> {
    const body = JSON.stringify(portainerUser);
    return this.http.post(endpoint + 'auth', body)
    .pipe(
      tap((token: any) => {
        localStorage.setItem('token', token.jwt);
      }),
      catchError(this.handleError<any>('Authenticate')),
    );
  }

  // Récupérer la liste complète des containers Docker
  getAllContainers(): Observable<any> {
	  /*let getParameters = {
      all: true
    }*/
  
      return this.http.get(endpoint + 'endpoints/1/docker/containers/json?all=true')
      .pipe(
        catchError(this.handleError<any>('getContainers')),
      );
  }

  // Récupérer la liste complète des containers Docker
  getAllRunningContainers(): Observable<any> {
      return this.http.get(endpoint + 'endpoints/1/docker/containers/json?all=false')
      .pipe(
        catchError(this.handleError<any>('getContainers')),
      );
  }

  // Récupérer un ou plusieurs containers Docker en fonction d'un filtre
  getContainersByFiltre(filtre: string): Observable<any> {
	  /*let getParameters = {
      all: true
    }*/

      return this.http.get(endpoint + `endpoints/1/docker/containers/json?all=true&filters=${filtre}`)
      .pipe(
        catchError(this.handleError<any>('getContainers'))
      );
  }

  getContainerIdByName(filtreName: string): Observable<any> {
      return this.http.get(endpoint + `endpoints/1/docker/containers/json?all=true&filters=${filtreName}`)
	  .pipe(
		  catchError(this.handleError<any>('getContainers'))
	  );
  }

  // inspect donne plus d'infos sur le container
  inspectContainerByName(name: string): Observable<any> {
    return this.http.get(endpoint + `endpoints/1/docker/containers/${name}/json`)
  .pipe(
    catchError(this.handleError<any>('getContainers')),
  );
  }

  // Permet de récupérer les statistiques d'usage du CPU et de la mémoire par container
  getStatsContainer(ids: Array<string>): Observable<any> {
    const urls = [];
    ids.forEach((id: string) => {
      urls.push(this.http.get(endpoint + `endpoints/1/docker/containers/${id}/stats?stream=false`));
    });

    return forkJoin(urls);
  }


  //démarrer un container
  //id peut être l'id ou le nom du container
  startContainer(id: string): Observable<any>  {
    return this.http.post(endpoint + 'endpoints/1/docker/containers/' + id + '/start', null)
    .pipe(
      //tap(() => console.log('CHECK OK'))
    );
  }

  //Stopper un container
  stopContainer(id: string): Observable<any> {
    return this.http.post(endpoint + 'endpoints/1/docker/containers/' + id + '/stop', null)
    .pipe(
      //tap(() => console.log('CHECK OK'))
    );
  }

  startAllStopped(containers: Array<string>): Observable<any> {
    const reqs = [];
    containers.forEach((id: string) => {
      reqs.push(this.http.post(endpoint + 'endpoints/1/docker/containers/' + id + '/start', null));
    });

    return forkJoin(reqs);
  }

  stopAllRunning(containers: Array<string>): Observable<any> {
    const reqs = [];
    containers.forEach((id: string) => {
      reqs.push(this.http.post(endpoint + 'endpoints/1/docker/containers/' + id + '/stop', null));
    });

    return forkJoin(reqs);
  }

  //créer un nouveau stack
  createStack(server: string, suffixe: string, typeDb: string, HTTP_PROXY: string, HTTPS_PROXY: string, NO_PROXY: string, http_proxy: string, https_proxy: string, no_proxy: string, mdp: string, mdpRoot: string): Observable<any> {
    this.creationInProgress = true;
    this.typeOfServer = server;
    
    let body: string;
  
    if (HTTP_PROXY === undefined){
      paramsGithubStack.Env[1]["value"] = "";
    }
    else {
      paramsGithubStack.Env[1]["value"] = HTTP_PROXY;
    }

    if (HTTPS_PROXY === undefined){
      paramsGithubStack.Env[2]["value"] = "";
    }
    else {
      paramsGithubStack.Env[2]["value"] = HTTPS_PROXY;
    }

    if (NO_PROXY === undefined){
      paramsGithubStack.Env[5]["value"] = "";
    }
    else {
      paramsGithubStack.Env[5]["value"] = NO_PROXY;
    }
    if (http_proxy === undefined){
      paramsGithubStack.Env[3]["value"] = "";
    }
    else {
      paramsGithubStack.Env[3]["value"] = http_proxy;
    }

    if (https_proxy === undefined){
      paramsGithubStack.Env[4]["value"] = "";
    }
    else {
      paramsGithubStack.Env[4]["value"] = https_proxy;
    }

    if (no_proxy === undefined){
      paramsGithubStack.Env[6]["value"] = "";
    }
    else {
      paramsGithubStack.Env[6]["value"] = no_proxy;
    }

    if (mdp === undefined){
      paramsGithubStack.Env[7]["value"] = "";
    }
    else {
      paramsGithubStack.Env[7]["value"] = mdp;
    }

    if (mdpRoot === undefined){
      paramsGithubStack.Env[8]["value"] = "";
    }
    else {
      paramsGithubStack.Env[8]["value"] = mdpRoot;
    }

    if(typeDb === "vierge"){
      paramsGithubStack.ComposeFilePathInRepository = "docker-compose-" + server + "-vierge.yml";
      paramsGithubStack.Env[0]["value"] = suffixe;
      paramsGithubStack.Name = server + suffixe;
    } else if(typeDb === "perso") {
      paramsGithubStack.ComposeFilePathInRepository = "docker-compose-" + server + "-art.yml";
      paramsGithubStack.Env[0]["value"] = "art-" + suffixe;
      paramsGithubStack.Name = server + "art" + suffixe;
    } else if(typeDb === "v12") {
      paramsGithubStack.ComposeFilePathInRepository = "docker-compose-" + server + "-12.yml";
      paramsGithubStack.Env[0]["value"] = "12-" + suffixe;
      paramsGithubStack.Name = server + "12" + suffixe;
    } else if(typeDb === "v13") {
      paramsGithubStack.ComposeFilePathInRepository = "docker-compose-" + server + "-13.yml";
      paramsGithubStack.Env[0]["value"] = "13-" + suffixe;
      paramsGithubStack.Name = server + "13" + suffixe;
    }
    else{
      paramsGithubStack.ComposeFilePathInRepository = "docker-compose-" + server + ".yml";
      paramsGithubStack.Env[0]["value"] = suffixe;
      paramsGithubStack.Name = server + suffixe;
    }

    body = JSON.stringify(paramsGithubStack);
  
	  return this.http.post(endpoint + "stacks?type=2&method=repository&endpointId=1", body)
	  .pipe(
		  tap(() => {
        this.creationInProgress = false;
      },
      error => this.creationInProgress = false),
	  );
  }

  //mettre à jour un stack (pour les changements d'environnement)
  updateStack(id: string, server: string, nameStack: string, imageBdd: string, nameContainerBdd: string, imageContainer: string, nameContainer: string,HTTP_PROXY: string, HTTPS_PROXY: string, NO_PROXY: string, http_proxy: string, https_proxy: string, no_proxy: string, MDP_BDD: string, MDP_ROOT_BDD: string): Observable<any> {

    if (HTTP_PROXY === undefined) {
      HTTP_PROXY = "";
    }
    if (HTTPS_PROXY === undefined) {
      HTTPS_PROXY = "";
    }
    if (NO_PROXY === undefined) {
      NO_PROXY = "";
    }
    if (http_proxy === undefined) {
      http_proxy = "";
    }
    if (https_proxy === undefined) {
      https_proxy = "";
    }
    if (no_proxy === undefined) {
      no_proxy = "";
    }

    switch(server){
      case "prestashop":
          paramsUpdateStack.StackFileContent = "version : 2\nservices :\n  db :\n    labels:\n      com.docker.compose.app: 'ecombox-db'\n    image : " + imageBdd + "\n    container_name : " + nameContainerBdd + "\n    networks:\n      - net_e-combox\n    expose :\n      - '3306'\n    environment : \n      MYSQL_ROOT_PASSWORD : " + MDP_ROOT_BDD + "\n      MYSQL_DATABASE : prestashop\n      MYSQL_USER : userPS\n      MYSQL_PASSWORD : " + MDP_BDD + "\n      MYSQL_INITDB_SKIP_TZINFO : 1\n      HTTP_PROXY : " + HTTP_PROXY + "\n      HTTPS_PROXY : " + HTTPS_PROXY + "\n      http_proxy : " + http_proxy + "\n      https_proxy : " + https_proxy + "\n      NO_PROXY : " + NO_PROXY + "\n      no_proxy : " + no_proxy + "\n    volumes : \n      \- " + nameStack + "_prestashop_data_db:/var/lib/mysql\n\n  prestashop : \n    labels:\n      com.docker.compose.app: 'ecombox'\n    image : " + imageContainer + "\n    container_name : " + nameContainer + "\n    networks:\n      - net_e-combox\n    ports:\n      - '80'\n    volumes :\n      - " + nameStack + "_prestashop_data:/var/www/html\n    external_links : \n      - " + nameContainerBdd + ":db\n    environment : \n      HTTP_PROXY : " + HTTP_PROXY + "\n      HTTPS_PROXY : " + HTTPS_PROXY + "\n      http_proxy : " + http_proxy + "\n      https_proxy : " + https_proxy + "\n      NO_PROXY : " + NO_PROXY + "\n      no_proxy : " + no_proxy + "\n      DB_PASS : " + MDP_BDD + "\n      VIRTUAL_HOST : " + nameContainer + "\n    depends_on :\n      - db\nnetworks:\n  net_e-combox:\n    external:\n      name: bridge_e-combox";
          break;
      case "woocommerce":
          paramsUpdateStack.StackFileContent = "version : 2\nservices :\n  db :\n    labels:\n      com.docker.compose.app: 'ecombox-db'\n    image : " + imageBdd + "\n    container_name : " + nameContainerBdd + "\n    networks:\n      - net_e-combox\n    expose :\n      - '3306'\n    environment : \n      MYSQL_ROOT_PASSWORD : " + MDP_ROOT_BDD + "\n      MYSQL_DATABASE : wordpress\n      MYSQL_USER : userWP\n      MYSQL_PASSWORD : " + MDP_BDD + "\n      MYSQL_INITDB_SKIP_TZINFO : 1\n      HTTP_PROXY : " + HTTP_PROXY + "\n      HTTPS_PROXY : " + HTTPS_PROXY + "\n      http_proxy : " + http_proxy + "\n      https_proxy : " + https_proxy + "\n      NO_PROXY : " + NO_PROXY + "\n      no_proxy : " + no_proxy + "\n    volumes : \n      - " + nameStack + "_woocommerce_data_db:/var/lib/mysql\n\n  wordpress : \n    labels:\n      com.docker.compose.app: 'ecombox'\n    image : " + imageContainer + "\n    container_name : " + nameContainer + "\n    ports:\n      - '80'\n    networks:\n      - net_e-combox\n    volumes :\n      - " + nameStack + "_woocommerce_data:/var/www/html\n    external_links : \n      - " + nameContainerBdd + ":db\n    environment : \n      HTTP_PROXY : " + HTTP_PROXY + "\n      HTTPS_PROXY : " + HTTPS_PROXY + "\n      http_proxy : " + http_proxy + "\n      https_proxy : " + https_proxy + "\n      NO_PROXY : " + NO_PROXY + "\n      no_proxy : " + no_proxy + "\n      DB_PASS : " + MDP_BDD + "\n      VIRTUAL_HOST : " + nameContainer + "\n    depends_on :\n      - db\nnetworks:\n  net_e-combox:\n    external:\n      name: bridge_e-combox";
          break;
      case "blog":
          paramsUpdateStack.StackFileContent = "version : 2\nservices :\n  db :\n    labels:\n      com.docker.compose.app: 'ecombox-db'\n    image : " + imageBdd + "\n    container_name : " + nameContainerBdd + "\n    networks:\n      - net_e-combox\n    expose :\n      - '3306'\n    environment : \n      MYSQL_ROOT_PASSWORD : " + MDP_ROOT_BDD + "\n      MYSQL_DATABASE : wordpress\n      MYSQL_USER : userWP\n      MYSQL_PASSWORD : " + MDP_BDD + "\n      MYSQL_INITDB_SKIP_TZINFO : 1\n      HTTP_PROXY : " + HTTP_PROXY + "\n      HTTPS_PROXY : " + HTTPS_PROXY + "\n      http_proxy : " + http_proxy + "\n      https_proxy : " + https_proxy + "\n      NO_PROXY : " + NO_PROXY + "\n      no_proxy : " + no_proxy + "\n    volumes : \n      - " + nameStack + "_blog_data_db:/var/lib/mysql\n\n  wordpress : \n    labels:\n      com.docker.compose.app: 'ecombox'\n    image : " + imageContainer + "\n    container_name : " + nameContainer + "\n    ports:\n      - '80'\n    networks:\n      - net_e-combox\n    volumes :\n      - " + nameStack + "_blog_data:/var/www/html\n    external_links : \n      - " + nameContainerBdd + ":db\n    environment : \n      HTTP_PROXY : " + HTTP_PROXY + "\n      HTTPS_PROXY : " + HTTPS_PROXY + "\n      http_proxy : " + http_proxy + "\n      https_proxy : " + https_proxy + "\n      NO_PROXY : " + NO_PROXY + "\n      no_proxy : " + no_proxy + "\n      DB_PASS : " + MDP_BDD + "\n      VIRTUAL_HOST : " + nameContainer + "\n    depends_on :\n      - db\nnetworks:\n  net_e-combox:\n    external:\n      name: bridge_e-combox";
          break;
      case "odoo":
          paramsUpdateStack.StackFileContent = "version : 2\nservices :\n  db :\n    labels:\n      com.docker.compose.app: 'ecombox-db'\n    image : " + imageBdd + "\n    container_name : " + nameContainerBdd + "\n    networks:\n      - net_e-combox\n    environment : \n      POSTGRES_DB : postgres\n      POSTGRES_PASSWORD : " + MDP_BDD + "\n      POSTGRES_USER : userOdoo\n      PGDATA : /var/lib/postgresql/data/pgdata\n      HTTP_PROXY : " + HTTP_PROXY + "\n      HTTPS_PROXY : " + HTTPS_PROXY + "\n      http_proxy : " + http_proxy + "\n      https_proxy : " + https_proxy + "\n      NO_PROXY : " + NO_PROXY + "\n      no_proxy : " + no_proxy + "\n    volumes : \n      - " + nameStack + "_odoo_data_db:/var/lib/postgresql/data\n\n  odoo : \n    labels:\n      com.docker.compose.app: 'ecombox'\n    image : " + imageContainer + "\n    container_name : " + nameContainer + "\n    ports:\n      - '8069'\n    networks:\n      - net_e-combox\n    links :\n      - db\n    volumes :\n      - " + nameStack + "_odoo_data:/var/lib/odoo\n      - " + nameStack + "_odoo_data_config:/etc/odoo\n      - " + nameStack + "_odoo_data_addons:/mnt/extra-addons\n    external_links : \n      - " + nameContainerBdd + ":db\n    environment : \n      HOST : db\n      PORT : 5432\n      USER : userOdoo\n      PASSWORD : " + MDP_BDD + "\n      HTTP_PROXY : " + HTTP_PROXY + "\n      HTTPS_PROXY : " + HTTPS_PROXY + "\n      http_proxy : " + http_proxy + "\n      https_proxy : " + https_proxy + "\n      NO_PROXY : " + NO_PROXY + "\n      no_proxy : " + no_proxy + "\n      DB_PASS : " + MDP_BDD + "\n      VIRTUAL_HOST : " + nameContainer + "\n      VIRTUAL_PORT : 8069\n    depends_on :\n      - db\nnetworks:\n  net_e-combox:\n    external:\n      name: bridge_e-combox";
          break;
      case "suitecrm":
          paramsUpdateStack.StackFileContent = "version : 2\nservices :\n  db :\n    labels:\n      com.docker.compose.app: 'ecombox-db'\n    image : " + imageBdd + "\n    container_name : " + nameContainerBdd + "\n    networks:\n      - net_e-combox\n    expose :\n      - '3306'\n    environment : \n      MYSQL_ROOT_PASSWORD : " + MDP_ROOT_BDD + "\n      MYSQL_DATABASE : suitecrm\n      MYSQL_USER : userSuiteCRM\n      MYSQL_PASSWORD : " + MDP_BDD + "\n      MYSQL_INITDB_SKIP_TZINFO : 1\n      HTTP_PROXY : " + HTTP_PROXY + "\n      HTTPS_PROXY : " + HTTPS_PROXY + "\n      http_proxy : " + http_proxy + "\n      https_proxy : " + https_proxy + "\n      NO_PROXY : " + NO_PROXY + "\n      no_proxy : " + no_proxy + "\n    volumes : \n      - " + nameStack + "_suitecrm_data_db:/var/lib/mysql\n\n  suitecrm : \n    labels:\n      com.docker.compose.app: 'ecombox'\n    image : " + imageContainer + "\n    container_name : " + nameContainer + "\n    networks:\n      - net_e-combox\n    ports:\n      - '80'\n    volumes :\n      - " + nameStack + "_suitecrm_data:/var/www/html/upload\n      - " + nameStack + "_suitecrm_conf:/var/www/html/conf.d\n    tty : true\n    external_links : \n      - " + nameContainerBdd + ":db\n    environment : \n      DATABASE_HOST : db\n      DATABASE_TYPE : mysql\n      DATABASE_NAME : suitecrm\n      DB_ADMIN_USERNAME : userSuiteCRM\n      DB_ADMIN_PASSWORD : " + MDP_BDD + "\n      SITE_USERNAME : adminSCRM\n      SITE_PASSWORD : scrmAdmin0\n      DATE_FORMAT : d-m-Y\n      EXPORT_CHARSET : ISO-8859-1\n      DEFAULT_LANGUAGE : fr_FR\n      SYSTEM_NAME : Zentek CRM\n      HTTP_PROXY : " + HTTP_PROXY + "\n      HTTPS_PROXY : " + HTTPS_PROXY + "\n      http_proxy : " + http_proxy + "\n      https_proxy : " + https_proxy + "\n      NO_PROXY : " + NO_PROXY + "\n      no_proxy : " + no_proxy + "\n      DB_PASS : " + MDP_BDD + "\n      VIRTUAL_HOST : " + nameContainer + "\n    depends_on :\n      - db\nnetworks:\n  net_e-combox:\n    external:\n      name: bridge_e-combox";
          break;
      case "kanboard":
          paramsUpdateStack.StackFileContent = "version : 2\nservices :\n  db :\n    labels:\n      com.docker.compose.app: 'ecombox-db'\n    image : " + imageBdd + "\n    command: --default-authentication-plugin=mysql_native_password\n    container_name : " + nameContainerBdd + "\n    networks:\n      - net_e-combox\n    expose :\n      - '3306'\n    environment : \n      MYSQL_ROOT_PASSWORD : " + MDP_ROOT_BDD + "\n      MYSQL_DATABASE : kanboard\n      MYSQL_USER : userKB\n      MYSQL_PASSWORD : " + MDP_BDD + "\n      MYSQL_INITDB_SKIP_TZINFO : 1\n      HTTP_PROXY : " + HTTP_PROXY + "\n      HTTPS_PROXY : " + HTTPS_PROXY + "\n      http_proxy : " + http_proxy + "\n      https_proxy : " + https_proxy + "\n      NO_PROXY : " + NO_PROXY + "\n      no_proxy : " + no_proxy + "\n    volumes : \n      - " + nameStack + "_kanboard_data_db:/var/lib/mysql\n\n  kanboard : \n    labels:\n      com.docker.compose.app: 'ecombox'\n    image : " + imageContainer + "\n    container_name : " + nameContainer + "\n    ports:\n      - '80'\n    networks:\n      - net_e-combox\n    volumes :\n      - " + nameStack + "_kanboard_data:/var/www/app/data\n      - " + nameStack + "_kanboard_data_plugins:/var/www/app/plugins\n      - " + nameStack + "_kanboard_data_ssl:/etc/nginx/ssl\n    external_links : \n      - " + nameContainerBdd + ":db\n    environment : \n      DATABASE_URL : mysql://userKB:" + MDP_BDD + "@db/kanboard\n      HTTP_PROXY : " + HTTP_PROXY + "\n      HTTPS_PROXY : " + HTTPS_PROXY + "\n      http_proxy : " + HTTP_PROXY + "\n      https_proxy : " + https_proxy + "\n      NO_PROXY : " + NO_PROXY + "\n      no_proxy : " + no_proxy + "\n      DB_PASS : " + MDP_BDD + "\n      VIRTUAL_HOST : " + nameContainer + "\n      VIRTUAL_PORT : 80\n    depends_on :\n      - db\nnetworks:\n  net_e-combox:\n    external:\n      name: bridge_e-combox";
          break;
      case "humhub":
          paramsUpdateStack.StackFileContent = "version : 2\nservices :\n  db :\n    labels:\n      com.docker.compose.app: 'ecombox-db'\n    image : " + imageBdd + "\n    container_name : " + nameContainerBdd + "\n    networks:\n      - net_e-combox\n    expose :\n      - '3306'\n    environment : \n      MYSQL_ROOT_PASSWORD : " + MDP_ROOT_BDD + "\n      MYSQL_DATABASE : humhub\n      MYSQL_USER : userHH\n      MYSQL_PASSWORD : " + MDP_BDD + "\n      MYSQL_INITDB_SKIP_TZINFO : 1\n      HTTP_PROXY : " + HTTP_PROXY + "\n      HTTPS_PROXY : " + HTTPS_PROXY + "\n      http_proxy : " + http_proxy + "\n      https_proxy : " + https_proxy + "\n      NO_PROXY : " + NO_PROXY + "\n      no_proxy : " + no_proxy + "\n    volumes : \n      - " + nameStack + "_humhub_data_db:/var/lib/mysql\n\n  humhub : \n    labels:\n      com.docker.compose.app: 'ecombox'\n    image : " + imageContainer + "\n    container_name : " + nameContainer + "\n    ports:\n      - '80'\n    networks:\n      - net_e-combox\n    volumes :\n      - " + nameStack + "_humhub_data_config:/var/www/localhost/htdocs/protected/config\n      - " + nameStack + "_humhub_data_uploads:/var/www/localhost/htdocs/uploads\n      - " + nameStack + "_humhub_data_modules:/var/www/localhost/htdocs/protected/modules\n    external_links : \n      - " + nameContainerBdd + ":db\n    environment : \n      HUMHUB_DB_HOST : db\n      HUMHUB_DB_NAME : humhub\n      HUMHUB_DB_USER : userHH\n      HUMHUB_DB_PASSWORD : " + MDP_BDD + "\n      HUMHUB_AUTO_INSTALL : 1\n      HTTP_PROXY : " + HTTP_PROXY + "\n      HTTPS_PROXY : " + HTTPS_PROXY + "\n      http_proxy : " + http_proxy + "\n      https_proxy : " + https_proxy + "\n      NO_PROXY : " + NO_PROXY + "\n      no_proxy : " + no_proxy + "\n      DB_PASS : " + MDP_BDD + "\n      VIRTUAL_HOST : " + nameContainer + "\n    depends_on :\n      - db\nnetworks:\n  net_e-combox:\n    external:\n      name: bridge_e-combox";
          break;
      case "mautic":
          paramsUpdateStack.StackFileContent = "version : 2\nservices :\n  db :\n    labels:\n      com.docker.compose.app: 'ecombox-db'\n    image : " + imageBdd + "\n    container_name : " + nameContainerBdd + "\n    networks:\n      - net_e-combox\n    expose :\n      - '3306'\n    environment : \n      MYSQL_ROOT_PASSWORD : " + MDP_ROOT_BDD + "\n      MYSQL_DATABASE : mautic\n      MYSQL_USER : userMautic\n      MYSQL_PASSWORD : " + MDP_BDD + "\n      MYSQL_INITDB_SKIP_TZINFO : 1\n      HTTP_PROXY : " + HTTP_PROXY + "\n      HTTPS_PROXY : " + HTTPS_PROXY + "\n      http_proxy : " + http_proxy + "\n      https_proxy : " + https_proxy + "\n      NO_PROXY : " + NO_PROXY + "\n      no_proxy : " + no_proxy + "\n    volumes : \n      - " + nameStack + "_mautic_data_db:/var/lib/mysql\n\n  mautic : \n    labels:\n      com.docker.compose.app: 'ecombox'\n    image : " + imageContainer + "\n    container_name : " + nameContainer + "\n    ports:\n      - '80'\n    networks:\n      - net_e-combox\n    volumes :\n      - " + nameStack + "_mautic_data:/var/www/html\n    external_links : \n      - " + nameContainerBdd + ":db\n    environment : \n      MAUTIC_DB_HOST : db\n      MAUTIC_DB_NAME : mautic\n      MAUTIC_DB_USER : userMautic\n      MAUTIC_DB_PASSWORD : " + MDP_BDD + "\n      HTTP_PROXY : " + HTTP_PROXY + "\n      HTTPS_PROXY : " + HTTPS_PROXY + "\n      http_proxy : " + http_proxy + "\n      https_proxy : " + https_proxy + "\n      NO_PROXY : " + NO_PROXY + "\n      no_proxy : " + no_proxy + "\n      DB_PASS : " + MDP_BDD + "\n      PHP_INI_DATE_TIMEZONE: Europe/Paris\n      MAUTIC_RUN_CRON_JOBS: 'true'\n      VIRTUAL_HOST : " + nameContainer + "\n    depends_on :\n      - db\nnetworks:\n  net_e-combox:\n    external:\n      name: bridge_e-combox";
          break;
    }

    const body = JSON.stringify(paramsUpdateStack);

    return this.http.put(endpoint + "stacks/" + id + "?id=" + id + "&endpointId=1", body)
    .pipe(
      //tap(() => console.log('update stack ok'))
    );
  }

  createStackSftp(server: string, nomStack: string, mdp: string): Observable<any> {
    paramsGithubStackSftp.ComposeFilePathInRepository = "docker-compose-sftp-" + server + ".yml";
    paramsGithubStackSftp.Env[0]["value"] = nomStack;
    paramsGithubStackSftp.Env[1]["value"] = mdp;
    paramsGithubStackSftp.Name = "sftp" + nomStack;
    
    const body = JSON.stringify(paramsGithubStackSftp);

    return this.http.post(endpoint + "stacks?type=2&method=repository&endpointId=1", body)
    .pipe(
      //tap(() => console.log('ajout stack ok'))
    );
  }

  createStackPma(server: string, nomStack: string, suffixe: string, mdp: string): Observable<any> {
    if ((server == "blog")||(server == "woocommerce")){
      paramsGithubStackPma.ComposeFilePathInRepository = "docker-compose-pma-wordpress.yml";
    }
    else{
      paramsGithubStackPma.ComposeFilePathInRepository = "docker-compose-pma-" + server + ".yml";
    }
    
    paramsGithubStackPma.Env[0]["value"] = nomStack;
    paramsGithubStackPma.Env[1]["value"] = server + "-db" + suffixe;
    paramsGithubStackPma.Env[2]["value"] = mdp;
    paramsGithubStackPma.Name = "pma" + nomStack;
    
    const body = JSON.stringify(paramsGithubStackPma);

    return this.http.post(endpoint + "stacks?type=2&method=repository&endpointId=1", body)
    .pipe(
      //tap(() => console.log('ajout stack ok'))
    );
  }

  // Excuter une instance Docker Exec
  runExecInstance(name: string, cmd: string): Observable<any> {
    paramsExec.Cmd[2] = cmd;
    const body = JSON.stringify(paramsExec);

    let httpHeaders = new HttpHeaders({
      'Content-Type' : 'application/json',
      'Cache-Control': 'no-cache',
    });

    let options = {
      headers: httpHeaders
    };

    return this.http.post(endpoint + 'endpoints/1/docker/containers/' + name + '/exec', body, options)
    .pipe(
      mergeMap((data: any) => this.startExec(data.Id)),
    );
  }

  //creer une instance docker exec
  createExec(name: string, cmd: string): Observable<any> {
	  paramsExec.Cmd[2] = cmd;
	  const body = JSON.stringify(paramsExec);
    
    //headers indispensable pour le fonctionnement de la requête exec
    let httpHeaders = new HttpHeaders({
      'Content-Type' : 'application/json',
      'Cache-Control': 'no-cache'
    });    
    
    let options = {
      headers: httpHeaders
    };

	  return this.http.post(endpoint + 'endpoints/1/docker/containers/' + name + '/exec', body, options)
	  .pipe(
		  //tap(() => console.log('creation exec OK'))
	  );
  }

  //lancer une instance docker exec
  startExec(id: string): Observable<any> {
	  const body = JSON.stringify(startExec);
    
    //headers indispensable pour le fonctionnement de la requête exec
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });    
    
    let options = {
      headers: httpHeaders,
      encoding: 'utf-8',
      responseType: 'text' as 'json'
    };

	  return this.http.post(endpoint + 'endpoints/1/docker/exec/' + id + '/start', body, options)
	  .pipe(
		  //tap(() => console.log('execution exec OK'))
	  );
  }

  //supprimer un container
  deleteContainerByFiltre(id: string) {
	  //id peut être l'id ou le nom du container
	  //suppression du container avec le volume associé
	  return this.http.delete(endpoint + 'endpoints/1/docker/containers/' + id + '?v=true&force=true')
		  .pipe(
			  //tap(() => console.log('suppr OK'))
		  );
  }

  //recuperer la liste des stacks
  getStacks() {
	  return this.http.get(endpoint + 'stacks')
		  .pipe(
			  //tap(() => console.log('recup liste stack'))
		  );
  }

  deleteStack(id: string) {
	  return this.http.delete(endpoint + 'stacks/' + id)
		  .pipe(
        //tap(() => console.log("stack "+ id + " supprimé"))
		  );
  }
  
  //purge des volumes non utilisés (suite à la suppression d'un stack)
  purgeVolumes() {
	  return this.http.post(endpoint + 'endpoints/1/docker/volumes/prune', null)
		  .pipe(
			  //tap(() => console.log('purge volumes OK'))
		  );
  }

  deleteListStacks(stacks: Array<string>): Observable<any> {
    const reqs = [];
    stacks.forEach((id: string) => {
      reqs.push(this.http.delete(endpoint + 'stacks/' + id));
    });
    
    return forkJoin(reqs);
  }

  getSftpInfos(infos: Array<string>): Observable<any> {
    const reqs = [];
    infos.forEach((name: string) => {
      reqs.push(this.http.get(endpoint + `endpoints/1/docker/containers/${name}/json`));
    });
    
    return forkJoin(reqs);
  }

  //Authentification sur le DockerHub
  connectDockerHub() {
    //TODO
  }

  // Récupérer une image
  getImage(token: string): Observable<any> {
    return this.http.post(endpoint + 'endpoints/1/docker/images/create?fromImage=wordpress', null).pipe(
      timeout(2000),
      // tap(() => console.log('CHECK OK')),
      catchError(this.handleError<any>('Authenticate')),
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
