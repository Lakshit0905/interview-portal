import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { CompanyPrep } from "@/types";
import { CompanyAvatar } from "@/components/interviews/company-avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CompanyProcess } from "./company-process";
import { CompanyFAQs } from "./company-faqs";
import { CompanyChecklist } from "./company-checklist";
import { CompanyNotes } from "./company-notes";

export function CompanyDetail({ company }: { company: CompanyPrep }) {
  return (
    <div>
      <Link href="/companies" className="mono-label mb-4 inline-flex items-center gap-1.5 hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> company prep hub
      </Link>

      <div className="mb-7 flex items-start gap-4">
        <CompanyAvatar name={company.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-balance">{company.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{company.industry}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {company.focusAreas.map((area) => (
              <Badge key={area} variant="outline" className="text-muted-foreground">{area}</Badge>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="process">
        <TabsList>
          <TabsTrigger value="process">Interview process</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="checklist">Prep checklist</TabsTrigger>
          <TabsTrigger value="notes">Notes &amp; experience</TabsTrigger>
        </TabsList>

        <TabsContent value="process">
          <CompanyProcess process={company.process} />
        </TabsContent>
        <TabsContent value="faqs">
          <CompanyFAQs faqs={company.faqs} />
        </TabsContent>
        <TabsContent value="checklist">
          <CompanyChecklist companyId={company.id} items={company.checklist} />
        </TabsContent>
        <TabsContent value="notes">
          <CompanyNotes company={company} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
