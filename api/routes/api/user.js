import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

import { authenticate } from '../../middleware/auth.js'
import { requireSuperadmin, requireAdminOrSuperadmin } from '../../middleware/superadmin.js'
import UserService from '../../services/user.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'avatars')

if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadsDir)
	},
	filename: function (req, file, cb) {
		const userId = req.user?._id || 'unknown'
		const ext = path.extname(file.originalname)
		cb(null, `avatar-${userId}-${Date.now()}${ext}`)
	}
})

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: function (req, file, cb) {
		const allowedTypes = /jpeg|jpg|png|gif|webp/
		const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
		const mimetype = allowedTypes.test(file.mimetype)
		if (mimetype && extname) {
			return cb(null, true)
		}
		cb(new Error('Only image files are allowed!'))
	}
})

const UserRoutes = Router()

UserRoutes.post('/register', authenticate, requireAdminOrSuperadmin, async (req, res) => {
	try {
		const registrationData = {
			...req.body,
			registrationIp: req.ip,
			userAgent: req.get('User-Agent')
		}

		const user = await UserService.registerUser(registrationData, req.user)

		if (!user) {
			throw new Error('Unable to register user!')
		}

		res.status(201).json(user)
	} catch (error) {
		res.status(400).json({ error: error.message })
	}
})

UserRoutes.post('/login', async (req, res) => {
	try {
		const loginData = {
			...req.body,
			loginIp: req.ip,
			userAgent: req.get('User-Agent')
		}

		const user = await UserService.loginUser(loginData)

		if (!user) {
			throw new Error('Unable to login!')
		}

		res.status(200).json(user)
	} catch (error) {
		res.status(401).json({ error: error.message })
	}
})

UserRoutes.get('/profile', authenticate, async (req, res) => {
	try {
		if (!req.user || !req.user._id) {
			throw new Error('User not found in session!')
		}

		const user = await UserService.getUserByID(req.user._id)

		res.status(200).json(user)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

UserRoutes.get('/key/:userKey', authenticate, async (req, res) => {
	try {
		const { userKey } = req.params

		const user = await UserService.getUserByKey(userKey)

		res.status(200).json(user)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

UserRoutes.put('/profile', authenticate, async (req, res) => {
	try {
		if (!req.user || !req.user._id) {
			throw new Error('User not found in session!')
		}

		const updatedUser = await UserService.updateUser(req.user._id, req.body, { user: req.user })

		if (!updatedUser) {
			throw new Error('Unable to update user profile!')
		}

		res.status(200).json(updatedUser)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

UserRoutes.get('/', authenticate, async (req, res) => {
	try {
		const users = await UserService.getUsers(req.query)

		res.status(200).json(users)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

UserRoutes.get('/search', authenticate, async (req, res) => {
	try {
		const { q } = req.query

		if (!q) {
			throw new Error('Search query is required!')
		}

		const users = await UserService.searchUsers(q)

		res.status(200).json(users)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

UserRoutes.post('/:userId/deactivate', authenticate, requireSuperadmin, async (req, res) => {
	try {
		const { userId } = req.params

		const user = await UserService.deactivateUser(userId, { user: req.user })

		if (!user) {
			throw new Error('Unable to deactivate user!')
		}

		res.status(200).json(user)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

UserRoutes.post('/:userId/reactivate', authenticate, requireSuperadmin, async (req, res) => {
	try {
		const { userId } = req.params

		const user = await UserService.reactivateUser(userId, { user: req.user })

		if (!user) {
			throw new Error('Unable to reactivate user!')
		}

		res.status(200).json(user)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

UserRoutes.get('/:userId', authenticate, async (req, res) => {
	try {
		const { userId } = req.params

		const user = await UserService.getUserByIDForAdmin(userId)

		if (!user) {
			throw new Error('User not found!')
		}

		res.status(200).json(user)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

UserRoutes.put('/:userId', authenticate, requireAdminOrSuperadmin, async (req, res) => {
	try {
		const { userId } = req.params
		const updateData = req.body

		const user = await UserService.updateUserByAdmin(userId, updateData, req.user)

		if (!user) {
			throw new Error('Unable to update user!')
		}

		res.status(200).json(user)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

UserRoutes.post('/:userId/change-role', authenticate, requireSuperadmin, async (req, res) => {
	try {
		const { userId } = req.params
		const { role } = req.body

		if (!role || !['user', 'admin', 'superadmin'].includes(role)) {
			throw new Error('Invalid role specified!')
		}

		const user = await UserService.updateUserRole(userId, role, req.user)

		if (!user) {
			throw new Error('Unable to change user role!')
		}

		res.status(200).json(user)
	} catch (error) {
		res.status(200).json({ message: error.message })
	}
})

UserRoutes.post('/change-password', authenticate, async (req, res) => {
	try {
		if (!req.user || !req.user._id) {
			throw new Error('User not found in session!')
		}

		const { currentPassword, newPassword } = req.body
		const result = await UserService.changePassword(req.user._id, currentPassword, newPassword)

		res.status(200).json(result)
	} catch (error) {
		res.status(400).json({ error: error.message })
	}
})

UserRoutes.post('/upload-avatar', authenticate, upload.single('avatar'), async (req, res) => {
	try {
		if (!req.user || !req.user._id) {
			throw new Error('User ID is required!')
		}

		if (!req.file) {
			throw new Error('No file uploaded!')
		}

		const avatarPath = `/uploads/avatars/${req.file.filename}`
		const updatedUser = await UserService.updateUser(req.user._id, { avatar: avatarPath }, { user: req.user })

		res.status(200).json(updatedUser)
	} catch (error) {
		res.status(200).json({ error: true, message: error.message })
	}
})

export default UserRoutes

