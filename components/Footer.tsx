import Link from "next/link";

function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.4-4.3a8.5 8.5 0 1 1 15.6-4.6Z"/><path d="M8.2 7.7c.2-.5.5-.5.8-.5h.6c.2 0 .4 0 .6.5l.8 1.9c.1.3.1.5-.1.8l-.6.8c-.2.2-.2.4 0 .7.7 1.2 1.7 2.1 2.9 2.8.3.2.5.1.7-.1l.9-1.1c.2-.3.5-.3.8-.2l1.8.9c.3.1.5.3.5.5 0 .3-.1 1.5-1 2.2-.7.6-1.6.8-2.6.6-1.1-.2-2.5-.7-4.2-2.2-1.4-1.2-2.4-2.7-2.8-3.4-.4-.7-1.7-3.1-.1-5.2Z"/></svg>;
}

function InstagramIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.7" r="1"/></svg>;
}

function MailIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>;
}

export default function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || "";
  const whatsappDisplay = process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY?.trim() || "WhatsApp";
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || "";
  const instagramHandle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE?.trim() || "Instagram";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "";
  const parentSite = process.env.NEXT_PUBLIC_PARENT_SITE_URL?.trim() || "https://godavaribasket.com";

  return (
    <footer className="siteFooter">
      <div className="footerValues"><div className="shell footerValueGrid"><div><b>01</b><span><strong>ROOTED IN GODAVARI</strong><small>Food, craft and memories from the region.</small></span></div><div><b>02</b><span><strong>PACKED WITH CARE</strong><small>Thoughtful combinations made to travel.</small></span></div><div><b>03</b><span><strong>MADE TO FEEL LIKE HOME</strong><small>One Godavari box, wherever you are now.</small></span></div></div></div>

      <div className="shell footerGrid footerGridProfessional">
        <div className="footerBrand">
          <span className="footerLogoWrap"><img src="/images/brand/logo.webp" alt="Godavari Basket" /></span>
          <div><strong>GODAVARI BASKET</strong><small>ABROAD · FROM GODAVARI, WITH LOVE.</small><p>The overseas storefront of Godavari Basket—bringing familiar Godavari flavours, traditions and memories together in one thoughtfully built box.</p><a className="parentStoreLink" href={parentSite} target="_blank" rel="noreferrer">Visit Godavari Basket India ↗</a></div>
        </div>

        <div className="footerLinks"><h3>SHOP</h3><Link href="/build">Build Your Box</Link><Link href="/bundles">All Bundles</Link><Link href="/combos">Combos</Link><Link href="/catalog">Add-ons</Link><Link href="/about">Our Godavari</Link></div>

        <div className="footerLinks"><h3>HELP</h3><Link href="/checkout">Checkout</Link><Link href="/build">5 kg+ Orders</Link><Link href="/about">About Us</Link><a href={parentSite} target="_blank" rel="noreferrer">India Store ↗</a></div>

        <div className="footerContact"><h3>CONTACT</h3><p>Need help choosing or customizing a box? Reach our team directly.</p>
          <div className="footerContactList">
            {whatsappNumber ? <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer"><span><WhatsAppIcon /></span><div><small>WHATSAPP</small><b>{whatsappDisplay}</b></div></a> : null}
            {instagramUrl ? <a href={instagramUrl} target="_blank" rel="noreferrer"><span><InstagramIcon /></span><div><small>INSTAGRAM</small><b>{instagramHandle}</b></div></a> : null}
            {supportEmail ? <a href={`mailto:${supportEmail}`}><span><MailIcon /></span><div><small>EMAIL</small><b>{supportEmail}</b></div></a> : null}
          </div>
        </div>
      </div>

      <div className="footerBottom shell"><span>© {new Date().getFullYear()} Godavari Basket. All rights reserved.</span><span>Godavari Basket Abroad · From Godavari, With Love.</span></div>
    </footer>
  );
}
