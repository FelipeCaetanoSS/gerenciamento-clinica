const path = require("path");

const defaultUploadDir = path.resolve(__dirname, "..", "uploads");

function getUploadBaseDir() {
  return path.resolve(process.env.UPLOAD_DIR || defaultUploadDir);
}

function toStoredUploadPath(filePath) {
  if (!filePath) return null;

  const uploadBaseDir = getUploadBaseDir();
  const relativeToUploadDir = path.relative(uploadBaseDir, filePath);

  if (
    relativeToUploadDir &&
    !relativeToUploadDir.startsWith("..") &&
    !path.isAbsolute(relativeToUploadDir)
  ) {
    return `uploads/${relativeToUploadDir.replace(/\\/g, "/")}`;
  }

  return path.relative(process.cwd(), filePath).replace(/\\/g, "/");
}

function resolveStoredUploadPath(storedPath) {
  if (!storedPath) return null;

  const uploadBaseDir = getUploadBaseDir();
  const normalizedPath = String(storedPath).replace(/\\/g, "/");
  const relativePath = normalizedPath.startsWith("uploads/")
    ? normalizedPath.slice("uploads/".length)
    : normalizedPath;
  const absolutePath = path.resolve(uploadBaseDir, relativePath);

  if (absolutePath !== uploadBaseDir && !absolutePath.startsWith(`${uploadBaseDir}${path.sep}`)) {
    return null;
  }

  return absolutePath;
}

module.exports = {
  getUploadBaseDir,
  resolveStoredUploadPath,
  toStoredUploadPath,
};
