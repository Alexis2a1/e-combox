import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { RestService } from '../../services/rest.service';
import { GeneralService } from '../../services/general.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ngx-container-info',
  templateUrl: './container-info.component.html',
  styleUrls: ['./container-info.component.scss', './container-loader.scss', './animate.css',
    '../dashboard.component.scss'],
})
export class ContainerInfoComponent implements OnInit {
  // déclaration of this variable for count each container
  nbNotUsesContainers: number;
  nbContainers: number;
  memoryUsed: number;
  cpuUsed: number;
  version: string = environment.ecomboxVersion;
  lastVersion: string = environment.ecomboxVersion;
  urlInstallVersion: string;

  diskSpaceDescription: string;
  diskSpaceUsed: number;

  constructor(private generalService: GeneralService,
    private dockerService: RestService) {
        this.diskSpaceDescription = this.generalService.diskSpaceDescription;
        this.memoryUsed = this.generalService.memoryUsed;
        this.nbContainers = this.generalService.nbContainers;
        this.cpuUsed = this.generalService.cpuUsed;
    }

  ngOnInit() {
    this.generalService.getAnnounce().subscribe(response => {
      if (response) {
        this.lastVersion = response.version;
        if (response.url) {
          this.urlInstallVersion = response.url;
        }
      }
    }, (error: any) => {
        console.error('ERROR : ' + error);
    });

    if (!this.generalService.dashboardRefreshInProgress) {
      this.getInfo();
    }
  }

  reinitializeVariables() {
    this.nbContainers = 0.0;
    this.memoryUsed = 0.0;
    this.nbNotUsesContainers = 0;
    this.memoryUsed = 0.0;
    this.cpuUsed = 0.0;
    this.diskSpaceDescription = 'Calcul en cours';
    this.diskSpaceUsed = 0;
  }

  getInfo(): void {
    this.generalService.dashboardRefreshInProgress = true;

    this.reinitializeVariables();

    this.generalService.getDataUsageInfo().subscribe((info: any) => {
      if (info) {
        if (info.Images && info.Images.length) {
          info.Images.forEach(element => {
            this.diskSpaceUsed += element['Size'];
          });
        }
        info.Containers.forEach(element => {
          this.diskSpaceUsed += element['SizeRootFs'];
        });

        this.diskSpaceDescription = this.fileConvertSize(this.diskSpaceUsed);
        this.generalService.diskSpaceDescription = this.diskSpaceDescription;

      } else {
        this.diskSpaceDescription = '-';
      }

      this.generalService.dashboardRefreshInProgress = false;

    }, (error: any) => {
        this.generalService.dashboardRefreshInProgress = false;
    });

    this.dockerService.getContainersByFiltre('{"label":["com.docker.compose.app=ecombox"]}').subscribe((data: Array<any>) => {
      const ids = [];
      data.forEach((container: any) => {
        ids.push(container.Id);
        this.nbContainers += 1;
        this.generalService.nbContainers += 1;
      })

      if (ids.length > 0) {
        this.dockerService.getStatsContainer(ids).subscribe(res => {

          res.forEach(stats => {

            if (stats.cpu_stats) {
              this.cpuUsed += this.calculCPUUsage(stats.cpu_stats, stats.precpu_stats);
            }
            if (stats.memory_stats.limit) {
              this.memoryUsed += (stats.memory_stats.usage * 100 / stats.memory_stats.limit);
            }
          });

          if (this.cpuUsed === 0) {
            this.cpuUsed = -1;
          }

          if (this.memoryUsed === 0) {
            this.memoryUsed = -1;
          }
          this.generalService.refreshInProgress = false;
          this.generalService.cpuUsed = this.cpuUsed;
          this.generalService.memoryUsed = this.memoryUsed;
        });

      } else {
        this.cpuUsed = -1;
        this.memoryUsed = -1;
        this.generalService.refreshInProgress = false;
      }

    },
    (error: any) => {
      this.generalService.refreshInProgress = false;
    });

  }


  onRefresh(): void {
    this.getInfo();
  }

  calculCPUUsage(stats: any, prec_stats: any): number {
    let cpuPercent = 0.0;
    const cpuDelta = stats.cpu_usage.total_usage - prec_stats.cpu_usage.total_usage;
    const systemDelta = stats.system_cpu_usage - prec_stats.system_cpu_usage;

    if (systemDelta > 0.0 && cpuDelta > 0.0) {
      cpuPercent = (cpuDelta / systemDelta) * stats.online_cpus * 100.0;
    }

    return cpuPercent;
  }

  fileConvertSize(aSize: number): string {
    aSize = Math.abs(aSize);
    const def = [1, 1024, 1024 * 1024, 1024 * 1024 * 1024, 1024 * 1024 * 1024 * 1024];
    const lab = ['octets', 'ko', 'Mo', 'Go', 'To'];

    for (let i = 0; i < def.length; i++) {
      if (aSize < def[i]) {
        return (aSize / def[i - 1]).toFixed(2) + ' ' + lab[i - 1];
      }
    }
  }

}
