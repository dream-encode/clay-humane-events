import AdminNotificationRoutes from '../routes/api/adminNotification.js'
import AnalyticsRoutes from '../routes/api/analytics.js'
import ApiKeyRoutes from '../routes/api/apiKey.js'
import AuthRoutes from '../routes/api/auth.js'
import ChangeLogRoutes from '../routes/api/changeLog.js'
import DatabaseBackupRoutes from '../routes/api/databaseBackup.js'
import DataMigrationRoutes from '../routes/api/dataMigration.js'
import EmailRoutes from '../routes/api/email.js'
import EmailTemplateRoutes from '../routes/api/emailTemplate.js'
import EventRoutes from '../routes/api/event.js'
import EventRegistrationRoutes from '../routes/api/eventRegistration.js'
import NoteRoutes from '../routes/api/note.js'
import ScheduledTaskRoutes from '../routes/api/scheduledTask.js'
import SiteOptionRoutes from '../routes/api/siteOption.js'
import UserRoutes from '../routes/api/user.js'

export default ({ app }) => {
	app.use('/adminNotification', AdminNotificationRoutes)
	app.use('/analytics', AnalyticsRoutes)
	app.use('/apiKey', ApiKeyRoutes)
	app.use('/auth', AuthRoutes)
	app.use('/changeLog', ChangeLogRoutes)
	app.use('/databaseBackup', DatabaseBackupRoutes)
	app.use('/dataMigration', DataMigrationRoutes)
	app.use('/email', EmailRoutes)
	app.use('/emailTemplate', EmailTemplateRoutes)
	app.use('/event', EventRoutes)
	app.use('/eventRegistration', EventRegistrationRoutes)
	app.use('/note', NoteRoutes)
	app.use('/scheduledTask', ScheduledTaskRoutes)
	app.use('/siteOption', SiteOptionRoutes)
	app.use('/user', UserRoutes)

	return app
}

