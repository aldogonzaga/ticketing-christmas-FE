import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Clock3,
  Sparkles,
  Heart,
  Quote,
  Download,
  Printer,
  Share2,
  Copy,
  Ticket,
  Maximize,
  Volume2,
  VolumeX,
  X,
  CalendarPlus,
  UserCheck,
  CheckCircle2,
  Users,
  Check,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import templeImage from "@/assets/borobudur-dawn.jpg";
import christmasGroupPhoto from "@/assets/mhs.jpeg";
import medleyMusic from "@/assets/Medley.mp3";
import background2Image from "@/assets/background2.jpeg";
import {
  useSambut,
  type Invitation,
} from "@/lib/sambut/store";
import { eventDate, inviteURL } from "@/lib/sambut/utils";
import { PublicLayout } from "./public-layout";
import { SectionLabel, ArrowLink, Brand, Badge, RsvpBadge, Empty, copyText } from "./shared";

export const schedule = [
  ["09.00 – 10.00", "Sapaan & Registrasi", "Penyambutan tamu undangan, pembagian booklet acara, dan foto bersama."],
  ["10.00 – 10.45", "Pujian Natal (Praise)", "Lagu-lagu pujian Natal penuh sukacita dan pembukaan ibadah."],
  ["10.45 – 11.30", "Renungan & Doa Natal", "Pesan Natal pembawa damai, penyalaan lilin, dan doa berkat."],
  ["11.30 – 12.30", "Perayaan & Ramah Tamah", "Persembahan spesial, pembagian bingkisan kasih, dan santap siang bersama."],
];

// URL Google Calendar dengan Waktu Acara
const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
  "Christmas Celebration 2026"
)}&dates=20261225T020000Z/20261225T050000Z&details=${encodeURIComponent(
  "Merayakan damai, sukacita, dan kehangatan Natal bersama keluarga dan sahabat."
)}&location=${encodeURIComponent("Grand Ballroom")}`;

function Countdown() {
  const { data } = useSambut();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!data.settings.date || now === null)
    return (
      <div>
        <div className="fact-value">Waktu</div>
        <div className="fact-note">
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-inherit inline-flex items-center gap-1"
            title="Simpan Jam Acara ke Kalender"
          >
            13.00 - 15.00 WIB <CalendarPlus size={14} />
          </a>
        </div>
      </div>
    );

  const diff = Math.max(0, new Date(data.settings.date).getTime() - now);
  if (!diff)
    return (
      <div>
        <div className="fact-label">HARI ISTIMEWA</div>
        <div className="fact-value">Waktunya merayakan bersama</div>
      </div>
    );

  const parts = [
    Math.floor(diff / 86400000),
    Math.floor(diff / 3600000) % 24,
    Math.floor(diff / 60000) % 60,
    Math.floor(diff / 1000) % 60,
  ];

  return (
    <div className="countdown">
      {parts.map((p, i) => (
        <div key={i}>
          {String(p).padStart(2, "0")}
          <small>{["HARI", "JAM", "MENIT", "DETIK"][i]}</small>
        </div>
      ))}
    </div>
  );
}

export function HomePage() {
  const { data, ready } = useSambut();
  const navigate = useNavigate();
  const searchStr = useRouterState({ select: (state) => state.location.searchStr });
  const invitationCode = new URLSearchParams(searchStr).get("undangan");
  const invitation = invitationCode
    ? data.invitations.find((item) => item.code === invitationCode && !item.cancelled)
    : undefined;

  const revealRoot = useRef<HTMLElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const [curtainStage, setCurtainStage] = useState<"closed" | "opening" | "done">("closed");
  const [musicPlaying, setMusicPlaying] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCurtainStage("done");
      return;
    }
    const openTimer = window.setTimeout(() => setCurtainStage("opening"), 650);
    const finishTimer = window.setTimeout(() => setCurtainStage("done"), 3350);
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  useEffect(() => {
    const root = revealRoot.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries, activeObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            activeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -35px 0px" },
    );
    targets.forEach((target, index) => {
      target.style.setProperty("--reveal-delay", `${(index % 4) * 85}ms`);
      observer.observe(target);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <PublicLayout>
      <main className="public-home" ref={revealRoot}>
        <section className="event-hero">
          <img
            className="hero-image"
            src={templeImage}
            width={1920}
            height={1088}
            alt="Suasana Natal yang hangat dan damai"
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="hero-bottom-shade" />
          <div className="christmas-snow" aria-hidden="true" />
          <div className="page-width hero-content">
            <div className="hero-edition"></div>
            <h1>
              Christmas Celebration &
              <br />
              Holiday Gala <em>2026.</em>
            </h1>
            <p className="hero-tagline">“{data.settings.tagline}”</p>
            <p className="hero-description">
              Merayakan damai, sukacita, dan kehangatan Natal bersama dalam kebersamaan yang penuh kasih dan berkah.
            </p>
            <div className="hero-buttons">
              {invitation ? (
                <Button className="text-black" asChild size="lg">
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
              ) : (
                <Button asChild size="lg">
                  <a className="klaim" href="https://docs.google.com/spreadsheets/d/188BaLCK3JFolGqXpn41LIqDKH4KsYSPELjLyz0XcEns/edit?usp=sharing">
                    Buka Tiket Undangan <ArrowUpRight />
                  </a>
                </Button>
              )}
              <Button asChild size="lg" variant="outline" className="outline-hero">
                <a href="#rundown-acara">
                  Detail Acara <ArrowRight />
                </a>
              </Button>
            </div>
          </div>
        </section>

        <section className="event-facts">
          <div className="page-width facts-grid" data-reveal>
            {/* Waktu Perayaan */}
            <div className="fact">
              <CalendarDays />
              <div>
                <div className="fact-value">{eventDate(data.settings.date)}</div>
                <div className="fact-note">
                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-inherit inline-flex items-center gap-1"
                    title="Simpan tanggal istimewanya ke Kalender"
                  >
                    {data.settings.date
                      ? "Simpan tanggal istimewanya"
                      : "25 Desember 2026"}{" "}
                    <CalendarPlus size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* Tempat Pertemuan */}
            <div className="fact">
              <MapPin />
              <div>
                <div className="fact-value">
                  {data.settings.location || "Lokasi Acara"}
                </div>
                <div className="fact-note">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      data.settings.location || "Grand Ballroom"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-inherit inline-flex items-center gap-1"
                  >
                    {data.settings.location || "Lihat Peta Lokasi"} ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Jam & Countdown */}
            <div className="fact">
              <Clock3 />
              <Countdown />
            </div>
          </div>
        </section>

        <section className="about-section" id="tentang">
          <div className="page-width">
            <div className="home-story-layout">
              <div className="home-story-heading" data-reveal>
                <SectionLabel>SUKACITA NATAL BERSAMA</SectionLabel>
                <h2 className="display-heading">
                  Merajut kasih. Berbagi <em>sukacita & damai.</em>
                </h2>
              </div>
              <figure className="home-story-photo" data-reveal>
                <div className="home-photo-topline">
                  <span>CATATAN KEBERSAMAAN</span>
                  <span>NATAL · 2026</span>
                </div>
                <div className="home-photo-image">
                  <img
                    src={christmasGroupPhoto}
                    width={1200}
                    height={900}
                    alt="Kebersamaan Natal bersama keluarga dan sahabat"
                    loading="lazy"
                  />
                  <div className="home-photo-stamp" aria-hidden="true">
                    <strong>NATAL</strong>
                    <span>JOY & PEACE</span>
                    <small>2026</small>
                  </div>
                </div>
                <figcaption>
                  <span>Christmas Celebration</span>
                  <small>Damai & Sukacita Bersama</small>
                </figcaption>
              </figure>
              <div className="home-story-copy" data-reveal>
                <p>
                  Christmas Celebration 2026 adalah momen istimewa untuk merayakan kasih,
                  pengharapan, dan kebersamaan yang penuh sukacita.
                </p>
                <p>
                  Mari bersama-sama mempererat tali persaudaraan dalam kehangatan suasana Natal yang kudus dan berkesan.
                </p>
                <a href="#rundown-acara" className="arrow-link">
                  Lihat rangkaian acara <ArrowRight size={17} />
                </a>
              </div>
            </div>
            <div className="values-row">
              <div className="value-item" data-reveal>
                <Sparkles />
                <div>
                  <h3>Sukacita & Damai</h3>
                  <p>Membawa terang dan kehangatan Natal.</p>
                </div>
              </div>
              <div className="value-item" data-reveal>
                <Heart />
                <div>
                  <h3>Kasih & Berkat</h3>
                  <p>Merayakan kebersamaan yang tulus.</p>
                </div>
              </div>
              <div className="value-item" data-reveal>
                <Ticket />
                <div>
                  <h3>Kenangan Indah</h3>
                  <p>Momen berharga bersama keluarga & sahabat.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seksi Rangkaian Momen */}
        <section
          className="preview-section relative overflow-hidden bg-cover bg-center bg-no-repeat text-white py-16"
          id="rundown-acara"
          style={{
            backgroundImage: `url(${background2Image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-950/80 via-red-900/70 to-emerald-950/80 backdrop-blur-[1px]" />

          <div className="page-width relative z-10">
            <div className="section-top">
              <div data-reveal>
                <SectionLabel>RANGKAIAN MOMEN</SectionLabel>
                <h2 className="display-heading text-white">Setiap momen, punya cerita.</h2>
              </div>
              <ArrowLink to="/event/schedule">Lihat jadwal lengkap</ArrowLink>
            </div>
            <div className="schedule-preview">
              {schedule.map(([time, title, text], index) => (
                <article className="schedule-step" key={title} data-reveal>
                  <time className="text-white font-semibold drop-shadow">{time} WIB</time>
                  <div className="schedule-marker" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="schedule-copy">
                    <h3 className="text-white font-bold text-xl drop-shadow">{title}</h3>
                    <p className="text-gray-100 font-normal drop-shadow-sm">{text}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="field-note mt-7 text-gray-200" data-reveal>
              *Rancangan jadwal simulasi. Waktu resmi akan diumumkan panitia.
            </p>
          </div>
        </section>

        <section className="messages-section py-12" id="kesan-pesan">
          <div className="page-width">
            <MessagesSectionContent />
          </div>
        </section>

        {!invitationCode && (
          <section className="registration-section" id="Klaim Tiket">
            <div className="page-width">
              <EventRegistrationForm />
            </div>
          </section>
        )}

        {curtainStage !== "done" && (
          <div className={`opening-curtain opening-curtain--${curtainStage}`} aria-hidden="true">
            <div className="curtain-panel curtain-panel-left" />
            <div className="curtain-panel curtain-panel-right" />
            <div className="curtain-centerpiece">
              <span className="brand-mark">
                <Sparkles strokeWidth={1.4} />
              </span>
              <span>SELAMAT DATANG</span>
              <strong>{data.settings.name}</strong>
              <small>Christmas Celebration · 2026</small>
            </div>
          </div>
        )}
      </main>
    </PublicLayout>
  );
}

function EventRegistrationForm() {
  const { registerPublicTicket } = useSambut();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Orang Tua/Wali",
    affiliation: "",
    message: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Silakan masukkan nama lengkap Anda.");
      return;
    }
    if (!formData.affiliation.trim()) {
      toast.error("Silakan masukkan asal afiliasi / lembaga / keluarga Anda.");
      return;
    }
    if (!formData.message.trim()) {
      toast.error("Silakan tuliskan ucapan atau pesan Natal Anda.");
      return;
    }

    setLoading(true);
    try {
      const invitation = await registerPublicTicket({
        name: formData.name.trim(),
        affiliation: formData.affiliation.trim(),
        category: formData.category,
        message: formData.message.trim(),
      });

      // Navigate to the newly generated unique code ticket page
      await navigate({ to: "/ticket/$code", params: { code: invitation.code } });
    } catch (e: any) {
      toast.error(e?.message || "Terjadi kesalahan saat membuat tiket.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="registration-content">
      <div className="registration-heading" data-reveal>
        <SectionLabel>PENDAFTARAN & TIKET NATAL</SectionLabel>
        <h2>Dapatkan Tiket Perayaan Anda.</h2>
        <p>
          Masukkan nama, afiliasi (seperti sekolah atau keluarga/orang tua), dan ucapan Natal Anda untuk menerbitkan kode tiket unik Anda.
        </p>
      </div>

      <form className="form-panel registration-form" onSubmit={handleSubmit} data-reveal>
        <h2>Formulir Pengambilan Tiket</h2>

        <div className="form-grid">
          <label className="field">
            <span>Nama Lengkap / Nama Tamu *</span>
            <input
              type="text"
              required
              maxLength={80}
              placeholder="Contoh: Budi Santoso / Keluarga Gunawan"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </label>

          <label className="field">
            <span>Kategori Tamu *</span>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Orang Tua/Wali">Keluarga / Orang Tua / Family</option>
              <option value="SMP">SMP / Sekolah Menengah</option>
              <option value="Guru">Guru / Pendidik</option>
              <option value="VIP">Tamu VIP / Komunitas</option>
              <option value="Umum">Umum / Jemaat / Sahabat</option>
            </select>
          </label>

          <label className="field full">
            <span>Afiliasi / Asal Lembaga / Keluarga *</span>
            <input
              type="text"
              required
              maxLength={120}
              placeholder="Contoh: SMP Negeri 1 Cibitung / Keluarga Bpk. Gunawan"
              value={formData.affiliation}
              onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
            />
          </label>

          <label className="field full">
            <span>Ucapan & Pesan Natal *</span>
            <textarea
              required
              maxLength={500}
              rows={3}
              placeholder="Tuliskan ucapan damai, doa syukur, atau harapan sukacita Natal Anda..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </label>
        </div>

        <Button type="submit" className="w-full mt-5 py-6 text-sm font-semibold" disabled={loading}>
          {loading ? "Menerbitkan Kode Tiket..." : (
            <>
              Dapatkan Kode Tiket Unik <Ticket className="ml-2" size={18} />
            </>
          )}
        </Button>

        <p className="field-note mt-4 text-center">
          Kode unik akan diterbitkan dan tersimpan di database. Simpan atau screenshot kode tiket Anda untuk diverifikasi di hari acara.
        </p>
      </form>
    </div>
  );
}

const titah = {
  heading: ["Damai di Bumi,", "Sukacita di Hati"],
  author: "Panitia Christmas Celebration",
  role: "Pesan & Renungan Kasih 2026",
  id: "Selamat datang di Christmas Celebration 2026. Kiranya damai sejahtera, pengharapan yang baru, dan kehangatan Natal senantiasa melingkupi kita semua bersama keluarga dan sahabat terkasih. Mari kita rayakan momen kudus ini dengan penuh syukur, sukacita, dan kebersamaan.",
  jv: "May the peace, joy, and hope of Christmas fill your heart and home with warmth, love, and laughter throughout this festive season and into the New Year.",
};

export function TitahSection() {
  const { data } = useSambut();
  const [playing, setPlaying] = useState<"" | "id" | "jv">("");
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  function speak(key: "id" | "jv") {
    if (!("speechSynthesis" in window)) {
      toast.error("Peramban ini tidak mendukung suara");
      return;
    }
    window.speechSynthesis.cancel();
    if (playing === key) {
      setPlaying("");
      return;
    }
    const utter = new SpeechSynthesisUtterance(key === "id" ? titah.id : titah.jv);
    utter.lang = key === "id" ? "id-ID" : "en-US";
    utter.rate = 0.94;
    utter.onend = () => setPlaying("");
    utter.onerror = () => setPlaying("");
    setPlaying(key);
    window.speechSynthesis.speak(utter);
  }
  const quotes = [
    { key: "id" as const, label: "Bahasa Indonesia", text: titah.id },
    { key: "jv" as const, label: "English Message", text: titah.jv },
  ];
  return (
    <section className="titah-section">
      <div className="page-width titah-layout">
        <figure className="titah-card">
          <span className="titah-crest">
            <Sparkles />
            <strong>{data.settings.school || "Christmas Celebration"}</strong>
            <small>Joy, Peace & Love 2026</small>
          </span>
          <figcaption>
            <span className="titah-author">{titah.author}</span>
            <span className="titah-role">{titah.role}</span>
          </figcaption>
        </figure>
        <div className="titah-body">
          <SectionLabel>PESAN NATAL</SectionLabel>
          <h2 className="display-heading">
            {titah.heading[0]}
            <br />
            <em>{titah.heading[1]}</em>
          </h2>
          {quotes.map((q) => (
            <div className="titah-quote" key={q.key}>
              <div className="quote-head">
                <span className="quote-lang">
                  <Quote />
                  {q.label}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`quote-play ${playing === q.key ? "playing" : ""}`}
                  onClick={() => speak(q.key)}
                  aria-label={
                    playing === q.key
                      ? `Hentikan suara ${q.label}`
                      : `Dengarkan titah dalam ${q.label}`
                  }
                >
                  {playing === q.key ? <VolumeX /> : <Volume2 />}
                  {playing === q.key ? "Hentikan" : "Dengarkan"}
                </Button>
              </div>
              <p>{q.text}</p>
              <span className="quote-mark" aria-hidden="true">
                ”
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SchedulePage() {
  return (
    <PublicLayout>
      <main className="page-width inner-page">
        <SectionLabel>RANGKAIAN ACARA</SectionLabel>
        <h1 className="page-heading">Momen yang kita nantikan.</h1>
        <p className="page-intro">
          Dari sambutan hangat hingga langkah kolaborasi. Setiap bagian dirangkai untuk menghadirkan
          pengalaman yang berkesan.
        </p>
        <div className="subtle-notice">
          Rancangan jadwal simulasi — tanggal, waktu, dan susunan acara resmi menunggu konfirmasi
          panitia.
        </div>
        <div className="timeline">
          {schedule.map(([time, title, text], i) => (
            <div className="timeline-row" key={title}>
              <time>
                {time}
                <br />
                <small>WIB</small>
              </time>
              <div>
                <SectionLabel>0{i + 1}</SectionLabel>
                <h3 className="mt-3">{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </PublicLayout>
  );
}

function MessagesSectionContent() {
  const { data, addMessage } = useSambut();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    addMessage({
      name: String(f.get("name")).trim(),
      text: String(f.get("text")).trim(),
      category: "Tamu Undangan Natal 2026",
    });
    e.currentTarget.reset();
    toast.success("Pesan Anda telah ditambahkan");
  }

  const marqueeMessages = [...data.messages, ...data.messages];

  return (
    <div>
      <style>{`
        @keyframes marqueeAuto {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex !important;
          width: max-content !important;
          animation: marqueeAuto 22s linear infinite !important;
        }
        .marquee-track:hover {
          animation-play-state: paused !important;
        }
      `}</style>

      <SectionLabel>SUARA & HARAPAN</SectionLabel>
      <h1 className="page-heading mb-2">yang menghangatkan.</h1>
      <p className="page-intro mb-8">
        Titipkan ucapan selamat Natal, doa damai, dan harapan sukacita untuk kita semua.
      </p>

      <div className="relative w-full overflow-hidden mb-10 py-4 no-scrollbar">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-[#f7faf8] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-[#f7faf8] to-transparent" />

        <div className="marquee-track gap-6">
          {marqueeMessages.map((m, i) => (
            <article className="message-card w-[320px] shrink-0" key={i}>
              <Quote />
              <blockquote>“{m.text}”</blockquote>
              <div className="message-author">
                {m.name}
                <span>{m.category}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      <form className="form-panel" onSubmit={submit}>
        <h2>Tinggalkan sebuah pesan.</h2>
        <div className="field mt-4">
          <span>Nama Anda</span>
          <input
            name="name"
            aria-label="Nama Anda"
            required
            maxLength={80}
            placeholder="Nama lengkap"
          />
        </div>
        <div className="field mt-5">
          <span>Kesan & pesan</span>
          <textarea
            name="text"
            aria-label="Kesan dan pesan"
            required
            maxLength={500}
            placeholder="Tuliskan harapan terbaik Anda…"
          />
        </div>
        <div className="form-actions mt-5">
          <Button type="submit">
            Kirim Pesan <ArrowUpRight />
          </Button>
        </div>
      </form>
    </div>
  );
}

export function MessagesPage() {
  return (
    <PublicLayout>
      <main className="page-width inner-page">
        <MessagesSectionContent />
      </main>
    </PublicLayout>
  );
}

export function RsvpPage() {
  return (
    <PublicLayout>
      <main className="registration-section">
        <div className="page-width">
          <EventRegistrationForm />
        </div>
      </main>
    </PublicLayout>
  );
}

function ticketIdentity(item: Invitation) {
  const name = item.name;
  const institution = item.category === "SMP" ? (item.pic || "") : item.institution;
  const role =
    item.title ||
    (item.category === "SMP"
      ? item.pic ? `` : ""
      : item.category === "Guru"
        ? "Guru / Pendidik"
        : item.category === "VIP"
          ? item.vipLevel || "Tamu Kehormatan"
          : `${item.relationship || "Orang Tua"} / Wali`);
  return { name, institution, role };
}

export function GoldenTicket({
  item,
  member,
  customName,
}: {
  item: Invitation;
  member?: { name: string; role: string };
  customName?: string;
}) {
  const { data } = useSambut();
  const identity = ticketIdentity(item);
  const dateTime = data.settings.date
    ? new Date(data.settings.date).toLocaleString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "Tanggal dan waktu ";
  const progress = Math.min(100, Math.round((item.checked / Math.max(1, item.quota)) * 100));
  const ticketName = customName || member?.name || identity.name;

  return (
    <div className="ticket" id="golden-ticket">
      <div className="ticket-top">
        <Brand compact />
        <div className="ticket-event">{data.settings.name}</div>
        <h2>{ticketName}</h2>
        {/* <p className="ticket-recipient">
          {member
            ? `${member.role} · ${item.name}`
            : item.category === "SMP"
              ? ``
              : identity.role}
        </p> */}
        {!member && identity.institution && item.category !== "SMP" && (
          <p className="ticket-institution">{identity.institution}</p>
        )}
        <div className="ticket-seat">
          Seat {item.seat || "Belum ditetapkan"} · {item.quota} orang
        </div>
        {item.note && (
          <p className="ticket-christmas-greeting">
            <Quote size={12} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle", opacity: 0.7 }} />
            &ldquo;{item.note}&rdquo;
          </p>
        )}
      </div>
      <div className="ticket-location">
        <MapPin aria-hidden="true" />
        <div>
          <strong>
            {data.settings.date
              ? eventDate(data.settings.date)
              : "Jumat, 25 Desember 2026 pukul 09.00 - 12.30 WIB"}
          </strong>
          <span>LOCATION · {data.settings.location || "Segera diumumkan"}</span>
          {data.settings.location && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.settings.location)}`}
              target="_blank"
              rel="noreferrer"
            >
              Buka peta
            </a>
          )}
        </div>
      </div>
      <div className="ticket-perforation" aria-hidden="true" />
      <div className="ticket-attendance">
        {item.checked > 0 ? (
          <>
            <div className="ticket-attendance-heading">
              <span style={{ color: "#16a34a", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Check size={15} />
                {item.category === "SMP" ? "Rombongan sudah hadir" : "Sudah check-in"}
              </span>
              <strong style={{ color: "#16a34a" }}>
                {item.checked} <small style={{ color: "#16a34a" }}>/ {item.quota}</small>
              </strong>
            </div>
            <div
              className="ticket-progress"
              role="progressbar"
              aria-label="Jumlah tamu yang sudah check-in"
              aria-valuemin={0}
              aria-valuemax={item.quota}
              aria-valuenow={Math.min(item.checked, item.quota)}
            >
              <span style={{ width: `${progress}%`, background: "#16a34a" }} />
            </div>
            <strong className="ticket-remaining" style={{ color: "#16a34a" }}>
              🎄 Selamat datang! Nikmati perayaan Natal bersama.
            </strong>
          </>
        ) : (
          <>
            <div className="ticket-attendance-heading">
              <span>Belum check-in</span>
              <strong style={{ color: "#9ca3af" }}>0 <small>/ {item.quota}</small></strong>
            </div>
            <div
              className="ticket-progress"
              role="progressbar"
              aria-label="Belum check-in"
              aria-valuemin={0}
              aria-valuemax={item.quota}
              aria-valuenow={0}
            >
              <span style={{ width: "0%" }} />
            </div>
            <strong className="ticket-remaining" style={{ color: "#6b7280", fontWeight: 500 }}>
              Tunjukkan kode ini kepada panitia saat tiba di lokasi.
            </strong>
          </>
        )}
      </div>
      <div className="ticket-perforation" aria-hidden="true" />
      <div className="ticket-code-card">
        <span className="ticket-code-label">KODE TIKET RESMI</span>
        <div className="ticket-code-display">{item.code}</div>
        <div className="ticket-code-actions">
          <button
            type="button"
            className="ticket-copy-code-btn"
            title="Salin Kode Undangan"
            onClick={() => {
              copyText(item.code);
              toast.success(`Kode tiket ${item.code} berhasil disalin!`);
            }}
          >
            <Copy size={13} />
            <span>Salin Kode Tiket</span>
          </button>
          <RsvpBadge value={item.rsvp} />
        </div>
      </div>
      <p className="ticket-note">
        📸 <strong>Screenshot atau simpan kode ini ({item.code}).</strong> Sebutkan kode tiket ini kepada panitia saat tiba di lokasi untuk verifikasi kehadiran.
      </p>
    </div>
  );
}

export function TicketPage({ code, customName }: { code: string; customName?: string }) {
  const { data, ready, checkIn } = useSambut();
  const ref = useRef<HTMLDivElement>(null);
  const [directItem, setDirectItem] = useState<Invitation | null>(null);

  const localItem = data.invitations.find((i) => i.code.toUpperCase() === code.toUpperCase() && !i.cancelled);
  const item = localItem || directItem;

  useEffect(() => {
    if (ready && !localItem) {
      import("@/lib/sambut/api").then(({ getPublicInvitationApi }) => {
        getPublicInvitationApi(code)
          .then((res) => {
            if (res.data) setDirectItem(res.data);
          })
          .catch(() => {});
      });
    }
  }, [code, ready, localItem]);

  const identity = item ? ticketIdentity(item) : { name: "", institution: "", role: "" };
  const displayName = customName || identity.name || "Tamu Undangan";

  // Arrival check-in panel state
  const [partyCount, setPartyCount] = useState(() => item?.checked || 1);
  const [attendeeNames, setAttendeeNames] = useState("");
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInDone, setCheckInDone] = useState(false);
  const [showEditParty, setShowEditParty] = useState(false);

  useEffect(() => {
    if (item?.checked) {
      setPartyCount(item.checked);
    }
  }, [item?.checked]);

  async function download() {
    if (!ref.current) return;
    const ticket = ref.current.querySelector<HTMLElement>(".ticket");
    if (!ticket) return;
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(ticket, {
        pixelRatio: 2,
        width: ticket.offsetWidth,
        height: ticket.offsetHeight,
        style: { margin: "0", maxWidth: "none" },
      });
      const a = document.createElement("a");
      a.download = `Golden-Ticket-${code}.png`;
      a.href = url;
      a.click();
    } catch {
      toast.error("Unduhan gagal. Gunakan Cetak / PDF sebagai alternatif.");
    }
  }

  return (
    <PublicLayout>
      <main className="ticket-page">
        {!ready ? (
          <div className="page-width inner-page">
            <Empty title="Memuat undangan…" text="" />
          </div>
        ) : item ? (
          <section className="ticket-page-section">
            <div className="page-width ticket-page-layout">
              <header className="ticket-page-heading">
                <div>
                  <SectionLabel>TIKET DIGITAL · {item.category.toUpperCase()}</SectionLabel>
                  <h1>Ticket</h1>
                  <p>
                    Undangan untuk <strong>{displayName}</strong>. Tunjukkan tiket ini atau sebutkan kode kepada panitia saat tiba di lokasi.
                  </p>
                </div>
                <Badge tone="gold">{item.rsvp === "Tidak Hadir" ? "Tidak Hadir" : item.rsvp}</Badge>
              </header>
              <div className="ticket-page-card" ref={ref}>
                <GoldenTicket item={item} customName={displayName} />
              </div>
              <div className="ticket-actions">
                <Button onClick={download}>
                  <Download />
                  Unduh PNG
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer />
                  Cetak / PDF
                </Button>
                <Button variant="outline" onClick={() => copyText(inviteURL(code))}>
                  <Copy />
                  Salin Tautan
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(`Salam Sejahtera & Selamat Natal! Anda diundang ke ${data.settings.name}. Buka tiket undangan Anda di: ${inviteURL(code)}`)}`,
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  <Share2 />
                  Bagikan
                </Button>
                <Button
                  variant="outline"
                  aria-label="Layar penuh tiket"
                  title="Layar penuh tiket"
                  onClick={() =>
                    ref.current
                      ?.requestFullscreen?.()
                      .catch(() => toast.error("Layar penuh tidak tersedia"))
                  }
                >
                  <Maximize />
                </Button>
              </div>
              {/* ── Day-of Arrival Check-in Panel ── */}
              <div className="ticket-checkin-panel">
                {(item.checked > 0 || checkInDone) && !showEditParty ? (
                  <div className="ticket-checkin-success">
                    <div className="ticket-checkin-success-main">
                      <PartyPopper size={30} style={{ color: "#16a34a", shrink: 0 }} />
                      <div>
                        <strong>Kehadiran Terkonfirmasi! 🎄</strong>
                        <p>
                          Tercatat <strong>{item.checked} orang</strong> hadir pada perayaan Natal.
                        </p>
                        {item.members && item.members.length > 0 && (
                          <div className="ticket-member-tags">
                            {item.members.map((m) => (
                              <span key={m.id} className="ticket-member-tag">
                                ✓ {m.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditParty(true)}
                      className="ticket-checkin-edit-btn"
                    >
                      Perbarui / Tambah Rombongan
                    </Button>
                  </div>
                ) : (
                  <div className="ticket-checkin-form-wrap">
                    <div className="ticket-checkin-form-header">
                      <Users size={20} />
                      <div>
                        <strong>{item.checked > 0 ? "Perbarui Rombongan Hadir" : "Hadir hari ini?"}</strong>
                        <p>Masukkan jumlah rombongan yang hadir saat tiba di lokasi perayaan.</p>
                      </div>
                    </div>
                    <div className="ticket-checkin-fields">
                      <label>
                        <span>Jumlah orang yang hadir</span>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={partyCount}
                          onChange={(e) => setPartyCount(Math.max(1, Number(e.target.value)))}
                          className="ticket-checkin-input"
                        />
                      </label>
                      <label>
                        <span>Nama yang hadir <small>(opsional, pisahkan koma)</small></span>
                        <textarea
                          rows={2}
                          placeholder="cth: Budi, Ani, Cici"
                          value={attendeeNames}
                          onChange={(e) => setAttendeeNames(e.target.value)}
                          className="ticket-checkin-textarea"
                        />
                      </label>
                    </div>
                    <div className="ticket-checkin-btn-row">
                      <Button
                        disabled={checkInLoading}
                        onClick={async () => {
                          setCheckInLoading(true);
                          try {
                            const names = attendeeNames
                              .split(/[,\n]+/)
                              .map((n) => n.trim())
                              .filter(Boolean);
                            const ok = await checkIn(item.code, [], partyCount, names.length ? names : undefined);
                            if (ok) {
                              setCheckInDone(true);
                              setShowEditParty(false);
                              toast.success("Check-in berhasil! Selamat merayakan Natal 🎄");
                            } else {
                              toast.error("Check-in gagal. Coba lagi atau hubungi panitia.");
                            }
                          } finally {
                            setCheckInLoading(false);
                          }
                        }}
                      >
                        <CheckCircle2 />
                        {checkInLoading ? "Menyimpan ke Database…" : "Konfirmasi Kehadiran"}
                      </Button>
                      {item.checked > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowEditParty(false)}
                        >
                          Batal
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center ticket-page-footer">
                <ArrowLink to="/">Kembali ke halaman acara</ArrowLink>
              </div>
            </div>
          </section>
        ) : (
          <div className="page-width inner-page">
            <Empty
              title="Undangan tidak ditemukan"
              text="Periksa kembali tautan atau hubungi panitia acara."
            />
          </div>
        )}
      </main>
    </PublicLayout>
  );
}