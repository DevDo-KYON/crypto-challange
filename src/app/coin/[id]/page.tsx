import { notFound } from "next/navigation";
import { fetchCoinDetail, CoinGeckoError } from "@/lib/api";
import { CoinDetailContent } from "@/components/CoinDetailContent";

interface CoinDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CoinDetailPage({ params }: CoinDetailPageProps) {
  const { id } = await params;

  let coin;
  try {
    coin = await fetchCoinDetail(id);
  } catch (error) {
    if (error instanceof CoinGeckoError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }

  return <CoinDetailContent coin={coin} coinId={id} />;
}
