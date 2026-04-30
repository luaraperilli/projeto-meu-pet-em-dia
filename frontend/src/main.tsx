import React from 'react';
import ReactDOM from 'react-dom/client';
import { RootRouter } from '@app/routes/AppRoutes';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootRouter />
  </React.StrictMode>,
);
