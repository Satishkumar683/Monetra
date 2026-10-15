import { redirect } from "next/navigation";

export default async function ChatRedirectPage({ searchParams }) {
  const params = await searchParams;
  const user = params?.user;
  if (user) {
    redirect(`/community?tab=chat&user=${encodeURIComponent(user)}`);
  }
  redirect("/community?tab=chat");
}
