const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  create: { type: Boolean, default: false },
  read:   { type: Boolean, default: false },
  update: { type: Boolean, default: false },
  delete: { type: Boolean, default: false }
}, { _id: false });

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  permissions: {
    projects: { type: permissionSchema, default: () => ({}) },
    tasks:    { type: permissionSchema, default: () => ({}) },
    bugs:     { type: permissionSchema, default: () => ({}) },
    documents:{ type: permissionSchema, default: () => ({}) },
    credentials: { type: permissionSchema, default: () => ({}) },
    decisionLogs: { type: permissionSchema, default: () => ({}) },
    chat:         { type: permissionSchema, default: () => ({}) },
    team:     { type: permissionSchema, default: () => ({}) },
    roles:    { type: permissionSchema, default: () => ({}) }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', RoleSchema);
