export const eventSchema = {
  title: "",
  organizer: "",
  officialUrl: "",
  deadline: null,
  startDate: null,
  reward: "",
  eligibility: [],
  categories: [],
  timeline: [],
  lastAnalyzedAt: null
};

export function normalizeEvent(raw = {}) {
  return {
    ...eventSchema,
    ...raw,
    lastAnalyzedAt: new Date().toISOString()
  };
}
