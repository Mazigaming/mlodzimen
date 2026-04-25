import { promises as fs } from 'fs';

export async function GET() {
  try {
    // Check if maintenance file exists
    const maintenanceFile = '.maintenance';

    try {
      await fs.access(maintenanceFile);
      return Response.json({ maintenanceMode: true });
    } catch {
      return Response.json({ maintenanceMode: false });
    }
  } catch (error) {
    console.error('Maintenance status check error:', error);
    // If anything fails, default to no maintenance
    return Response.json({ maintenanceMode: false });
  }
}