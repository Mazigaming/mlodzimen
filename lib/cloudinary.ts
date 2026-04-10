import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const avatarsDir = path.join(process.cwd(), 'public/uploads/avatars');
const articlesDir = path.join(process.cwd(), 'public/uploads/articles');

// Ensure directories exist on startup
ensureDir(avatarsDir);
ensureDir(articlesDir);

export async function uploadImage(buffer: Buffer, folder: string): Promise<string> {
  // Generate unique filename
  const uniqueId = crypto.randomUUID();
  const ext = 'jpg'; // Default extension
  const filename = `${uniqueId}.${ext}`;
  
  // Determine which folder to use based on the 'folder' parameter
  let uploadDir: string;
  if (folder.includes('avatar')) {
    uploadDir = avatarsDir;
  } else if (folder.includes('article')) {
    uploadDir = articlesDir;
  } else {
    uploadDir = path.join(process.cwd(), 'public/uploads', folder);
  }
  
  ensureDir(uploadDir);
  
  const filepath = path.join(uploadDir, filename);
  
  // Write file to disk
  fs.writeFileSync(filepath, buffer);
  
  // Return the public URL path
  const publicPath = filepath.replace(path.join(process.cwd(), 'public'), '');
  return publicPath;
}

export async function deleteImage(filepath: string): Promise<void> {
  // Full path to the file
  const fullPath = path.join(process.cwd(), 'public', filepath);
  
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}