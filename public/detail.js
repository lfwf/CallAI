import { makeIcs } from "./event-utils.mjs?v=20260731-8";

const button = document.querySelector("#detailCalendar");

if (button) {
  button.addEventListener("click", async () => {
    const response = await fetch("/events.json", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    const event = payload.events?.find((item) => item.id === button.dataset.eventId);
    if (!event) return;

    const blob = new Blob([makeIcs(event)], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${event.id}.ics`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 500);
  });
}
