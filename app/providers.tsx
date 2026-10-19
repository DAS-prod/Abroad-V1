"use client";

import { CatalogProvider } from "@/components/CatalogProvider";
import { BoxProvider } from "@/components/BoxProvider";

import IntroAnimation from "@/components/IntroAnimation";
import MotionInit from "@/components/MotionInit";
import Header from "@/components/Header";
import BoxDrawer from "@/components/BoxDrawer";
import FloatingBox from "@/components/FloatingBox";
import WhatsAppButton from "@/components/WhatsAppButton";
import Toast from "@/components/Toast";
import {AuthProvider} from "@/components/AuthProvider";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CatalogProvider>
      <BoxProvider>
      <AuthProvider>
        <IntroAnimation />

        <MotionInit />

        <Header />

        {children}

        {/* CART / BOX DRAWER */}
        <BoxDrawer />

        {/* FLOATING BOX / CART BUTTON */}
        <FloatingBox />

        {/* WHATSAPP ORDER BUTTON */}
        <WhatsAppButton />


        {/* ADD / REMOVE NOTIFICATIONS */}
        <Toast />
      </AuthProvider>
      </BoxProvider>
    </CatalogProvider>
  );
}
