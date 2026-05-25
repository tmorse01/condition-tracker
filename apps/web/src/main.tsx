import "@mantine/core/styles.css";
import "./styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { createTheme, MantineProvider, rem } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";

const queryClient = new QueryClient();
const theme = createTheme({
  fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  headings: {
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: "700",
  },
  colors: {
    indigo: [
      "#eef2ff",
      "#e0e7ff",
      "#c7d2fe",
      "#a5b4fc",
      "#818cf8",
      "#6366f1",
      "#4f46e5",
      "#4338ca",
      "#3730a3",
      "#312e81",
    ],
  },
  primaryColor: "indigo",
  primaryShade: 6,
  defaultRadius: "md",
  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </MantineProvider>
  </React.StrictMode>,
);
