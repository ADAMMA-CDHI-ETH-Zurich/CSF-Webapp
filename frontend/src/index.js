import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';  // This loads your App.js
import { ToastProvider } from './components/ToastProvider';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
<BrowserRouter>
    <ToastProvider position="bottom-left">
        <App />
    </ToastProvider>
</BrowserRouter>
);