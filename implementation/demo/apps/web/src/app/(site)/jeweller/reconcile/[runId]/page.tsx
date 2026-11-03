import { redirect } from "next/navigation";

/** The week-42 run is shown in the story stage (DEMO_SPEC §4 route map). */
export default function Page() {
  redirect("/stage?step=S05");
}
