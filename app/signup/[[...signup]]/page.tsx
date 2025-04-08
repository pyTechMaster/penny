import { SignUp } from "@clerk/nextjs";
export default function signuppage(){
    return (
        <div className="mt-4 flex align-center justify-center">
        <SignUp forceRedirectUrl="/dashboard"/>
        </div>

    )
}