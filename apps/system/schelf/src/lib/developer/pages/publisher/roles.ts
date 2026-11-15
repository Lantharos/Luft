import { t } from '@luft/i18n';
import type { Role } from '../../store';

const ROLES: Record<Role, string> = {
	owner: 'developer-role-owner',
	admin: 'developer-role-admin',
	developer: 'developer-role-developer'
};

export const roleName = (role: Role) => t(ROLES[role]);
