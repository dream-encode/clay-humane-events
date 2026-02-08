import { model } from 'mongoose'

import AuthSessionSchema from '../schemas/AuthSession.js'

let AuthSession = model('AuthSession', AuthSessionSchema)

AuthSession.getAuthSessionByID = (id) => {
	return AuthSession.findById(id)
}

AuthSession.getAuthSessionByUserLogin = (userLogin) => {
	return AuthSession.find(userLogin)
}

AuthSession.updateAuthSessionById = (id, user) => {
	return AuthSession.findByIdAndUpdate(id, user)
}

AuthSession.getAuthSessionByToken = (token) => {
	return AuthSession.findOne({ "token": token })
}

export default AuthSession

