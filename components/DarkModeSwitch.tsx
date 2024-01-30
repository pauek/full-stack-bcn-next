"use client";

import { useDarkMode } from "./DarkMode";
import { DarkMode } from "./icons/DarkMode";
import { LightMode } from "./icons/LightMode";

export default function DarkModeSwitch() {
  const { dark, setDark } = useDarkMode();
  return (
    <div className="cursor-pointer" onClick={() => setDark(!dark)}>
      {dark ? <LightMode /> : <DarkMode />}
    </div>
  );
}
