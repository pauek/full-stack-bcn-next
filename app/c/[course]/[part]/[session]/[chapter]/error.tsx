"use client";

type Props = {
  error: Error;
  reset: () => void;
};
export default function Error({ error, reset }: Props) {
  return <div>Chapter error: {error.toString()}</div>;
}
