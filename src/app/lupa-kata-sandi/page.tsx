import { PublicHeader } from "@/components/ui";
import { AuthForm } from "@/components/auth-form";
export default function Page(){return <><PublicHeader/><main id="main" className="public-main" style={{maxWidth:500}}><AuthForm mode="forgot"/></main></>;}
