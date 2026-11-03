import { redirect } from "next/navigation";

/** This beat lives in the story stage now (DEMO_SPEC §4 route map). */
export default function Page() {
  redirect("/stage?step=S01");
}
