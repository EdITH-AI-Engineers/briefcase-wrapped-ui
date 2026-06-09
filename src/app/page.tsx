import { getDashboard } from "@/lib/get-dashboard";
import { WrappedExperience } from "@/components/wrapped/wrapped-experience";
import { toCompetencies, toSkills, toActionPlan, toAchievements, toArchetype } from "@/lib/scene-data";

// Server Component: fetch the dashboard once (live briefcase-api, or the bundled
// snapshot when offline), derive every scene's data from it, and feed it to the
// client experience. No mock JSON anywhere — it all comes from the API.
export default async function Home() {
    const data = await getDashboard();
    const sceneData = {
        competencies: toCompetencies(data),
        skills: toSkills(data),
        actionPlan: toActionPlan(data),
        achievements: toAchievements(data),
        archetype: toArchetype(data),
    };
    return <WrappedExperience reportData={data} userName={data.student.firstName} sceneData={sceneData} />;
}
