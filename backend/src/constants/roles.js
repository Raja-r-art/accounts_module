'use strict';

const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  PRINCIPAL: 'principal',
  ACCOUNTANT: 'accountant',
  STUDENT: 'student',
  PARENT: 'parent',
});

const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 5,
  [ROLES.PRINCIPAL]: 4,
  [ROLES.ACCOUNTANT]: 3,
  [ROLES.STUDENT]: 2,
  [ROLES.PARENT]: 1,
};

module.exports = { ROLES, ROLE_HIERARCHY };
