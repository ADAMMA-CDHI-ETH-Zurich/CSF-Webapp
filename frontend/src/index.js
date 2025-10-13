import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';  // This loads your App.js


const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<App />);

root.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
    );