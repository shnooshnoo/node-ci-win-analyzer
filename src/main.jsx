import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from "react-router-dom";
import { Index } from './routes/index.jsx';
import './index.css';

const router = createHashRouter([
  { path: "/", element: <Index /> },
  {
    path: "/tests",
    async lazy() {
      const { Tests } = await import("./routes/tests/tests.jsx");
      return { Component: Tests };
    },
  },  {
    path: "/prs",
    async lazy() {
      const { PRs } = await import("./routes/prs/pr.jsx");
      return { Component: PRs };
    },
  },
], {
  basename: "/node-ci-win-analyzer",
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
