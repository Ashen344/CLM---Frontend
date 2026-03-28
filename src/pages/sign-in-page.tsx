import { SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8]">
      <div className="text-center">
        <h1 className="mb-8 text-[32px] font-bold tracking-tight text-[#1b1840]">
          Clause
        </h1>
        <SignIn routing="hash" />
      </div>
    </div>
  );
}
