import { notFound } from "next/navigation";
import { db } from "@/lib/data/db";
import { CompanyDetail } from "@/components/companies/company-detail";

export default async function CompanyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const companies = await db.companyPrep.list();
  const company = companies.find((c) => c.slug === slug);
  if (!company) notFound();

  return <CompanyDetail company={company} />;
}
