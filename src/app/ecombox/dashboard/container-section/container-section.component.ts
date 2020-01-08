import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProgressInfo } from '../../../@core/data/stats-progress-bar';
import { RestService } from '../../services/rest.service';
import { GeneralService } from '../../services/general.service';
import { PluralPipe } from '../../services/shared/plural.pipe';

@Component({
  selector: 'ngx-container-section',
  styleUrls: ['./container-section.component.scss', './animate.css', '../dashboard.component.scss'],
  templateUrl: './container-section.component.html',
  providers: [
    PluralPipe,
  ],
})
export class ContainerSectionComponent implements OnInit, OnDestroy {

  private alive = true;

  progressInfoData: ProgressInfo[];

  constructor(private generalService: GeneralService,
    private dockerService: RestService, private pluralPipe: PluralPipe) { }

  ngOnInit(): void {
    this.getInfo();
  }

  // Pas propre, à refaire
  getInfo(): void {
    this.dockerService.getAllContainers().subscribe((containers: Array<any>) => {
      let nbWP = 0;
      let nbPresta = 0;
      let nbHumHub = 0;
      let nbWoo = 0;
      let nbNautic = 0;
      let nbCRM = 0;
      let nbOdoo = 0;
      let nbKanboard = 0;

      let nbWPRunning = 0;
      let nbPrestaRunning = 0;
      let nbHumHubRunning = 0;
      let nbWooRunning = 0;
      let nbNauticRunning = 0;
      let nbCRMRunning = 0;
      let nbOdooRunning = 0;
      let nbKanboardRunning = 0;
      containers.forEach((container: any) => {

        const service = container.Names[0];

        if (!service.includes('-db-')) {
          if (service.includes('/prestashop-')) {
            nbPresta += 1;
            if (container.State === 'running') {
              nbPrestaRunning += 1;
            }
          } else if (service.includes('/woocommerce-')) {
            nbWoo += 1;
            if (container.State === 'running') {
              nbWooRunning += 1;
            }
          } else if (service.includes('/blog-')) {
            nbWP += 1;
            if (container.State === 'running') {
              nbWPRunning += 1;
            }
          } else if (service.includes('/suitecrm-')) {
            nbCRM += 1;
            if (container.State === 'running') {
              nbCRMRunning += 1;
            }
          } else if (service.includes('/kanboard-')) {
            nbKanboard += 1;
            if (container.State === 'running') {
              nbKanboardRunning += 1;
            }
          } else if (service.includes('/odoo-')) {
            nbOdoo += 1;
            if (container.State === 'running') {
              nbOdooRunning += 1;
            }
          } else if (service.includes('/humhub-')) {
            nbHumHub += 1;
            if (container.State === 'running') {
              nbHumHubRunning += 1;
            }
          } else if (service.includes('/mautic-')) {
            nbNautic += 1;
            if (container.State === 'running') {
              nbNauticRunning += 1;
            }
          }
        }
      },
        (error: any) => {
          if (error.status === 401) {
            //console.log('ERREUR 401');
          }
        });

      this.progressInfoData = [
        {
          title: 'Prestashop :',
          value: nbPresta,
          activeProgress: nbPrestaRunning * 100 / nbPresta,
          description: `${nbPrestaRunning}
          ${this.pluralPipe.transform('site démarré', nbPrestaRunning)} sur ${nbPresta}`,
        },
        {
          title: 'Woocommerce :',
          value: nbWoo,
          activeProgress: nbWooRunning * 100 / nbWoo,
          description: `${nbWooRunning}
          ${this.pluralPipe.transform('site démarré', nbWooRunning)} sur ${nbWoo}`,
        },
        {
          title: 'Wordpress - Blog :',
          value: nbWP,
          activeProgress: nbWPRunning * 100 / nbWP,
          description: `${nbWPRunning}
          ${this.pluralPipe.transform('site démarré', nbWPRunning)} sur ${nbWP}`,
        },
        {
          title: 'Mautic :',
          value: nbNautic,
          activeProgress: nbNauticRunning * 100 / nbNautic,
          description: `${nbNauticRunning}
          ${this.pluralPipe.transform('site démarré', nbNauticRunning)} sur ${nbNautic}`,
        },
        {
          title: 'SuiteCRM :',
          value: nbCRM,
          activeProgress: nbCRMRunning * 100 / nbCRM,
          description: `${nbCRMRunning}
          ${this.pluralPipe.transform('site démarré', nbCRMRunning)} sur ${nbCRM}`,
        },
        {
          title: 'Odoo :',
          value: nbOdoo,
          activeProgress: nbOdooRunning * 100 / nbOdoo,
          description: `${nbOdooRunning}
          ${this.pluralPipe.transform('site démarré', nbOdooRunning)} sur ${nbOdoo}`,
        },
        {
          title: 'Kanboard :',
          value: nbKanboard,
          activeProgress: nbKanboardRunning * 100 / nbKanboard,
          description: `${nbKanboardRunning}
          ${this.pluralPipe.transform('site démarré', nbKanboardRunning)} sur ${nbKanboard}`,
        },
        {
          title: 'Humhub :',
          value: nbHumHub,
          activeProgress: nbHumHubRunning * 100 / nbHumHub,
          description: `${nbHumHubRunning}
          ${this.pluralPipe.transform('site démarré', nbHumHubRunning)} sur ${nbHumHub}`,
        },
      ];

    });
  }

  ngOnDestroy() {
    this.alive = true;
  }
}
