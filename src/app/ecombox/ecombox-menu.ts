import { NbMenuItem } from '@nebular/theme';

export const MENU_ECOMBOX_ITEMS: NbMenuItem[] = [
  {
		title: 'Tableau de bord',
		icon: 'nb-home',
		link: '/ecombox/dashboard',
		home: true,
  }, {
		title: 'Prestashop',
		icon: 'nb-e-commerce',
		link: '/ecombox/servers/prestashop',
		home: true,
  }, {
		title: 'WooCommerce',
		icon: 'nb-e-commerce',
		link: '/ecombox/servers/woocommerce',
		home: true,
  }, {
		title: 'Blog',
		icon: 'nb-compose',
		link: '/ecombox/servers/blog',
		home: true,
  }, {
		title: 'Mautic',
		icon: 'nb-e-commerce',
		link: '/ecombox/servers/mautic',
		home: true,
  }, {
		title: 'Suite CRM',
		icon: 'nb-layout-default',
		link: '/ecombox/servers/suitecrm',
		home: true,
  }, {
		title: 'Odoo',
		icon: 'nb-collapse',
		link: '/ecombox/servers/odoo',
		home: true,
  }, {
		title: 'Kanboard',
		icon: 'nb-lightbulb',
		link: '/ecombox/servers/kanboard',
		home: true,
  }, {
		title: 'HumHub',
		icon: 'nb-person',
		link: '/ecombox/servers/humhub',
		home: true,
  }, {
		title: 'Gestion avancée',
		icon: 'nb-alert',
		children: [
		{
			title: 'Accès SFTP',
			link: '/ecombox/servers/sftp',
		}, {
			title: 'Accès phpMyAdmin',
			link: '/ecombox/servers/pma',
		}, {
			title: 'Accès admin',
			link: '/ecombox/portainer',
		},
	]}, {
		title: 'Aide',
		icon: 'nb-help',
		link: '/ecombox/aide',
		home: true,
	},
];
