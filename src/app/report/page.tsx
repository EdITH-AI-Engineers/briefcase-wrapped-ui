import { redirect } from "next/navigation";

// The report moved to the site root. Keep the old path working.
export default function ReportRedirect() {
    redirect("/");
}
