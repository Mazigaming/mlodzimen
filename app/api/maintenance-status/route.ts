import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Check if maintenance file exists
    const maintenanceFile = path.join(process.cwd(), '.maintenance');

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