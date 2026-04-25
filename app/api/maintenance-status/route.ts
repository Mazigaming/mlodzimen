import { promises as fs } from 'fs';

export async function GET() {
  try {
    // Check if maintenance file exists (use absolute path)
    const maintenanceFile = '/root/mlodzimen/.maintenance';

    try {
      await fs.access(maintenanceFile);
      return Response.json({ maintenanceMode: true });
    } catch {
      return Response.json({ maintenanceMode: false });
    }
  } catch {
    // If anything fails, default to no maintenance
    return Response.json({ maintenanceMode: false });
  }
}