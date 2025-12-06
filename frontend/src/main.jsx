import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './estilos/botones.css';

import {router} from './router';
import { RouterProvider } from 'react-router-dom';
import { UserProvider } from './context/UserContextFile.jsx';
import { AlertProvider } from './context/AlertContext.jsx';


const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <UserProvider>
      <AlertProvider>
        <RouterProvider router={router} />
      </AlertProvider>
    </UserProvider>
  </React.StrictMode>
);

