// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
const beforRootPath = path.resolve(__dirname);
const afterRootPath = path.resolve(__dirname, '../.git/hooks');
(async () => {
  fs.readdir(beforRootPath, (err, files) => {
    if (err) {
      console.log(err);
      return;
    }
    files = files.filter((file) => !/.js/.test(file));
    files.forEach((file) => {
      const beforCopyPath = path.resolve(beforRootPath, file);
      const afterCopyPath = path.resolve(afterRootPath, file);
      fs.copyFile(beforCopyPath, afterCopyPath, (err) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log('\x1B[32mgit hooks init success!!!\x1B[0m');
      });
    });
  });
})();
