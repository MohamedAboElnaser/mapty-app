import { App, resetBtn } from './src/App.js';

const app = new App();
resetBtn.addEventListener('click', function () {
  app._clearLocalStorage();
});

console.log('Welcome To Mapty project');
