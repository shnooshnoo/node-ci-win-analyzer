import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Index, Tests, PRs } from './routes';
import './index.css';

const router = createBrowserRouter([
  { path: "/", element: <Index /> },
  { path: "/tests", element: <Tests /> },
  { path: "/prs", element: <PRs /> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
