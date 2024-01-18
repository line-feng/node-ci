module.exports = {
  branch: 'master',
  run: ['npm install', 'npm run build', 'npm install --production'],
  daemonProcess: 'pm2',
  distPath: '../dist',
  main: 'main.js',
};
