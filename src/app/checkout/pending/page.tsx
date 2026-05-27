import { redirect } from "next/navigation";

export default function CheckoutPendingPage() {
  redirect("/dashboard?checkout=pending");
}
