import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  first_name: z.string().trim().min(1).max(80),
  last_name: z.string().trim().max(80).optional(),
  email: z.string().trim().email().max(160),
  trade: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(30).optional(),
  city: z.string().trim().max(80).optional(),
  message: z.string().trim().max(1500).optional(),
  software: z.string().trim().max(80).optional(),
  // Champ piège invisible : rempli = robot
  website: z.string().max(0).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { website: _hp, ...data } = schema.parse(await req.json());
    void _hp;
    const { duplicate } = await db.addBetaSignup({
      first_name: data.first_name,
      last_name: data.last_name || null,
      email: data.email,
      trade: data.trade || null,
      phone: data.phone || null,
      city: data.city || null,
      message: data.message || null,
      software: data.software || null,
    });
    return NextResponse.json({
      ok: true,
      message: duplicate
        ? "On a déjà votre demande, on revient vers vous très vite."
        : "C'est noté ! On vous recontacte sous 24 heures ouvrées.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Vérifiez votre prénom et votre e-mail, puis réessayez." },
      { status: 400 }
    );
  }
}
