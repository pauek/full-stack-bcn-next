import { iosevka } from "@/lib/fonts";
import CopyableCode from "./CopyableCode";
import Ref from "./Ref";
import { cn } from "@/lib/utils";
import { WarningIcon } from "../icons/WarningIcon";

const H1 = ({ children }: any) => <h2>{children}</h2>;
const H2 = ({ children }: any) => <h3>{children}</h3>;
const H3 = ({ children }: any) => <h4>{children}</h4>;
const H4 = ({ children }: any) => <h5>{children}</h5>;
const H5 = ({ children }: any) => <h6>{children}</h6>;

const P = ({ children }: any) => <p>{children}</p>;

const A = (props: React.ComponentProps<"a">) => (
  <a {...props} className={cn(props.className, "text-accent-foreground")}>
    {props.children}
  </a>
);

const Code = (props: React.ComponentProps<"code">) => (
  <code {...props} className={cn(iosevka.className, "mx-1")}>
    {props.children}
  </code>
);

const Table = (props: React.ComponentProps<"table">) => (
  <div className="flex flex-row justify-center py-2">
    <table {...props}>{props.children}</table>
  </div>
);

type RowProps = {
  href: string;
  keyword: string;
  children: any;
};
const Row = ({ href, keyword, children }: RowProps) => (
  <tr>
    <td>
      {href ? (
        <a href={href}>
          <strong>
            <code>{keyword}</code>
          </strong>
        </a>
      ) : (
        <strong>
          <code>{keyword}</code>
        </strong>
      )}
    </td>
    <td>{children}</td>
  </tr>
);

const Td = (props: React.ComponentProps<"td">) => (
  <td className="px-3 py-1 border-y">{props.children}</td>
);

const Th = (props: React.ComponentProps<"th">) => (
  <th className={cn("px-3 py-1 text-left text-bold", props.className)}>{props.children}</th>
);

const Aside = (props: React.ComponentProps<"aside">) => (
  <div
    className={cn(
      props.className,
      "lg:absolute lg:w-[18em] left-full ml-3 mr-2 top-0",
      "text-[0.7rem] leading-4 text-secondary-foreground"
    )}
  >
    {props.children}
  </div>
);

const Warn = (props: React.ComponentProps<"div">) => (
  <div className="warning mx-6">
    <WarningIcon className="text-yellow-600" />
    <div>{props.children}</div>
  </div>
);

const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  a: A,
  p: P,
  CopyableCode,
  code: Code,
  table: Table,
  Table,
  Row: Row,
  Ref,
  td: Td,
  th: Th,
  aside: Aside,
  Aside,
  Warn,
};

export default components;
