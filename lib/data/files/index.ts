import { DataBackendBase } from "../data-backend"
import * as _backend from "./backend"
import { getMapPositionsExtended, updateMapPositions } from "./positions"

export const backend: DataBackendBase = {
  getInfo: () => {
    return "<< FILES >>"
  },
  
  ..._backend,

  getMapPositionsExtended,
  updateMapPositions,
}
