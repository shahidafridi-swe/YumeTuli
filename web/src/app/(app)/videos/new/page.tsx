import type { Metadata } from "next";
import { NewVideo } from "./NewVideo";

export const metadata: Metadata = { title: "New video" };

export default function Page() {
  return <NewVideo />;
}
