import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './style.css'; // Import Tailwind CSS
// import 'cropperjs/dist/cropper.css'; // Attempted global import, moved to style.css

const rootElement = document.getElementById('ai-resume-builder-app');

if (rootElement) {
  ReactDOM.render(<App />, rootElement);
}
