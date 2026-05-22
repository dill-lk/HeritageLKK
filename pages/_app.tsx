import type { AppProps } from "next/app";
import "@/global.css";

export default function HeritageApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
