import type { AppProps } from "next/app";
import { useState, useEffect } from "react";
import Router from "next/router";

import "@App/styles/globals.css";
import "@fullcalendar/core";
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid";
import "@App/lib/firebase/firebase.config";
import CoreLayout from "@App/components/layouts/CoreLayout";
import { AuthProvider } from "@App/lib/auth/AuthContextProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Spinner from "@App/components/atoms/Spinner";

function MyApp({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();
  const [isRouteChanging, setIsRouteChanging] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsRouteChanging(true);
    const handleEnd = () => setIsRouteChanging(false);

    Router.events.on("routeChangeStart", handleStart);
    Router.events.on("routeChangeComplete", handleEnd);
    Router.events.on("routeChangeError", handleEnd);

    return () => {
      Router.events.off("routeChangeStart", handleStart);
      Router.events.off("routeChangeComplete", handleEnd);
      Router.events.off("routeChangeError", handleEnd);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CoreLayout>
          <Component {...pageProps} />
        </CoreLayout>
      </AuthProvider>
      {isRouteChanging && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            zIndex: 9999,
          }}
          aria-live="polite"
          aria-busy="true"
        >
          <Spinner message="Loading page..." />
        </div>
      )}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default MyApp;
