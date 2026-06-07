import { PageHeader } from "@/components/shared/page-header";
import { GeneratorClient } from "@/components/coding/generator-client";

export default function GeneratorPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Interview Question Generator"
        description="Give it a topic and get tiered questions — beginner, intermediate, and senior — to drill before your round."
      />
      <GeneratorClient />
    </div>
  );
}
