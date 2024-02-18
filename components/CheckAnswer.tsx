"use client";

import { actionCheckAnswer } from "@/actions/actionCheckAnswer";
import { Hash } from "@/lib/data/hashing";
import { Button } from "./ui/button";
import { useFormState } from "react-dom";

const initialState = {
  message: "",
};

type Props = {
  quizHash: Hash;
};
export default function CheckAnswer({ quizHash }: Props) {
  const [state, formAction] = useFormState(actionCheckAnswer, initialState);
  return (
    <form action={formAction} className="flex flex-row gap-2 p-2.5">
      <input type="text" name="answer" placeholder="Your answer..." className="text-mono border" />
      <input type="hidden" name="quizHash" value={quizHash} />
      <Button type="submit">Check</Button>
      <p aria-live="polite">{state?.message}</p>
    </form>
  );
}
