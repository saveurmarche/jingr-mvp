import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Artisan, Job, QuoteDraft } from "./types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
    backgroundColor: "#F7F4EF",
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#6B4EFF",
    paddingBottom: 12,
  },
  brand: {
    fontSize: 18,
    color: "#6B4EFF",
    fontFamily: "Helvetica-Bold",
  },
  subtitle: { marginTop: 4, color: "#555" },
  section: { marginBottom: 16 },
  h2: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    color: "#6B4EFF",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e0d8",
    paddingVertical: 6,
  },
  colLabel: { width: "45%" },
  colQty: { width: "12%", textAlign: "right" },
  colUnit: { width: "13%", textAlign: "right" },
  colPrice: { width: "15%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right" },
  totals: { marginTop: 16, alignItems: "flex-end" },
  totalLine: { flexDirection: "row", marginBottom: 4 },
  totalLabel: { width: 100, textAlign: "right", marginRight: 12 },
  totalValue: { width: 80, textAlign: "right", fontFamily: "Helvetica-Bold" },
  note: { marginTop: 20, fontSize: 9, color: "#666", lineHeight: 1.4 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#888",
    textAlign: "center",
  },
});

function eur(n: number) {
  return `${n.toFixed(2).replace(".", ",")} €`;
}

export function QuotePdfDocument({
  draft,
  job,
  artisan,
}: {
  draft: QuoteDraft;
  job: Job;
  artisan?: Artisan;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>jingr</Text>
          <Text style={styles.subtitle}>Brouillon de devis — validation artisan</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>{draft.title}</Text>
          <Text>Client : {job.client_name}</Text>
          {job.client_address ? <Text>Adresse : {job.client_address}</Text> : null}
          {artisan ? (
            <Text>
              Artisan : {artisan.company_name || artisan.name} — {artisan.phone}
            </Text>
          ) : null}
        </View>

        {draft.intro ? (
          <View style={styles.section}>
            <Text>{draft.intro}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={[styles.row, { fontFamily: "Helvetica-Bold" }]}>
            <Text style={styles.colLabel}>Désignation</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colUnit}>Unité</Text>
            <Text style={styles.colPrice}>P.U. HT</Text>
            <Text style={styles.colTotal}>Total HT</Text>
          </View>
          {draft.line_items.map((li) => (
            <View key={li.id} style={styles.row}>
              <Text style={styles.colLabel}>{li.label}</Text>
              <Text style={styles.colQty}>{li.quantity}</Text>
              <Text style={styles.colUnit}>{li.unit}</Text>
              <Text style={styles.colPrice}>{eur(li.unit_price_ht)}</Text>
              <Text style={styles.colTotal}>
                {eur(li.quantity * li.unit_price_ht)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Total HT</Text>
            <Text style={styles.totalValue}>{eur(draft.total_ht)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>TVA</Text>
            <Text style={styles.totalValue}>{eur(draft.total_tva)}</Text>
          </View>
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>Total TTC</Text>
            <Text style={styles.totalValue}>{eur(draft.total_ttc)}</Text>
          </View>
        </View>

        {draft.notes ? <Text style={styles.note}>{draft.notes}</Text> : null}

        <Text style={styles.footer}>
          Document généré par jingr — brouillon non envoyé au client tant que
          l&apos;artisan n&apos;a pas validé.
        </Text>
      </Page>
    </Document>
  );
}
