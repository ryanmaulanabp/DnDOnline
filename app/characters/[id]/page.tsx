import { notFound } from "next/navigation";
import { getCharacterById } from "@/app/actions/character";
import CharacterClient from "./CharacterClient";

export default async function CharacterSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // Mengambil data murni dari server/database
  const character = await getCharacterById(resolvedParams.id);

  if (!character) {
    return notFound();
  }

  // Melemparkan data ke mesin interaktif di sisi Client
  return <CharacterClient character={character} />;
}