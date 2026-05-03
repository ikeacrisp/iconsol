import { getAllIcons } from "@/lib/icons";
import { HomeClient } from "@/components/HomeClient";

export default function Home() {
  const icons = getAllIcons();
  return <HomeClient icons={icons} />;
}
