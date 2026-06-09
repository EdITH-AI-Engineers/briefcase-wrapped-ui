import fallback from "@/data/dashboard.json";

// The dashboard shape, derived from the bundled snapshot (the API returns the
// same structure from briefcase-api's buildDashboard).
export type Dashboard = (typeof fallback)["dashboard"];

const API_BASE = process.env.BRIEFCASE_API_URL ?? "http://localhost:8787";

/**
 * Server-only data fetch. Pulls the latest dashboard from the briefcase-api and
 * falls back to the bundled snapshot when the API is unreachable (offline dev).
 * Call from a Server Component — never imported into client code.
 */
export async function getDashboard(): Promise<Dashboard> {
    try {
        const res = await fetch(`${API_BASE}/api/dashboard/latest`, { cache: "no-store" });
        if (res.ok) {
            const json = (await res.json()) as { dashboard?: Dashboard };
            if (json?.dashboard) return json.dashboard;
        }
    } catch {
        // API offline — fall through to the bundled snapshot.
    }
    return fallback.dashboard as Dashboard;
}

/** Fetch by run + student id (used when targeting a specific student). */
export async function getDashboardFor(runId: string, studentId: string): Promise<Dashboard | null> {
    try {
        const res = await fetch(`${API_BASE}/api/runs/${runId}/students/${studentId}/dashboard`, { cache: "no-store" });
        if (res.ok) {
            const json = (await res.json()) as { dashboard?: Dashboard };
            return json?.dashboard ?? null;
        }
    } catch {
        // ignore
    }
    return null;
}
