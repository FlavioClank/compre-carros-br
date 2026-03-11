/**
 * Interleave ads into a vehicle list: 1 ad every 5 vehicles.
 * Returns at most `maxAds` ads (default 6).
 */
export function interleaveVehiclesWithPartners<V, A>(
  vehicles: V[],
  ads: A[],
  maxAds = 6,
): Array<{ type: "car"; data: V } | { type: "ad"; data: A }> {
  const items: Array<{ type: "car"; data: V } | { type: "ad"; data: A }> = [];
  let adIndex = 0;

  vehicles.forEach((vehicle, index) => {
    items.push({ type: "car", data: vehicle });

    // Insert 1 ad every 5 vehicles, up to maxAds
    if (ads.length > 0 && (index + 1) % 5 === 0 && adIndex < maxAds && adIndex < ads.length) {
      items.push({ type: "ad", data: ads[adIndex % ads.length] });
      adIndex++;
    }
  });

  return items;
}
