import React from "react";
import ReactDOMServer from "react-dom/server";
import { App } from "./App";

export function render(url: string) {
  return ReactDOMServer.renderToString(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
