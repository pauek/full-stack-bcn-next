import { iosevka } from "@/lib/fonts";

export const H1 = ({ children }: any) => (
  <h1 className="font-bold text-2xl">{children}</h1>
);

export const H2 = ({ children }: any) => (
  <h2 className="font-bold text-lg">{children}</h2>
);

export const H3 = ({ children }: any) => (
  <h3 className="font-semibold text-md text-stone-800">{children}</h3>
);

export const A = (props: React.ComponentProps<"a">) => (
  <a {...props} className={`text-blue-600 ${props.className}`}>
    {props.children}
  </a>
);

export const Code = (props: React.ComponentProps<"code">) => (
  <code {...props} className={iosevka.className}>
    {props.children}
  </code>
);

export const Table = (props: React.ComponentProps<"table">) => (
  <div className="flex flex-row justify-center py-2">
    <table {...props}>{props.children}</table>
  </div>
);

type RowProps = {
  href: string;
  keyword: string;
  children: any;
};
export const Row = ({ href, keyword, children }: RowProps) => (
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
    <td>
      {children}
    </td>
  </tr>
);

export const Td = (props: React.ComponentProps<"td">) => (
  <td className="px-3 py-1 border-y">{props.children}</td>
);

export const Th = (props: React.ComponentProps<"th">) => (
  <th className={`px-3 py-1 text-left text-bold ${props.className}`}>
    {props.children}
  </th>
);

const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  a: A,
  code: Code,
  table: Table,
  Table: Table,
  Row: Row,
  td: Td,
  th: Th,
};

export default components;
