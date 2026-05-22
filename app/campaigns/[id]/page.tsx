import { redirect } from "next/navigation";
import { getCampaignByIdAction } from "@/app/actions/campaign";
import CampaignClient from "./CampaignClient";

export default async function CampaignPage({ params }: { params: { id: string } }) {
  // We can't easily get getServerSession without authOptions path in NextAuth, 
  // but since it's a server component we can just pass the ID and handle auth in client, 
  // OR we can try to fetch it if we know the auth options path.
  // Actually, we can fetch campaign on Server, and let Client enforce session if needed.
  
  const campaign = await getCampaignByIdAction(params.id);
  
  if (!campaign) {
    redirect("/campaigns");
  }

  return (
    <CampaignClient initialCampaign={campaign} />
  );
}
