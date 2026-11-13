import type { Role } from '../../store';

export const ROLES: Record<Role, string> = {
	owner: 'Owner',
	admin: 'Admin',
	developer: 'Developer'
};
