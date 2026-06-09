import { getDashboard } from "@/lib/get-dashboard";
import { Report } from "@/components/report/report";

// Server Component: fetches the dashboard (live API, or bundled fallback) and
// hands it to the client report. No data constants in the view.
export default async function ReportPage() {
    const data = await getDashboard();
    return <Report data={data} />;
}
