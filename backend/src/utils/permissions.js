export function isSameId(a, b) {
  return String(a) === String(b);
}

export function canAccessProject(userId, project) {
  const ownerMatch = isSameId(project.owner, userId);
  const memberMatch = project.members.some((member) => isSameId(member, userId));
  return ownerMatch || memberMatch;
}

export function canModifyResource(userId, ownerId) {
  return isSameId(userId, ownerId);
}
