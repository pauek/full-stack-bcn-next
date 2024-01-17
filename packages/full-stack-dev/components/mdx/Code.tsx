import SyntaxHighlighter from 'react-syntax-highlighter';

export default function Code(props: any) {
  const match = /language-(\w+)/.exec(props.className || '')
  return match
    ? <SyntaxHighlighter language={match[1]} {...props} />
    : <code className={props.className} {...props} />
}