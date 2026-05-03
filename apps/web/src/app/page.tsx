import { Suspense } from "react";
import { getAllIcons } from "@/lib/icons";
import { HomeClient } from "@/components/HomeClient";

export default function Home() {
  const icons = getAllIcons();
  return (
    <Suspense fallback={null}>
      <HomeClient icons={icons} />
    </Suspense>
  );
}
