// ---------- Dates ----------
// Built by hand (instead of one toLocaleString call) so the format is the same
// in every browser: "Sat, 12 Dec 2026" and "6:00 PM".

export const formatDate = (date) => {
  const d = new Date(date);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  return `${weekday}, ${d.getDate()} ${month} ${d.getFullYear()}`;
};

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

// "Sat, 12 Dec 2026 • 6:00 PM"
export const formatDateTime = (date) => `${formatDate(date)} • ${formatTime(date)}`;

// For the little calendar badge on event cards: { day: '12', month: 'DEC' }
export const getDateParts = (date) => {
  const d = new Date(date);
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
  };
};

// <input type="date"> and <input type="time"> need LOCAL values ("2026-12-12", "18:00"),
// but toISOString() is UTC — so shift by the timezone offset first.
export const toLocalDateAndTime = (date) => {
  const d = new Date(date);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000).toISOString();
  return { date: local.slice(0, 10), time: local.slice(11, 16) };
};

export const isPast = (date) => new Date(date) < new Date();

// ---------- Users ----------

// "Olivia Organizer" → "OO"
export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
