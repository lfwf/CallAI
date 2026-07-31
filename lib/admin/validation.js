export function validatePublishDraft(draft) {
  const required = ["title", "officialUrl", "organizer", "deadline"];
  return required.filter((key) => !draft?.[key]);
}
