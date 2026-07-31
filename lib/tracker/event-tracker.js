export function createTrackingRecord(event) {
  return {
    eventId: event.id,
    url: event.officialUrl,
    lastCheckedAt: null,
    lastSnapshot: null,
    status: "active"
  };
}

export function buildChangeSummary(previous, current) {
  const changes = [];
  if (previous.deadline !== current.deadline) changes.push("deadline changed");
  if (previous.reward !== current.reward) changes.push("reward changed");
  return changes;
}
