import mongooseLoader from '../loaders/mongoose.js'
import { hashPassword } from '../inc/helpers.js'
import User from '../models/user.js'

const seed = async () => {
	try {
		console.log('Connecting to database...')
		await mongooseLoader()
		console.log('Connected to database')

		const email = 'david.baumwald@gmail.com'

		const existingUser = await User.getUserByEmail(email)

		if (existingUser) {
			console.log('Default superadmin user already exists.')
			process.exit(0)
		}

		const hashedPassword = hashPassword('password1234')

		const userData = {
			email,
			password: hashedPassword,
			firstName: 'David',
			lastName: 'Baumwald',
			role: 'superadmin',
			isActive: true,
			metadata: {
				registrationIp: '127.0.0.1',
				userAgent: 'Seed Script'
			}
		}

		const newUser = new User(userData)
		const savedUser = await newUser.save()

		if (!savedUser) {
			console.log('Failed to create default superadmin user.')
			process.exit(1)
		}

		console.log('Default superadmin user created successfully.')
		console.log(`Email: ${email}`)
		console.log(`Password: password1234`)
		console.log(`Key: ${savedUser.key}`)
	} catch (error) {
		console.error('Seed error:', error.message)
	} finally {
		process.exit(0)
	}
}

seed()

