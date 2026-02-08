import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import Loader from './Loader/Loader'
import PrivateRoute from './Private'

const Login = lazy( () => import( './Login' ) )
const ForgotPassword = lazy( () => import( '../Pages/ForgotPassword' ) )
const ResetPassword = lazy( () => import( '../Pages/ResetPassword' ) )
const Home = lazy( () => import( '../Pages/Home' ) )
const Profile = lazy( () => import( '../Pages/Profile' ) )
const EventRegistration = lazy( () => import( '../Pages/EventRegistration' ) )
const AdminNotifications = lazy( () => import( '../Pages/Admin/AdminNotifications' ) )
const ApiKeys = lazy( () => import( '../Pages/Admin/ApiKeys' ) )
const Backups = lazy( () => import( '../Pages/Admin/Backups' ) )
const ChangeLog = lazy( () => import( '../Pages/Admin/ChangeLog' ) )
const Dashboard = lazy( () => import( '../Pages/Admin/Dashboard' ) )
const Emails = lazy( () => import( '../Pages/Admin/Emails' ) )
const EmailTemplates = lazy( () => import( '../Pages/Admin/EmailTemplates' ) )
const Events = lazy( () => import( '../Pages/Admin/Events' ) )
const EventEdit = lazy( () => import( '../Pages/Admin/EventEdit' ) )
const Migrations = lazy( () => import( '../Pages/Admin/Migrations' ) )
const Registrations = lazy( () => import( '../Pages/Admin/Registrations' ) )
const ScheduledTasks = lazy( () => import( '../Pages/Admin/ScheduledTasks' ) )
const Settings = lazy( () => import( '../Pages/Admin/Settings' ) )
const Users = lazy( () => import( '../Pages/Admin/Users' ) )

const Main = () => {
	return (
		<main>
			<Suspense fallback={<Loader />}>
				<Routes>
					<Route exact path='/' element={<Home />} />
					<Route exact path='/login' element={<Login />} />
					<Route exact path='/forgot-password' element={<ForgotPassword />} />
					<Route exact path='/reset-password/:token' element={<ResetPassword />} />
					<Route exact path='/event/:eventKey/register' element={<EventRegistration />} />
					<Route element={<PrivateRoute />}>
						<Route exact path='/profile' element={<Profile />} />
					</Route>
					<Route exact path='/admin' element={<PrivateRoute />}>
						<Route exact path='adminNotifications' element={<AdminNotifications />} />
						<Route exact path='apiKeys' element={<ApiKeys />} />
						<Route exact path='backups' element={<Backups />} />
						<Route exact path='changeLog' element={<ChangeLog />} />
						<Route exact path='dashboard' element={<Dashboard />} />
						<Route exact path='emails' element={<Emails />} />
						<Route exact path='emailTemplates' element={<EmailTemplates />} />
						<Route exact path='events' element={<Events />} />
						<Route exact path='events/:eventId/edit' element={<EventEdit />} />
						<Route exact path='migrations' element={<Migrations />} />
						<Route exact path='registrations' element={<Registrations />} />
						<Route exact path='scheduledTasks' element={<ScheduledTasks />} />
						<Route exact path='settings' element={<Settings />} />
						<Route exact path='users' element={<Users />} />
					</Route>
				</Routes>
			</Suspense>
		</main>
	)
}

export default Main

