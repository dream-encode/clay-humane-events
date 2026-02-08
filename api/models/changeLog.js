import { model } from 'mongoose'

import ChangeLogSchema from '../schemas/ChangeLog.js'

const ChangeLog = model('ChangeLog', ChangeLogSchema)

export default ChangeLog

