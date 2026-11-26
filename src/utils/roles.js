/**
 * Re-export modul terpusat `permissions.js` agar seluruh import eksisting (`../utils/roles`)
 * selalu menggunakan satu sumber kebenaran 6 Role & Permission resmi ARVÉA.
 */
export {
  USER_ROLES,
  MENU_ROUTES,
  OFFICIAL_ROLE_DEFINITIONS,
  ROLE_PERMISSIONS,
  DEPRECATED_USER_IDS,
  DEPRECATED_USERNAMES,
  DEPRECATED_ROLE_NAMES,
  isDeprecatedUnitRoleAccount,
  normalizeRole,
  getRoleMeta,
  getAllowedMenusForRole,
  canRoleAccessMenu,
  filterMenusForRole,
  getPathForMenu,
  resolveMenuFromPath
} from './permissions';
