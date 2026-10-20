"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const destination = (formData.get("from") as string) || "/";
  const cookieStore = await cookies();
  cookieStore.set("themis_session", "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  redirect(destination);
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("themis_session");
  redirect("/login");
}
