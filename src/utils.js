export function getSeverityColor(severity) {
  // Maps severity from 0-10 to a hue from 120 (green) to 0 (red).
  const hue = (10 - severity) * 12;
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
