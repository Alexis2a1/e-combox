import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { RestService } from '../../services/rest.service';
import { GeneralService } from '../../services/general.service';
import { PluralPipe } from '../../services/shared/plural.pipe';

declare const echarts: any;

@Component({
  selector: 'ngx-memory',
  styleUrls: ['./memory.component.scss'],
  template: `
  <div echarts [options]="options" class="echart"></div>
  `,
  providers: [PluralPipe],
})
export class MemoryComponent implements AfterViewInit, OnDestroy {
  nbStarted = 0;
  nbStopped = 0;
  options: any = {};
  themeSubscription: any;

  constructor(private theme: NbThemeService, private generalService: GeneralService,
    private dockerService: RestService, private pluralPipe: PluralPipe) { }

  getInfo(): void {
    this.dockerService.getAllRunningContainers().subscribe((data: Array<any>) => {
      data.forEach((container: any) => {

        if (container.Labels['com.docker.compose.service']) {
          if (!container.Labels['com.docker.compose.service'].includes('sftp') &&
            !container.Labels['com.docker.compose.service'].includes('portainer') &&
            !container.Labels['com.docker.compose.service'].includes('proxy') &&
            !container.Labels['com.docker.compose.service'].includes('watchtower') &&
            !container.Labels['com.docker.compose.service'].includes('phpmyadmin') &&
            !container.Labels['com.docker.compose.service'].includes('db') &&
            !container.Labels['com.docker.compose.service'].includes('e-combox')) {

              this.nbStarted += 1;
          }
        }
      });

      this.dockerService.getContainersByFiltre('{"status": ["exited"]}').subscribe((containers: Array<any>) => {
        this.nbStopped = 0;

        containers.forEach((info: any) => {
          if (info.Labels['com.docker.compose.service']) {
            if (!info.Labels['com.docker.compose.service'].includes('sftp') &&
              !info.Labels['com.docker.compose.service'].includes('portainer') &&
              !info.Labels['com.docker.compose.service'].includes('proxy') &&
              !info.Labels['com.docker.compose.service'].includes('watchtower') &&
              !info.Labels['com.docker.compose.service'].includes('phpmyadmin') &&
              !info.Labels['com.docker.compose.service'].includes('db')) {

              this.nbStopped += 1;
            }
          }
        });

        this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
          const colors = config.variables;
          // tslint:disable-next-line:no-shadowed-variable
          const echarts: any = config.variables.echarts;
          const textStarted = this.pluralPipe.transform('démarré', this.nbStarted);
          const textStopped = this.pluralPipe.transform('arrêté', this.nbStopped);

          this.options = {
            backgroundColor: echarts.bg,
            color: [colors.successLight, colors.dangerLight],
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b} : ({d}%)',
            },
            legend: {
              orient: 'vertical',
              left: 'left',
              data: [this.nbStarted + ' ' + textStarted, this.nbStopped + ' ' + textStopped],
              textStyle: {
                color: echarts.textColor,
              },
            },
            series: [
              {
                name: 'Sites',
                type: 'pie',
                radius: '80%',
                center: ['50%', '50%'],
                data: [
                  { value: this.nbStarted, name: this.nbStarted + ' ' + textStarted },
                  { value: this.nbStopped, name: this.nbStopped + ' ' + textStopped },
                ],
                itemStyle: {
                  emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: echarts.itemHoverShadowColor,
                  },
                },
                label: {
                  normal: {
                    textStyle: {
                      color: echarts.textColor,
                    },
                  },
                },
                labelLine: {
                  normal: {
                    lineStyle: {
                      color: echarts.axisLineColor,
                    },
                  },
                },
              },
            ],
          };
        });
      });
    },
    (error: any) => {
      if (error.status === 401) {
        //console.log('ERREUR 401');
      }
    });

  }

  ngAfterViewInit() {
    this.getInfo();
  }

  ngOnDestroy(): void {
    // this.themeSubscription.unsubscribe();
  }
}
