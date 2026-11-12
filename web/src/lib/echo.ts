"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

// One shared Reverb connection for the browser tab. Private channel auth goes through the BFF.
let echo: Echo<"reverb"> | null = null;

export function getEcho(): Echo<"reverb"> | null {
  if (typeof window === "undefined") return null;
  if (!echo) {
    (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
    echo = new Echo({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_KEY ?? "",
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? window.location.hostname,
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
      wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
      forceTLS: false,
      enabledTransports: ["ws", "wss"],
      authEndpoint: "/api/broadcasting/auth",
    });
  }
  return echo;
}
