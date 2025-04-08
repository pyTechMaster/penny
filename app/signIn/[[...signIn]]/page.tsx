import { SignIn } from "@clerk/nextjs";
export default function signinpage(){
    return (
        <div className="mt-4 flex align-center justify-center">
        <SignIn forceRedirectUrl="/dashboard"/>
        </div>

    )
}