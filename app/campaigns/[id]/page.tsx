import { redirect } from "next/navigation";
import { getCampaignByIdAction } from "@/app/actions/campaign";
import CampaignClient from "./CampaignClient";

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const campaign = await getCampaignByIdAction(resolvedParams.id);
  
  if (!campaign) {
    redirect("/campaigns");
  }

  return (
    <CampaignClient initialCampaign={campaign} />
  );
}
