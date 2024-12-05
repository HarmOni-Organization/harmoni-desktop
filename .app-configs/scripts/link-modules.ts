import fs from 'fs';
import webpackPaths from '../configs/webpack.paths';

const { srcNodeModulesPath, appNodeModulesPath, erbNodeModulesPath } =
  webpackPaths;

// Function to safely create a symlink
const createSymlink = (target: string, path: string, type: fs.symlink.Type) => {
  try {
    if (fs.existsSync(path)) {
      const stat = fs.lstatSync(path);
      if (stat.isSymbolicLink()) {
        const resolvedTarget = fs.readlinkSync(path);
        if (resolvedTarget === target) {
          console.log(
            `Symlink already exists and points to the correct target: ${path}`,
          );
          return;
        } else {
          console.log(
            `Symlink exists but points to a different target. Removing: ${path}`,
          );
          fs.unlinkSync(path);
        }
      } else {
        console.log(`Path exists but is not a symlink. Removing: ${path}`);
        fs.rmSync(path, { recursive: true, force: true });
      }
    }
    fs.symlinkSync(target, path, type);
    console.log(`Symlink created: ${path} -> ${target}`);
  } catch (err: any) {
    console.error(`Error creating symlink: ${err.message}`);
  }
};

if (fs.existsSync(appNodeModulesPath)) {
  createSymlink(appNodeModulesPath, srcNodeModulesPath, 'junction');
  createSymlink(appNodeModulesPath, erbNodeModulesPath, 'junction');
}
