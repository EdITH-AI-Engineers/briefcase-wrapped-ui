import { getDashboard } from "@/lib/get-dashboard";
import { WrappedExperience } from "@/components/wrapped/wrapped-experience";
import { toCompetencies, toSkills, toActionPlan, toAchievements, toArchetype } from "@/lib/scene-data";

// Server Component: fetch the dashboard once (live briefcase-api, or the bundled
// snapshot when offline), derive every scene's data, and feed the animated story.
// When the outro finishes, the experience routes back to the report at "/".
export default async function WrappedPage() {
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
