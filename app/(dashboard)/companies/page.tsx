import { db } from "@/lib/data/db";
import { CompaniesOverview } from "@/components/companies/companies-overview";

export default async function CompaniesPage() {
  const companies = await db.companyPrep.list();
  return <CompaniesOverview companies={companies} />;
}
