import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { appUrl } from "@/lib/intake";
import { ReviewEditor } from "@/components/ReviewEditor";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await db.getByReviewToken(token);
  if (!data) notFound();
  const invoice = await db.getInvoiceByDraft(data.draft.id);
  const clientLink = await db.getClientLinkByDraft(data.draft.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#7b5ea7]">Revue du brouillon</p>
        <h1 className="text-2xl font-bold text-stone-900">{data.draft.title}</h1>
        <p className="mt-1 text-stone-600">
          Client : {data.job.client_name}
          {data.job.client_address ? ` — ${data.job.client_address}` : ""}
        </p>
        <p className="mt-2 rounded-lg bg-[#efe9ff] px-3 py-2 text-sm text-[#4c1d95]">
          Validation humaine obligatoire. jingr n&apos;envoie jamais le devis au
          client automatiquement.
        </p>
      </div>

      <ReviewEditor
        token={token}
        draftId={data.draft.id}
        initialDraft={data.draft}
        jobDescription={data.job.description}
        clientName={data.job.client_name}
        initialInvoice={invoice}
        initialClientUrl={clientLink ? `${appUrl()}/d/${clientLink.token}` : null}
        clientPhone={data.job.client_phone ?? null}
        artisan={data.artisan ?? null}
      />
    </div>
  );
}
