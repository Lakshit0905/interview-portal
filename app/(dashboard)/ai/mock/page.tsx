import { PageHeader } from "@/components/shared/page-header";
import { MockClient } from "@/components/coding/mock-client";

export default function MockPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Mock Interview"
        description="A simulated round — one question at a time, scored feedback after each answer, and a running average."
      />
      <MockClient />
    </div>
  );
}
