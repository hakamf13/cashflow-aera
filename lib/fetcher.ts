import { signOut } from "next-auth/react";

export async function fetcher(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, {
      ...options,
      cache: "no-store", // 🔥 penting
    });

    const data = await res.json();

    if (!data.success) {
      console.error("API ERROR:", data);

      if (res.status === 401) {
        signOut({ callbackUrl: "/login" });
      }

      throw new Error(data.message);
    }

    return data.data;
  } catch (error) {
    console.error("FETCH ERROR:", error);
    throw error;
  }
}