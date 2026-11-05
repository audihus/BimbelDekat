import { requireAccount } from "@/lib/session";
import { WorkspaceShell } from "@/components/workspace-shell";
export const dynamic="force-dynamic";
export const metadata={robots:{index:false,follow:false}};
export default async function Layout({children}:{children:React.ReactNode}){const account=await requireAccount();return <WorkspaceShell account={account}>{children}</WorkspaceShell>;}
