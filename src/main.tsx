import React from "react";
import ReactDOM from "react-dom/client";
import { FlightDashboard } from "./modules/flights/containers/FlightDashboard";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FlightDashboard />
  </React.StrictMode>,
);
