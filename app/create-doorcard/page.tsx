import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createDoorcardDraft } from "../doorcard/actions";

export default async function CreateDoorcardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Create a new draft and get the redirect URL
  const redirectUrl = await createDoorcardDraft();
  redirect(redirectUrl);
}
