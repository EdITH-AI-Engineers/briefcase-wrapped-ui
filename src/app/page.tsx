import { getDashboard } from "@/lib/get-dashboard";
import { WrappedExperience } from "@/components/wrapped/wrapped-experience";
import { toCompetencies, toSkills, toActionPlan, toAchievements, toArchetype } from "@/lib/scene-data";

// Home is the animated "Briefcase Wrapped" story. Fetch the dashboard once (live
// briefcase-api, or the bundled snapshot when offline), derive every scene's data,
// and feed the experience. When the outro finishes it hands off to the report app
// (NEXT_PUBLIC_REPORT_URL).
export default async function Home() {
    const data = await getDashboard();
    const sceneData = {
        competencies: toCompetencies(data),
        skills: toSkills(data),
        actionPlan: toActionPlan(data),
        achievements: toAchievements(data),
        archetype: toArchetype(data),
    };
    return <WrappedExperience userName={data.student.firstName} sceneData={sceneData} />;
}
