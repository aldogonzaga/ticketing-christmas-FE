import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import { ArrowUpRight, Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "./shared";
import { useSambut } from "@/lib/sambut/store";
import {
  // useSambut,
  blankInvitation,
  newInvitation,
  type Invitation,
} from "@/lib/sambut/store";
export function PublicLayout({ children }: { children: ReactNode }) {
  const { data, ready } = useSambut();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [savedTicketCode, setSavedTicketCode] = useState<string | null>(null);

  useEffect(() => {
    try {
      const code = localStorage.getItem("sambut_my_ticket");
      if (code) setSavedTicketCode(code);
    } catch {}
  }, []);

  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = [
    ["Acara", "/"],
    ["Jadwal", "/event/schedule"],
  ] as const;

  // Nomor cadangan langsung jika data.settings.contact kosong
  const fallbackContact = "+62812-9253-9590";
  const contactNumber = data?.settings?.contact || fallbackContact;
  const formattedWaNumber = contactNumber.replace(/^0/, "62").replace(/\D/g, "");
  const searchStr = useRouterState({ select: (state) => state.location.searchStr });
  const invitationCode = new URLSearchParams(searchStr).get("undangan");
  const invitation = invitationCode
    ? data.invitations.find((item) => item.code === invitationCode && !item.cancelled)
    : undefined;
  
  return (
    <div className="public-app">
      <header className="public-header">
        <div className="public-nav page-width">
          <Brand />
          <nav className={open ? "public-links is-open" : "public-links"}>
            {nav.map(([label, to]) => (
              <Link
                key={to}
                to={to}
                search={to === "/" ? { home: "1" } : undefined}
                onClick={() => {
                  setOpen(false);
                  if (to === "/") {
                    try {
                      sessionStorage.setItem("sambut_exit_ticket", "true");
                    } catch {}
                  }
                }}
                className={path === to ? "active" : ""}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            {invitation ? (
              <Button asChild className="nav-rsvp" variant="outline">
                <Link to="/ticket/$code" params={{ code: invitation.code }}>
                  Buka Tiket Undangan <ArrowUpRight />
                </Link>
              </Button>
            ) : invitationCode && ready ? (
              <p className="field-note" role="alert">
                Undangan tidak ditemukan atau sudah dibatalkan. Silakan hubungi panitia.
              </p>
            ) : invitationCode ? (
              <p className="field-note" role="status">
                Memuat undangan…
              </p>
            ) : path.startsWith("/ticket") ? (
              <Button asChild className="nav-rsvp" variant="outline">
                <Link
                  to="/"
                  search={{ home: "1" }}
                  onClick={() => {
                    try {
                      sessionStorage.setItem("sambut_exit_ticket", "true");
                    } catch {}
                  }}
                >
                  Beranda Acara <ArrowUpRight />
                </Link>
              </Button>
            ) : savedTicketCode ? (
              <Button asChild className="nav-rsvp" variant="outline">
                <Link
                  to="/ticket/$code"
                  params={{ code: savedTicketCode }}
                  onClick={() => {
                    try {
                      sessionStorage.removeItem("sambut_exit_ticket");
                    } catch {}
                  }}
                >
                  Tiket Saya <ArrowUpRight />
                </Link>
              </Button>
            ) : path === "/" ? (
              <Button asChild className="nav-rsvp" variant="outline">
                <a href="#ambil-tiket">Daftar Tiket</a>
              </Button>
            ) : (
              <Button asChild className="nav-rsvp" variant="outline">
                <Link to="/" search={{ home: "1" }} hash="ambil-tiket">Daftar Tiket</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="Buka navigasi"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>
      {children}
      <footer className="public-footer">
        <div className="page-width footer-top">
          <div className="footer-brand">
            <Brand compact />
            <p>
              Merayakan damai dan sukacita Natal bersama.
              <br />
              Momen indah dan penuh kehangatan untuk keluarga & sahabat tercinta.
            </p>
          </div>
          <nav className="footer-navigation" aria-label="Navigasi footer">
            <strong>Jelajahi</strong>
            {nav.map(([label, to]) => (
              <Link
                key={to}
                to={to}
                search={to === "/" ? { home: "1" } : undefined}
                onClick={() => {
                  if (to === "/") {
                    try {
                      sessionStorage.setItem("sambut_exit_ticket", "true");
                    } catch {}
                  }
                }}
              > 
                {label}
              </Link>
            ))}
          </nav>
          <div className="footer-contact">
            <strong>Hubungi Kami</strong>
            <a
              href={`https://wa.me/${formattedWaNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {contactNumber}
            </a>
          </div>
        </div>
        <div className="page-width footer-bottom">
          © 2026 Christmas Celebration. Seluruh hak cipta dilindungi.{" "}
          <Link to="/admin/login" className="admin-access">
            Akses Panitia
          </Link>
          <span>
            <Sparkles size={13} /> 
          </span>
        </div>
      </footer>
    </div>
  );
}