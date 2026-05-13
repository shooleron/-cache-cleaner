import { User } from './types';

export function isAdmin(user: User): boolean {
  return user.role === 'owner';
}

export function canInviteUsers(user: User): boolean {
  return user.role === 'owner';
}

export function canManageRoles(user: User): boolean {
  return user.role === 'owner';
}

export function canManageAutomations(user: User): boolean {
  return user.role === 'owner';
}

export function canDeleteProjects(user: User): boolean {
  return user.role === 'owner';
}

export function canAccessCRM(user: User): boolean {
  return user.role === 'owner' || user.role === 'member';
}
