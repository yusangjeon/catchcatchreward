import { MerchantView } from "./MerchantView";

export default async function MerchantPage({ params }: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = await params;
  return <MerchantView merchantId={merchantId} />;
}
