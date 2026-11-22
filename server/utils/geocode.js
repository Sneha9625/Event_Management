// Turns a venue string into { lat, lng } using OpenStreetMap Nominatim.
// Returns null on any failure — a missing map pin should never stop
// someone from creating an event.
const geocode = async (address) => {
  if (!address) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;

    const response = await fetch(url, {
      // Nominatim blocks requests without an identifying User-Agent
      headers: { 'User-Agent': process.env.NOMINATIM_USER_AGENT || 'EventHub/1.0 (learning project)' },
      signal: AbortSignal.timeout(5000), // don't let a slow API hang our request
    });

    if (!response.ok) {
      console.warn(`Geocoding failed for "${address}": HTTP ${response.status}`);
      return null;
    }

    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) return null;

    return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
  } catch (error) {
    console.warn(`Geocoding failed for "${address}": ${error.message}`);
    return null;
  }
};

module.exports = geocode;
