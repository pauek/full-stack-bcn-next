import { Inter } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({ subsets: ["latin"] });
export const iosevka = localFont({
  src: [
    {
      path: "../assets/fonts/iosevka-ss14-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/iosevka-ss14-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/iosevka-ss14-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});
