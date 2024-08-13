type RowProps = {
  href: string
  keyword: string
  children: any
}
export default function Row({ href, keyword, children }: RowProps) {
  return (
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
  )
}
