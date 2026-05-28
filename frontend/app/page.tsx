// filepath: frontend/app/page.tsx
// description: Root page — redirects users to the assignments list.

import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/assignments");
}
