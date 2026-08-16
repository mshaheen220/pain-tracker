export function getSeverityColor(severity) {
  // Maps severity from 0-10 to a hue from 60 (yellow) to 0 (red).
  const hue = 60 - (severity * 6);
  // For low severity, we want it to be less saturated.
  const saturation = 70 + (severity * 3); // 70% to 100%
  const lightness = 50;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function formatLocation(location) {
  const { bodyPart, side, specific } = location;
  let locationString = bodyPart || 'N/A';

  if (side && side !== 'center') {
    locationString += `, ${side.charAt(0).toUpperCase() + side.slice(1)}`;
  }
  if (specific && specific.toLowerCase() !== bodyPart.toLowerCase()) {
    locationString += ` (${specific})`;
  }
  return locationString;
}

export function toLocalISOString(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
