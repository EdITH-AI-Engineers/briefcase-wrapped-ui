import { getDashboard } from "@/lib/get-dashboard";
import { Report } from "@/components/report/report";

// Home is the career-readiness dashboard. The animated "Briefcase Wrapped" story
// lives at /wrapped, reachable from the banner on the report.
export default async function Home() {
    const data = await getDashboard();
    return <Report data={data} />;
}
