import { redirect } from "next/navigation";

export default function StripeThanksPage() {
  redirect("/api/stripe/return");
}
