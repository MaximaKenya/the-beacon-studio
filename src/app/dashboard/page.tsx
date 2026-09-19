import { redirect } from "next/navigation";

/** Legacy path — admin lives at /admin */
export default function DashboardRedirect() {
  redirect("/admin");
}
