import { cache } from "react";
import { redirect } from "next/navigation";
import { serverSupabase, isolatedSupabase } from "@/lib/supabase/server";
import type { Account, WorkspaceSnapshot } from "@/lib/domain/types";

export const getAccount = cache(async (): Promise<Account | null> => {
  const supabase=await serverSupabase();
  const {data:{user},error}=await supabase.auth.getUser();
  if(error || !user) return null;
  const result=await supabase.rpc("account_context");
  return result.error ? null : result.data as Account;
});

export async function requireAccount(): Promise<Account> {
  const account=await getAccount();
  if(!account) redirect("/masuk?pesan=sesi");
  return account;
}

export async function requireWorkspace(): Promise<{account:Account; data:WorkspaceSnapshot}> {
  const account=await requireAccount();
  if(account.status==="deletion_pending") redirect("/akun");
  if(account.role==="admin") redirect("/admin");
  const supabase=await serverSupabase();
  const {data,error}=await supabase.rpc("workspace_snapshot");
  if(error) redirect("/masuk?pesan=sesi");
  return {account,data:data as WorkspaceSnapshot};
}

export async function verifyPassword(account:Account,password:string): Promise<boolean> {
  if(!password) return false;
  const check=isolatedSupabase();
  const {data,error}=await check.auth.signInWithPassword({email:account.email,password});
  if(error || data.user?.id!==account.id) return false;
  await check.auth.signOut({scope:"local"});
  return true;
}
