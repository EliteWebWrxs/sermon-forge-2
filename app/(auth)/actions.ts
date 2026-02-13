"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { z } from "zod";

const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function signUp(formData: FormData) {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };
  console.log("🚀 ~ rawData:", rawData);

  const result = signUpSchema.safeParse(rawData);

  if (!result.success) {
    redirect(
      `/signup?error=${encodeURIComponent(result.error.issues[0].message)}`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });
  console.log("🚀 ~ error:", error);

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  // Create user metadata using admin client (bypasses RLS)
  if (data.user) {
    const adminClient = createAdminClient();
    const { error: metadataError } = await adminClient
      .from("users_metadata")
      .insert({ user_id: data.user.id });

    if (metadataError) {
      console.error("Failed to create user metadata:", metadataError);
      // Don't block signup, but log the error
    }
  }

  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: `/dashboard`,
    },
  };

  const result = signInSchema.safeParse(rawData);

  if (!result.success) {
    redirect(
      `/login?error=${encodeURIComponent(result.error.issues[0].message)}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
