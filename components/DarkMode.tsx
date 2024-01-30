import { Dispatch, SetStateAction, createContext, useContext } from "react";

export interface DarkModeValue {
  dark: boolean;
  setDark: (dark: boolean) => void;
}

export const DarkModeContext = createContext<DarkModeValue>({ dark: false, setDark: () => {} });

export function useDarkMode() {
  return useContext(DarkModeContext);
}
