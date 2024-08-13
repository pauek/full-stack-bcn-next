import { cn } from "@/lib/utils"

export const H1 = ({ children }: any) => <h2>{children}</h2>
export const H2 = ({ children }: any) => <h3>{children}</h3>
export const H3 = ({ children }: any) => <h4>{children}</h4>
export const H4 = ({ children }: any) => <h5>{children}</h5>
export const H5 = ({ children }: any) => <h6>{children}</h6>

export const P = ({ children }: any) => <p>{children}</p>

export const A = (props: React.ComponentProps<"a">) => (
  <a {...props} className={cn(props.className, "text-accent-foreground")}>
    {props.children}
  </a>
)
