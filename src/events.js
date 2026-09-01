export function createEventLog() {
  const events = [];

  return {
    append(type, data) {
      const event = { sequence: events.length + 1, type, data: structuredClone(data) };
      events.push(event);
      return structuredClone(event);
    },

    list() {
      return structuredClone(events);
    },
  };
}
