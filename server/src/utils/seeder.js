const User = require('../models/User');
const Role = require('../models/Role');
const mongoose = require('mongoose');

const allTrue = { create: true, read: true, update: true, delete: true };
const readOnly = { create: false, read: true, update: false, delete: false };
const noAccess = { create: false, read: false, update: false, delete: false };

const DEFAULT_ROLES = [
  {
    name: 'Admin',
    description: 'System Administrator with full access',
    isSystem: true,
    permissions: {
      projects: allTrue,
      tasks: allTrue,
      bugs: allTrue,
      documents: allTrue,
      credentials: allTrue,
      decisionLogs: allTrue,
      chat: allTrue,
      team: allTrue,
      roles: allTrue,
      clients: allTrue,
      requirements: allTrue,
      estimations: allTrue,
      quotations: allTrue
    }
  },
  {
    name: 'PM',
    description: 'Project Manager',
    isSystem: true,
    permissions: {
      projects: allTrue,
      tasks: allTrue,
      bugs: allTrue,
      documents: allTrue,
      credentials: allTrue,
      decisionLogs: allTrue,
      chat: allTrue,
      team: { create: true, read: true, update: true, delete: false },
      roles: { create: false, read: true, update: false, delete: false },
      clients: allTrue,
      requirements: allTrue,
      estimations: allTrue,
      quotations: allTrue
    }
  },
  {
    name: 'Developer',
    description: 'Software Developer',
    isSystem: true,
    permissions: {
      projects: readOnly,
      tasks: { create: false, read: true, update: true, delete: false },
      bugs: { create: true, read: true, update: true, delete: false },
      documents: { create: true, read: true, update: false, delete: false },
      credentials: readOnly,
      decisionLogs: { create: true, read: true, update: false, delete: false },
      chat: { create: true, read: true, update: false, delete: false },
      team: readOnly,
      roles: noAccess,
      clients: readOnly,
      requirements: readOnly,
      estimations: readOnly,
      quotations: readOnly
    }
  },
  {
    name: 'Client',
    description: 'Client Stakeholder',
    isSystem: true,
    permissions: {
      projects: readOnly,
      tasks: readOnly,
      bugs: { create: true, read: true, update: false, delete: false },
      documents: readOnly,
      credentials: noAccess,
      decisionLogs: readOnly,
      chat: { create: true, read: true, update: false, delete: false },
      team: noAccess,
      roles: noAccess,
      clients: noAccess,
      requirements: { create: true, read: true, update: true, delete: false },
      estimations: { create: false, read: true, update: false, delete: false },
      quotations: { create: false, read: true, update: false, delete: false }
    }
  }
];

const seedRoles = async () => {
  try {
    for (const roleDef of DEFAULT_ROLES) {
      const exists = await Role.findOne({ name: roleDef.name });
      if (!exists) {
        await Role.create(roleDef);
        console.log(`Role '${roleDef.name}' created.`);
      } else {
         if (roleDef.name === 'Admin') {
             await Role.findOneAndUpdate({ name: 'Admin' }, { permissions: roleDef.permissions });
        }
      }
    }
    console.log('Roles seeded successfully.');
  } catch (err) {
    console.error('Role seeding error:', err);
  }
};

const migrateUsers = async () => {
    try {
        const usersCollection = mongoose.connection.db.collection('users');
        const users = await usersCollection.find({}).toArray();

        for (const user of users) {
            if (typeof user.role === 'string') {
                const roleDoc = await Role.findOne({ name: user.role });
                if (roleDoc) {
                    await usersCollection.updateOne(
                        { _id: user._id },
                        { $set: { role: roleDoc._id } }
                    );
                    console.log(`Migrated user ${user.email} from string role '${user.role}' to ObjectId.`);
                } else {
                     const devRole = await Role.findOne({ name: 'Developer' });
                     if (devRole) {
                         await usersCollection.updateOne(
                             { _id: user._id },
                             { $set: { role: devRole._id } }
                         );
                         console.log(`Migrated user ${user.email} from unknown role '${user.role}' to 'Developer' role.`);
                     }
                }
            }
        }
    } catch (err) {
        console.error('User migration error:', err);
    }
}

const seedAdmin = async () => {
  try {
    await seedRoles();
    await migrateUsers();

    const adminExists = await User.findOne({ email: 'admin@projector.com' });

    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    const adminRole = await Role.findOne({ name: 'Admin' });
    if (!adminRole) {
        console.error('Admin Role not found, cannot create Admin user.');
        return;
    }

    console.log('Creating Admin with Role ID:', adminRole._id);

    const admin = new User({
      name: 'Admin User',
      email: 'admin@projector.com',
      password: 'password123',
      role: adminRole._id,
      skills: 'Management, Architecture',
      availability: 'Full-time'
    });

    const savedAdmin = await admin.save();
    console.log('Admin user created successfully:', savedAdmin);
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

module.exports = seedAdmin;
