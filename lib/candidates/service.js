import { readJson, writeJson } from "../data/json-store";

const FILE = "candidates.json";

export function getCandidates() {
  return readJson(FILE, { candidates: [] }).candidates;
}

export function updateCandidate(id, updater) {
  const data = readJson(FILE, { candidates: [] });
  data.candidates = data.candidates.map((item) => item.id === id ? updater(item) : item);
  writeJson(FILE, data);
  return data.candidates.find((item) => item.id === id);
}

export function startTracking(id) {
  return updateCandidate(id, (item) => ({
    ...item,
    status: "tracking",
    trackingStartedAt: new Date().toISOString()
  }));
}
