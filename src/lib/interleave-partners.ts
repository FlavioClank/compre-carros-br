/**
 * Interleave ads into a vehicle list: 1 ad every `interval` vehicles.
 *
 * `adStartIndex` lets callers offset into the ads array so that
 * consecutive pages pick up where the previous page left off,
 * cycling through all active ads before repeating.
 *
 * Returns at most `maxAds` ads per call.
 */
export function interleaveVehiclesWithPartners<V, A>(
  vehicles: V[],
  ads: A[],
  maxAds = 7,
  adStartIndex = 0,
  interval = 4,
): Array<{ type: "car"; data: V } | { type: "ad"; data: A }> {
  const items: Array<{ type: "car"; data: V } | { type: "ad"; data: A }> = [];

  if (ads.length === 0) {
    return vehicles.map((v) => ({ type: "car" as const, data: v }));
  }

  let adCount = 0;
  let adIdx = adStartIndex % ads.length;

  vehicles.forEach((vehicle, index) => {
    items.push({ type: "car", data: vehicle });

    // Insert 1 ad every `interval` vehicles, up to maxAds
    if ((index + 1) % interval === 0 && adCount < maxAds) {
      items.push({ type: "ad", data: ads[adIdx] });
      adIdx = (adIdx + 1) % ads.length;
      adCount++;
    }
  });

  return items;
}
