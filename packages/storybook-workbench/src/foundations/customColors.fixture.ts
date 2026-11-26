/** Colors a person might pick outside the swatches. The first three have no hue to draw. */
export const freeColors = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#ffffff" },
  { name: "Gray", hex: "#808080" },
  { name: "Slate", hex: "#708090" },
  { name: "Navy", hex: "#14213d" },
  { name: "Pure blue", hex: "#0000ff" },
  { name: "Lavender", hex: "#cdb4db" },
  { name: "Pastel pink", hex: "#ffb3c1" },
  { name: "Pure red", hex: "#ff0000" },
  { name: "Maroon", hex: "#6a040f" },
  { name: "Brown", hex: "#7f5539" },
  { name: "Sand", hex: "#e9c46a" },
  { name: "Pure yellow", hex: "#ffff00" },
  { name: "Olive", hex: "#6b705c" },
  { name: "Forest", hex: "#1b4332" },
  { name: "Teal", hex: "#2a9d8f" },
] as const;

/** Tags as a tracker stores them: a color is a hex value, or absent. */
export const tags = [
  { name: "Urgent", color: "#ff0053" },
  { name: "Design", color: "#cdb4db" },
  { name: "Backend", color: "#708090" },
  { name: "Research", color: "#6b705c" },
  { name: "Finance", color: "#e9c46a" },
  { name: "Waiting", color: undefined },
] as const;

/** A day's events by calendar, as a calendar application stores them. */
export const calendars = [
  {
    name: "Team",
    color: "#01beff",
    events: [
      { time: "09:30", title: "Weekly review" },
      { time: "14:00", title: "Hiring panel" },
    ],
  },
  { name: "Family", color: "#ffb3c1", events: [{ time: "12:15", title: "Lunch with Ines" }] },
  { name: "Garden", color: "#1b4332", events: [{ time: "17:30", title: "Water the seedlings" }] },
  { name: "Personal", color: undefined, events: [{ time: "19:00", title: "Call the plumber back" }] },
] as const;
