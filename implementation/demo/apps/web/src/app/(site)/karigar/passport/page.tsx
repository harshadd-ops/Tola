import { redirect } from "next/navigation";

/** Rafiq's passport is the S10 beat; on its own it is the passport screen of his phone. */
export default function Page() {
  redirect("/stage?step=S10");
}
