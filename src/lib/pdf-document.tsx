import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { artisanDefaults, type Artisan, type Invoice, type Job, type QuoteDraft } from "./types";

const cream = "#F7F4EF";
const violet = "#6B4EFF";
const violetSoft = "#efe9ff";
const ink = "#1c1917";
const muted = "#57534e";
const line = "#e7e0d6";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 56,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: ink,
    backgroundColor: cream,
  },
  banner: {
    backgroundColor: violetSoft,
    borderWidth: 1,
    borderColor: "#c4b5fd",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  bannerText: {
    color: "#4c1d95",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: violet,
    paddingBottom: 12,
  },
  brandBlock: { width: "48%" },
  brand: {
    fontSize: 20,
    color: violet,
    fontFamily: "Helvetica-Bold",
  },
  brandSub: { marginTop: 3, fontSize: 8, color: muted },
  companyBlock: { width: "48%", alignItems: "flex-end" },
  companyName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: ink },
  companyMeta: { marginTop: 2, fontSize: 8, color: muted, textAlign: "right" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  clientBox: {
    width: "55%",
    backgroundColor: "#fffcf8",
    borderWidth: 1,
    borderColor: line,
    borderRadius: 6,
    padding: 10,
  },
  devisMeta: { width: "40%", alignItems: "flex-end" },
  h2: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: violet,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
    color: ink,
  },
  section: { marginBottom: 14 },
  intro: { fontSize: 9, lineHeight: 1.45, color: "#292524" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: violetSoft,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#4c1d95",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: line,
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontSize: 9,
  },
  colLabel: { width: "42%" },
  colQty: { width: "10%", textAlign: "right" },
  colUnit: { width: "12%", textAlign: "right" },
  colPrice: { width: "18%", textAlign: "right" },
  colTotal: { width: "18%", textAlign: "right" },
  totalsBox: {
    marginTop: 14,
    alignSelf: "flex-end",
    width: 220,
    backgroundColor: "#fffcf8",
    borderWidth: 1,
    borderColor: line,
    borderRadius: 6,
    padding: 10,
  },
  totalLine: { flexDirection: "row", marginBottom: 4 },
  totalLabel: { width: 110, textAlign: "right", marginRight: 10, color: muted },
  totalValue: { width: 80, textAlign: "right" },
  totalTtcLabel: {
    width: 110,
    textAlign: "right",
    marginRight: 10,
    fontFamily: "Helvetica-Bold",
    color: violet,
  },
  totalTtcValue: {
    width: 80,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    color: violet,
    fontSize: 11,
  },
  note: { marginTop: 16, fontSize: 8, color: muted, lineHeight: 1.4 },
  legal: { marginTop: 14, fontSize: 7.5, color: muted, lineHeight: 1.45 },
  signRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 22 },
  signBox: {
    width: "48%",
    height: 70,
    borderWidth: 1,
    borderColor: line,
    borderRadius: 6,
    padding: 8,
    fontSize: 8,
    color: muted,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    fontSize: 7,
    color: "#a8a29e",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: line,
    paddingTop: 8,
  },
});

function eur(n: number) {
  return `${n.toFixed(2).replace(".", ",")} €`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR");
  } catch {
    return iso;
  }
}

export function QuotePdfDocument({
  draft,
  job,
  artisan,
  invoice,
}: {
  draft: QuoteDraft;
  job: Job;
  artisan?: Artisan;
  /** Si fourni, le document est rendu comme une facture */
  invoice?: Invoice;
}) {
  const prefs = artisan ? artisanDefaults(artisan) : null;
  const company = artisan?.company_name || artisan?.name || "Artisan";
  const isInvoice = Boolean(invoice);
  const isDraft = !isInvoice && draft.status === "draft";
  const items = invoice?.line_items ?? draft.line_items;
  const sums = invoice ?? draft;
  const franchise = prefs?.tva_franchise ?? false;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {isDraft ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              BROUILLON — À VALIDER AVANT ENVOI CLIENT
            </Text>
          </View>
        ) : null}

        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brand}>{isInvoice ? "FACTURE" : "DEVIS"}</Text>
            <Text style={styles.brandSub}>
              {isInvoice ? `N° ${invoice!.number}` : `Réf. ${draft.id.slice(0, 8).toUpperCase()}`}
            </Text>
          </View>
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>{company}</Text>
            {artisan?.name && artisan.company_name ? (
              <Text style={styles.companyMeta}>{artisan.name}</Text>
            ) : null}
            {artisan?.phone ? (
              <Text style={styles.companyMeta}>{artisan.phone}</Text>
            ) : null}
            {prefs?.siret ? (
              <Text style={styles.companyMeta}>SIRET {prefs.siret}</Text>
            ) : null}
            {prefs?.address ? (
              <Text style={styles.companyMeta}>{prefs.address}</Text>
            ) : prefs?.city ? (
              <Text style={styles.companyMeta}>{prefs.city}</Text>
            ) : null}
          </View>
        </View>

        <Text style={styles.title}>{invoice?.title ?? draft.title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.clientBox}>
            <Text style={styles.h2}>Client</Text>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>{job.client_name}</Text>
            {job.client_address ? <Text>{job.client_address}</Text> : null}
            {job.client_phone ? <Text>Tél. {job.client_phone}</Text> : null}
          </View>
          {invoice ? (
            <View style={styles.devisMeta}>
              <Text style={styles.h2}>Facture</Text>
              <Text>N° : {invoice.number}</Text>
              <Text>Date d&apos;émission : {formatDate(invoice.issued_at)}</Text>
              <Text>Échéance : {formatDate(invoice.due_at)}</Text>
              <Text>Devis réf. : {draft.id.slice(0, 8).toUpperCase()}</Text>
            </View>
          ) : (
            <View style={styles.devisMeta}>
              <Text style={styles.h2}>Devis</Text>
              <Text>Date : {formatDate(draft.created_at)}</Text>
              <Text>Validité : 30 jours</Text>
              <Text>Réf. : {draft.id.slice(0, 8).toUpperCase()}</Text>
            </View>
          )}
        </View>

        {!isInvoice && draft.intro ? (
          <View style={styles.section}>
            <Text style={styles.intro}>{draft.intro}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={styles.colLabel}>Désignation</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colUnit}>Unité</Text>
            <Text style={styles.colPrice}>P.U. HT</Text>
            <Text style={styles.colTotal}>Total HT</Text>
          </View>
          {items.map((li) => (
            <View key={li.id} style={styles.row}>
              <Text style={styles.colLabel}>
                {li.label}
                {li.tva_rate && !franchise ? ` (TVA ${li.tva_rate} %)` : ""}
              </Text>
              <Text style={styles.colQty}>{li.quantity}</Text>
              <Text style={styles.colUnit}>{li.unit}</Text>
              <Text style={styles.colPrice}>{eur(li.unit_price_ht)}</Text>
              <Text style={styles.colTotal}>
                {eur(li.quantity * li.unit_price_ht)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Total HT</Text>
            <Text style={styles.totalValue}>{eur(sums.total_ht)}</Text>
          </View>
          {franchise ? null : (
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>TVA</Text>
              <Text style={styles.totalValue}>{eur(sums.total_tva)}</Text>
            </View>
          )}
          <View style={styles.totalLine}>
            <Text style={styles.totalTtcLabel}>{franchise ? "Net à payer" : "Total TTC"}</Text>
            <Text style={styles.totalTtcValue}>
              {eur(franchise ? sums.total_ht : sums.total_ttc)}
            </Text>
          </View>
        </View>

        {isDraft && draft.notes ? <Text style={styles.note}>{draft.notes}</Text> : null}

        {franchise ? (
          <Text style={styles.legal}>TVA non applicable, art. 293 B du CGI.</Text>
        ) : null}

        {invoice ? (
          <Text style={styles.legal}>
            Paiement à réception, au plus tard le {formatDate(invoice.due_at)}. Pas
            d&apos;escompte pour paiement anticipé. En cas de retard, pénalités au
            taux de trois fois le taux d&apos;intérêt légal et indemnité forfaitaire
            pour frais de recouvrement de 40 € (art. L441-10 du Code de commerce).
            {invoice.status === "paid" && invoice.paid_at
              ? `\nFacture acquittée le ${formatDate(invoice.paid_at)}.`
              : ""}
          </Text>
        ) : (
          <View style={styles.signRow}>
            <View style={styles.signBox}>
              <Text>L&apos;entreprise</Text>
            </View>
            <View style={styles.signBox}>
              <Text>Le client — date, signature et mention « Bon pour accord »</Text>
            </View>
          </View>
        )}

        <Text style={styles.footer}>
          {isDraft
            ? "Brouillon non contractuel tant que l'artisan ne l'a pas validé. Aucun envoi automatique au client."
            : `${company}${prefs?.siret ? ` · SIRET ${prefs.siret}` : ""} · Document réalisé avec jingr.ai`}
        </Text>
      </Page>
    </Document>
  );
}
