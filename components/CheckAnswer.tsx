"use client";

import { actionCheckAnswer } from "@/actions/actionCheckAnswer";
import { Hash } from "@/lib/data/hashing";
import { Button } from "./ui/button";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import CheckMark from "./icons/CheckMark";
import { CancelIcon } from "./icons/CancelIcon";
import Spinner from "./Spinner";

export type FormState = {
  error?: boolean;
  correct?: boolean;
  message: string;
};

const initialState: FormState = {
  message: "",
};

const VeredictBox = ({ children, className }: { children: React.ReactNode; className: string }) => {
  return (
    <div
      className={cn(
        "w-9 h-9 rounded",
        "flex flex-col justify-center items-center",
        className
      )}
    >
      {children}
    </div>
  );
};

const ShowVeredict = ({ state }: { state: FormState }) => {
  const { pending } = useFormStatus();

  if (pending) {
    return (
      <VeredictBox className="bg-gray-100">
        <Spinner />
      </VeredictBox>
    );
  }
  if (state.correct !== undefined) {
    return (
      <VeredictBox
        className={state.correct ? "bg-green-200 text-green-600" : "bg-red-200 text-red-600"}
      >
        {state.correct ? <CheckMark size={20} /> : <CancelIcon size={20} />}
      </VeredictBox>
    );
  }

  return <></>;
};

const AnswerBox = () => {
  const { pending } = useFormStatus();
  return (
    <Input
      type="text"
      name="answer"
      placeholder="Your answer..."
      className="font-mono rounded border sm:flex-1"
      disabled={pending}
    />
  );
};

const CheckButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      Check
    </Button>
  );
};

type Props = {
  quizHash: Hash;
};
export default function CheckAnswer({ quizHash }: Props) {
  const [state, formAction] = useFormState<FormState, FormData>(actionCheckAnswer, initialState);

  return (
    <form
      action={formAction}
      className="w-full sm:h-9 flex flex-col sm:flex-row sm:items-center gap-2"
    >
      <AnswerBox />
      <input type="hidden" name="quizHash" value={quizHash} className="hidden" />
      <CheckButton />
      <div className="h-full aspect-1">
        <ShowVeredict state={state} />
      </div>
    </form>
  );
}
