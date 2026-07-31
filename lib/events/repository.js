import { readJson, writeJson } from "../data/json-store";

const FILE = "events.json";

export function getEvents() {
  return readJson(FILE, []);
}

export function saveEvents(events) {
  return writeJson(FILE, events);
}

export function findEvent(id) {
  return getEvents().find((item) => item.id === id);
}
