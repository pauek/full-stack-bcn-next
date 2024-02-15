import Aside from "./Aside";
import Code from "./Code";
import CopyableCode from "./CopyableCode";
import * as dom from "./dom";
import Focus from "./Focus";
import Note from "./Note";
import Pre from "./Pre";
import Ref from "./Ref";
import Row from "./Row";
import { Table, Td, Th } from "./Table";
import Warn from "./Warn";

const components = {
  h1: dom.H1,
  h2: dom.H2,
  h3: dom.H3,
  h4: dom.H4,
  h5: dom.H5,
  a: dom.A,
  p: dom.P,
  CopyableCode,
  code: Code,
  table: Table,
  Table,
  Row,
  Ref,
  td: Td,
  th: Th,
  aside: Aside,
  Aside,
  Warn,
  pre: Pre,
  Focus,
  Note,
};

export default components;
