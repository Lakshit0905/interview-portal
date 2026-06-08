import type { CompanyPrep } from "@/types";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

import { CompanyCard } from "./company-card";

export function CompaniesOverview({ companies }: { companies: CompanyPrep[] }) {
  return (
    <div>
      <PageHeader
        title="Company Prep Hub"
        description="Per-company playbooks — interview process, focus areas, FAQs, your own notes and experiences, and a prep checklist to track readiness."
      />

      {companies.length === 0 ? (
        <EmptyState icon="Building2" title="No companies yet"
          description="Add a company playbook to start tracking its interview process and your prep checklist." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {companies.map((c, i) => <CompanyCard key={c.id} company={c} index={i} />)}
        </div>
      )}
    </div>
  );
}
