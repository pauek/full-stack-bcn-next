import { cn } from "@/lib/utils"

export const H1 = ({ children }: any) => (
    <h1 className="text-2xl font-bold mt-8 first:mt-0 mb-4 p-0">{children}</h1>
)
export const H2 = ({ children }: any) => (
    <h2 className="text-lg font-semibold mt-6 first:mt-0 mb-2 p-0">{children}</h2>
)
export const H3 = ({ children }: any) => (
    <h3 className="text-base font-semibold mt-4 first:mt-0 mb-1 p-0">{children}</h3>
)
export const H4 = ({ children }: any) => (
    <h4 className="text-sm font-medium mt-3 first:mt-0 mb-1.5 p-0">{children}</h4>
)
export const H5 = ({ children }: any) => (
    <h5 className="text-sm font-medium mt-2 first:mt-0 mb-1 p-0">{children}</h5>
)

export const P = ({ children }: any) => <p>{children}</p>

export const A = (props: React.ComponentProps<"a">) => (
    <a {...props} className={cn(props.className, "text-accent-foreground")}>
        {props.children}
    </a>
)
