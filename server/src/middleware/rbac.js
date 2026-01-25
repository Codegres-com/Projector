const checkPermission = (resource, action) => {
  return (req, res, next) => {
    // req.user is populated by passport
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const role = req.user.role;

    if (!role) {
      // Should not happen if migration worked, but handle case
      return res.status(403).json({ message: 'Access Denied: No Role Assigned' });
    }

    // Explicit Admin override
    if (role.name === 'Admin') {
      return next();
    }

    // Safety check for permissions object
    if (!role.permissions) {
        return res.status(403).json({ message: 'Access Denied: Role has no permissions' });
    }

    const resourcePerms = role.permissions[resource];

    if (!resourcePerms) {
       // If resource not defined in role (e.g. new resource added but role not updated), deny
       return res.status(403).json({ message: `Access Denied: No permissions defined for ${resource}` });
    }

    if (resourcePerms[action] === true) {
      return next();
    } else {
      return res.status(403).json({ message: `Access Denied: Insufficient permissions for ${resource}:${action}` });
    }
  };
};

module.exports = { checkPermission };
