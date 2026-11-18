import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/sambut/public-pages";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/")({
  head: () => pageHead("Christmas Celebration 2026"),
  component: HomePage,
});
