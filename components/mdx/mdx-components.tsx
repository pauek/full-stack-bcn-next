import { iosevka } from "@/lib/fonts";
import CopyableCode from "./CopyableCode";
import Ref from "./Ref";
import { cn } from "@/lib/utils";

const H1 = ({ children }: any) => <h1 className="font-bold text-2xl">{children}</h1>;

const H2 = ({ children }: any) => <h2 className="font-bold text-lg mt-6">{children}</h2>;

const H3 = ({ children }: any) => (
  <h3 className="font-semibold text-md text-foreground mt-8 mb-2">{children}</h3>
);

const H4 = ({ children }: any) => <h4 className="mt-3 mb-1">{children}</h4>;

const P = ({ children }: any) => <p className="mb-4 first:mt-0">{children}</p>;

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

const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
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
};

export default components;
