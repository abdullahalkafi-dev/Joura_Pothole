import { PotholeReport } from "./potholeReport.model";

export async function checkForNearbyReports(
  latitude: number,
  longitude: number,
  issueType: string
) {
  const maxDistance = 10; // 10 meters
  const existingReport = await PotholeReport.findOne({
    issue: issueType,
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude], // Note: MongoDB uses [long, lat]
        },
        $maxDistance: maxDistance,
      },
    },
  });

  return existingReport;
}
