"use client";

import { actionCheckAnswer } from "@/actions/actionCheckAnswer";
import { Hash } from "@/lib/data/hashing";
import { Button } from "./ui/button";
import { useFormState } from "react-dom";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import CheckMark from "./icons/CheckMark";
import { CancelIcon } from "./icons/CancelIcon";

export type FormState = {
  error?: boolean;
  correct?: boolean;
  message: string;
};

const initialState: FormState = {
  message: "",
};

type Props = {
  quizHash: Hash;
};
export default function CheckAnswer({ quizHash }: Props) {
  const [state, formAction] = useFormState<FormState, FormData>(actionCheckAnswer, initialState);
  return (
    <form action={formAction} className="flex flex-row gap-2 p-2.5">
      <Input
        type="text"
        name="answer"
        placeholder="Your answer..."
        className="font-mono border rounded w-auto"
      />
      <input type="hidden" name="quizHash" value={quizHash} />
      <Button type="submit">Check</Button>
      {state.correct !== undefined && (
        <div
          className={cn(
            "ml-4 flex justify-center items-center px-2 rounded gap-1",
            state.correct ? "bg-green-200 text-green-600" : "bg-red-200 text-red-600"
          )}
        >
          {state.correct ? <CheckMark size={20} /> : <CancelIcon size={20} />}
          <p aria-live="polite">{state?.message}</p>
        </div>
      )}
      {state.error && <p className="text-red-600 flex justify-center items-center">{state.message}</p>}
    </form>
  );
}
