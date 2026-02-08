export const ADMIN_VIEWS = [
	{
		key: 'dashboard',
		label: 'Dashboard',
		route: 'admin/dashboard',
		showInNav: true
	},
	{
		key: 'events',
		label: 'Events',
		showInNav: true,
		routes: [
			{
				key: 'allEvents',
				label: 'All Events',
				route: 'admin/events',
				showInNav: true
			},
			{
				key: 'registrations',
				label: 'Registrations',
				route: 'admin/registrations',
				showInNav: true
			}
		]
	},
	{
		key: 'users',
		label: 'Users',
		route: 'admin/users',
		showInNav: true
	},
	{
		key: 'email',
		label: 'Email',
		showInNav: true,
		routes: [
			{
				key: 'emails',
				label: 'Emails Sent',
				route: 'admin/emails',
				showInNav: true
			},
			{
				key: 'emailTemplates',
				label: 'Email Templates',
				route: 'admin/emailTemplates',
				showInNav: true
			}
		]
	},
	{
		key: 'system',
		label: 'System',
		showInNav: true,
		requireRole: 'superadmin',
		routes: [
			{
				key: 'backups',
				label: 'Backups',
				route: 'admin/backups',
				showInNav: true
			},
			{
				key: 'migrations',
				label: 'Migrations',
				route: 'admin/migrations',
				showInNav: true
			},
			{
				key: 'scheduledTasks',
				label: 'Scheduled Tasks',
				route: 'admin/scheduledTasks',
				showInNav: true
			},
			{
				key: 'settings',
				label: 'Settings',
				route: 'admin/settings',
				showInNav: true
			},
			{
				key: 'apiKeys',
				label: 'API Keys',
				route: 'admin/apiKeys',
				showInNav: true
			},
			{
				key: 'changelog',
				label: 'Change Log',
				route: 'admin/changeLog',
				showInNav: true
			}
		]
	}
]

