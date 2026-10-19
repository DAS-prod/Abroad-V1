import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { currentUser, service, validateCart } from "@/lib/abroad-order";

import {notifyAbroadOrder} from "@/lib/abroad-notifications";

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser(request);
    if (!user) return NextResponse.json({ error: "Please sign in before checkout" }, { status: 401 });
    const body = await request.json();
    const address = body.address || {};
    for (const key of ["name", "phone", "email", "country", "address1", "city", "state", "postal"]) {
      if (!String(address[key] || "").trim()) return NextResponse.json({ error: `Missing ${key}` }, { status: 400 });
    }
    if (String(address.email).toLowerCase() !== String(user.email || "").toLowerCase()) {
      return NextResponse.json({ error: "Use your signed-in email for checkout" }, { status: 400 });
    }
    const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
    if (!number) return NextResponse.json({ error: "WhatsApp business number is not configured" }, { status: 503 });
    const totals = await validateCart(body.lines,body.couponCode);
    const orderId = `GBA-${randomUUID().replace(/-/g, "").slice(0, 20).toUpperCase()}`;
    const db = service();
    const { error: profileError } = await db.from("abroad_customers").upsert({
      user_id: user.id, email: user.email, full_name: String(address.name),
      phone: String(address.phone), updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
    if (profileError) throw profileError;
    // Never mark a WhatsApp order paid without verified payment confirmation.
    const { error: orderError } = await db.from("abroad_orders").insert({
      id: orderId, user_id: user.id, email: user.email, country: address.country,
      address, items: totals.items, subtotal_usd: totals.subtotal_usd,discount_usd:totals.discount_usd,coupon_code:totals.coupon_code,
      transport_usd: totals.transport_usd, total_usd: totals.total_usd,
      shipment_weight_kg: totals.shipment_weight_kg,
      gift_mode: Boolean(body.giftMode), payment_status: "PENDING",
      checkout_method: "WHATSAPP"
    });
    if (orderError) throw orderError;
    const items = totals.items.map((item: { name: string; quantity: number; unit_price_usd: number }) =>
      `• ${item.name} × ${item.quantity} — $${(item.unit_price_usd * item.quantity).toFixed(2)}`).join("\n");
    const message = [
      "Hello Godavari Basket! I'd like to confirm my abroad order.",
      `Order reference: ${orderId}`, "", "Items:", items, "",
      `Subtotal: $${totals.subtotal_usd.toFixed(2)}`,
      `Coupon ${totals.coupon_code || ""}: -$${totals.discount_usd.toFixed(2)}`,
      `Transport: $${totals.transport_usd.toFixed(2)}`,
      `Total: $${totals.total_usd.toFixed(2)}`,
      `Shipment weight: ${totals.shipment_weight_kg.toFixed(2)} kg`, "",
      `Name: ${address.name}`, `Email: ${user.email}`, `Phone: ${address.phone}`,
      `Delivery: ${[address.address1, address.address2, address.city, address.state, address.postal, address.country].filter(Boolean).join(", ")}`,
      address.notes ? `Notes: ${address.notes}` : "",
      "Please confirm payment and dispatch details."
    ].filter(Boolean).join("\n");
    await notifyAbroadOrder(orderId,"abroad_whatsapp_order");
    return NextResponse.json({ orderId, whatsappUrl: `https://wa.me/${number}?text=${encodeURIComponent(message)}` });
  } catch (error) {
    console.error("Abroad WhatsApp order failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to prepare WhatsApp order" }, { status: 500 });
  }
}
