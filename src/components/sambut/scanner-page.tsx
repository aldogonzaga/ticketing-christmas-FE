import { useEffect, useState } from "react";
import { Check, ArrowRight, CheckCircle2, UserCheck, AlertTriangle, X, Users, Quote, Ticket, ClipboardCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSambut, type Invitation } from "@/lib/sambut/store";
import { toast } from "sonner";
import { AdminLayout } from "./admin-layout";
import { Badge, Empty, RsvpBadge } from "./shared";
import * as DialogPrimitive from "@radix-ui/react-dialog";

function playScanBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

/**
 * Pop-up Alert Modal yang muncul di tengah layar setelah kode tiket diverifikasi
 */
export function ScanAlertModal({
  item,
  wasAlreadyFull,
  onContinueScan,
}: {
  item: Invitation;
  wasAlreadyFull?: boolean;
  onContinueScan: () => void;
}) {
  const isFull = item.checked >= item.quota;
  const isCancelled = item.cancelled;
  const isDenied = isCancelled || wasAlreadyFull;

  return (
    <DialogPrimitive.Root
      open
      onOpenChange={(open) => {
        if (!open) onContinueScan();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="modal-backdrop" />
        <DialogPrimitive.Content
          className="modal accessible-modal"
          style={{ maxWidth: "480px", width: "92vw" }}
          aria-describedby={undefined}
        >
          <header className="flex items-center justify-between border-b border-border/80 px-5 py-4">
            <DialogPrimitive.Title asChild>
              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded-md ${isDenied ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                  <ClipboardCheck size={18} />
                </span>
                <span className="font-semibold text-base">
                  {isDenied ? "Kehadiran Ditolak" : "Konfirmasi Kehadiran Tamu"}
                </span>
              </div>
            </DialogPrimitive.Title>
            <Button variant="ghost" size="icon" onClick={onContinueScan} aria-label="Tutup pop up">
              <X size={18} />
            </Button>
          </header>

          <div className="p-6 text-center">
            {isDenied ? (
              <div className="w-16 h-16 rounded-full bg-destructive/15 text-destructive border border-destructive/30 flex items-center justify-center mx-auto mb-3 animate-in zoom-in-75 duration-200">
                <AlertTriangle className="w-9 h-9" />
              </div>
            ) : isFull ? (
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 animate-in zoom-in-75 duration-200">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 animate-in zoom-in-75 duration-200">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            )}

            <div className="mb-2">
              {isCancelled ? (
                <Badge tone="danger">Undangan Dibatalkan</Badge>
              ) : wasAlreadyFull ? (
                <Badge tone="danger">✗ Kuota Sudah Penuh — Ditolak</Badge>
              ) : isFull ? (
                <Badge tone="success">✓ Tiket Terverifikasi & Hadir</Badge>
              ) : (
                <Badge tone="gold">✓ Check-in Sebagian</Badge>
              )}
            </div>

            <h3 className="text-xl font-bold mt-2 text-foreground leading-snug">
              {item.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {item.category === "SMP" ? (item.principal ? `${item.principal} · Kepala Sekolah` : "Kepala Sekolah") : item.institution || "Tamu Undangan"}
            </p>

            {/* Grid Informasi Tamu */}
            <div className="grid grid-cols-2 gap-2 mt-4 p-3.5 bg-muted/40 border border-border/80 rounded-xl text-left text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px]">Kode Tiket</span>
                <span className="font-mono font-bold text-foreground text-xs">{item.code}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Kategori</span>
                <span className="font-semibold text-primary">{item.category}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Total Kuota Undangan</span>
                <span className="font-bold text-foreground">{item.quota} Orang</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">Area / No. Kursi</span>
                <span className="font-bold text-foreground">{item.seat || "Bebas"}</span>
              </div>
              {item.category === "SMP" && (
                <div className="col-span-2 border-t border-border/40 pt-1.5 mt-1 flex justify-between items-center">
                  <span className="text-muted-foreground text-[11px]">Nama Anggota Terdaftar:</span>
                  <span className="font-medium text-foreground text-xs">
                    {item.members.length > 0
                      ? `${item.members.length} dari ${item.quota} nama terdaftar`
                      : `Belum diinput (0 dari ${item.quota})`}
                  </span>
                </div>
              )}
              <div className="col-span-2 border-t border-border/40 pt-1.5 mt-1 flex justify-between items-center">
                <span className="text-muted-foreground text-[11px]">Status Kehadiran:</span>
                <span className={`font-bold text-sm ${isDenied ? "text-destructive" : "text-emerald-400"}`}>
                  {item.checked} / {item.quota} Tamu Hadir
                  {wasAlreadyFull && " (Penuh)"}
                </span>
              </div>
            </div>

            {wasAlreadyFull && !isCancelled && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                Tamu ini sudah check-in sebelumnya. Kuota undangan telah terisi penuh.
              </div>
            )}

            {item.seat && !isDenied && (
              <div className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                Arahkan tamu ke area duduk: <strong>{item.seat}</strong>
              </div>
            )}

            <Button
              type="button"
              size="lg"
              className="w-full mt-6 py-6 text-base font-semibold shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
              onClick={onContinueScan}
              autoFocus
            >
              <ClipboardCheck className="w-5 h-5" />
              Lanjut Periksa Tiket Lain
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function CheckInPanel({
  id,
  onContinueScan,
}: {
  id: string;
  onContinueScan?: () => void;
}) {
  const { data, checkIn } = useSambut();
  const item = data.invitations.find((i) => i.id === id);

  const [partyCount, setPartyCount] = useState<number>(() => item?.checked || 1);
  const [attendeeNames, setAttendeeNames] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setPartyCount(item.checked || 1);
    }
  }, [item?.id, item?.checked]);

  if (!item) {
    return (
      <div className="scan-info text-center py-6">
        <Empty title="Undangan tidak ditemukan" text="Kode tiket tidak terdaftar pada sistem database." />
        {onContinueScan && (
          <Button size="lg" className="mt-6 w-full py-6 text-base" onClick={onContinueScan}>
            <Ticket className="mr-2 h-5 w-5" />
            Periksa Tiket Lain
          </Button>
        )}
      </div>
    );
  }

  const isFull = item.checked >= item.quota;
  const isCancelled = item.cancelled;

  async function handleUpdateAttendance() {
    setSaving(true);
    try {
      const names = attendeeNames
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const ok = await checkIn(item.id, [], partyCount, names.length ? names : undefined);
      if (ok) {
        toast.success(`Kehadiran ${partyCount} orang berhasil diperbarui di database!`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="scan-info">
      <div className="flex items-center gap-2 mb-3">
        {isCancelled ? (
          <Badge tone="danger">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Undangan Dibatalkan
          </Badge>
        ) : isFull ? (
          <Badge tone="success">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Check-in Lengkap ({item.checked}/{item.quota})
          </Badge>
        ) : (
          <Badge tone="gold">
            <UserCheck className="w-3.5 h-3.5 mr-1" />
            Check-in Sebagian ({item.checked}/{item.quota})
          </Badge>
        )}
        <RsvpBadge value={item.rsvp} />
      </div>

      <h2 className="text-2xl font-bold leading-tight">{item.name}</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        {item.category === "SMP" ? (item.principal ? `${item.principal} · Kepala Sekolah` : "Kepala Sekolah") : item.institution || "Tamu Undangan"}
        <br />
        <span className="font-mono text-xs bg-muted/60 px-1.5 py-0.5 rounded text-foreground font-semibold">
          {item.code}
        </span>{" "}
        · <span className="text-primary font-medium">{item.category}</span>
      </p>

      {item.note && (
        <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-foreground italic flex items-start gap-2">
          <Quote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>&ldquo;{item.note}&rdquo;</span>
        </div>
      )}

      <div className="scan-summary mt-4">
        <div>
          <small>Total Kuota</small>
          <strong>{item.quota} Tamu</strong>
        </div>
        <div>
          <small>Jumlah Hadir</small>
          <strong className={item.checked > 0 ? "text-emerald-500 font-bold" : ""}>
            {item.checked} Orang
          </strong>
        </div>
        <div>
          <small>Area / Kursi</small>
          <strong className="text-primary">{item.seat || "Bebas"}</strong>
        </div>
      </div>

      {item.category === "SMP" && (
        <p className="text-xs text-muted-foreground mt-3 bg-muted/40 p-2.5 rounded-lg border border-border/60">
          Nama anggota diinput: <strong className="text-foreground">{item.members.length > 0 ? `${item.members.length} dari ${item.quota} nama` : "Belum ada nama siswa/guru diinput"}</strong>
        </p>
      )}

      {/* ── Form Update Jumlah Rombongan & Hadir (Hari-H) ── */}
      {!isCancelled && (
        <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3 text-left">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Users className="w-4 h-4" />
            <span>Update Jumlah Hadir & Rombongan</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Sesuaikan jumlah tamu dalam rombongan yang hadir saat tiba di lokasi.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block mb-1 font-medium text-foreground">Jumlah Orang Hadir</label>
              <input
                type="number"
                min={1}
                max={50}
                value={partyCount}
                onChange={(e) => setPartyCount(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-foreground">Nama Anggota (opsional, koma)</label>
              <input
                type="text"
                placeholder="cth: Budi, Ani, Cici"
                value={attendeeNames}
                onChange={(e) => setAttendeeNames(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
              />
            </div>
          </div>
          <Button
            size="sm"
            className="w-full"
            disabled={saving}
            onClick={handleUpdateAttendance}
          >
            {saving ? "Menyimpan ke Database..." : "Simpan Perubahan Kehadiran"}
          </Button>
        </div>
      )}

      {isCancelled ? (
        <div className="border border-destructive/40 bg-destructive/10 rounded-xl p-4 mt-4 text-center">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-2" />
          <h3 className="font-semibold text-destructive text-base">Undangan Tidak Berlaku</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Status undangan telah dibatalkan oleh panitia penyelenggara.
          </p>
        </div>
      ) : (
        <div className="border border-emerald-500/30 bg-emerald-950/20 rounded-xl p-4 mt-4 text-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <h3 className="font-bold text-emerald-400 text-base">
            ✓ Tiket Terverifikasi & Terkonfirmasi
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kehadiran ({item.checked} orang) telah tercatat di database.
          </p>
          {item.seat && (
            <div className="inline-block mt-2.5 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
              Silakan arahkan tamu menuju area duduk: <strong>{item.seat}</strong>
            </div>
          )}
        </div>
      )}

      {onContinueScan && (
        <Button
          type="button"
          size="lg"
          className="w-full mt-4 py-6 text-base font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          onClick={onContinueScan}
        >
          <ClipboardCheck className="w-5 h-5" />
          Periksa Tiket Lain
        </Button>
      )}
    </div>
  );
}

export function ScannerPage({ initialCode }: { initialCode?: string }) {
  const { data, checkIn } = useSambut();
  const [code, setCode] = useState(initialCode || "");
  const [id, setId] = useState(
    () => data.invitations.find((i) => i.code === initialCode)?.id || "",
  );
  const [alertItem, setAlertItem] = useState<Invitation | null>(null);
  const [alertWasAlreadyFull, setAlertWasAlreadyFull] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function performAutoCheckIn(item: Invitation): Promise<{ result: Invitation; wasAlreadyFull: boolean }> {
    if (item.cancelled) {
      toast.error(`Undangan ${item.name} dibatalkan`);
      return { result: item, wasAlreadyFull: false };
    }

    const remaining = item.quota - item.checked;
    if (remaining > 0) {
      const unpresent = (item.members || []).filter((m) => !m.present).map((m) => m.id);
      const countToCheckIn =
        item.category === "SMP"
          ? unpresent.length > 0
            ? unpresent.length
            : 1
          : 1;

      const success = await checkIn(item.id, unpresent, countToCheckIn);
      if (success) {
        toast.success(`Check-in berhasil: ${item.name} (${countToCheckIn} tamu)`);
        const updatedMembers = (item.members || []).map((m) =>
          unpresent.includes(m.id) ? { ...m, present: true } : m,
        );
        return {
          result: {
            ...item,
            checked: item.checked + countToCheckIn,
            members: updatedMembers,
          },
          wasAlreadyFull: false,
        };
      }
      return { result: item, wasAlreadyFull: false };
    } else {
      playScanBeep();
      toast.info(`${item.name} sudah check-in lengkap sebelumnya (${item.checked}/${item.quota})`);
      return { result: item, wasAlreadyFull: true };
    }
  }

  async function lookup(value: string) {
    let normalized = "";
    try {
      normalized = decodeURIComponent(value.split("/").pop() || value)
        .toUpperCase()
        .trim();
    } catch {
      setId("");
      setAlertItem(null);
      setError("Format kode tiket tidak valid.");
      return;
    }

    if (!normalized) {
      setError("Silakan masukkan kode tiket.");
      return;
    }

    setLoading(true);
    let item = data.invitations.find((i) => i.code.toUpperCase() === normalized);
    if (!item) {
      // Try to check in or verify via API directly if not found in local cache
      try {
        const { getPublicInvitationApi } = await import("@/lib/sambut/api");
        const res = await getPublicInvitationApi(normalized);
        if (res.data) {
          item = res.data;
        }
      } catch {}
    }

    setLoading(false);

    if (!item) {
      setId("");
      setAlertItem(null);
      setError("Kode tiket tidak ditemukan di database.");
      toast.error("Kode tiket tidak ditemukan di database.");
      return;
    }

    // Suara beep konfirmasi
    playScanBeep();

    // Otomatis check-in
    const { result: checkedItem, wasAlreadyFull } = await performAutoCheckIn(item);

    // Buka pop-up alert konfirmasi
    setId(item.id);
    setAlertItem(checkedItem);
    setAlertWasAlreadyFull(wasAlreadyFull);
    setError("");
    setCode(item.code);
    setHistory((h) =>
      [`${item.name} (${item.code}) · ${new Date().toLocaleTimeString("id-ID")}`, ...h].slice(0, 8),
    );
  }

  useEffect(() => {
    if (initialCode && data.invitations.length > 0 && !id) {
      lookup(initialCode);
    }
  }, [initialCode, data.invitations]);

  function handleContinueScan() {
    setAlertItem(null);
    setAlertWasAlreadyFull(false);
    setCode("");
    setError("");
  }

  return (
    <AdminLayout>
      {/* Pop-up Alert Modal Hasil Verifikasi */}
      {alertItem && (
        <ScanAlertModal item={alertItem} wasAlreadyFull={alertWasAlreadyFull} onContinueScan={handleContinueScan} />
      )}

      <div className="admin-title-row">
        <div>
          <div className="admin-greeting">SAMBUT SETIAP KEHADIRAN</div>
          <h1>{initialCode ? "Konfirmasi Check-in" : "Verifikasi Tiket Tamu"}</h1>
          <p>Masukkan kode tiket tamu untuk memverifikasi dan mencatat kehadiran secara langsung.</p>
        </div>
        <Badge tone="success">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          Sistem Presensi Aktif
        </Badge>
      </div>

      <div className="scanner-grid">
        <section className="admin-panel">
          <div className="panel-header">
            <div>
              <h2>Verifikasi Kode Tiket</h2>
              <p>Ketik 5 karakter unik tiket lalu tekan Enter atau Verifikasi</p>
            </div>
            <Ticket size={20} className="text-primary" />
          </div>

          <div className="manual-scan" style={{ marginTop: "12px", border: "none", padding: "0" }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                lookup(code);
              }}
              className="flex flex-col gap-3"
            >
              <div className="relative">
                <input
                  aria-label="Kode tiket manual"
                  className="control font-mono uppercase tracking-widest text-lg font-bold w-full py-4 px-4 text-center"
                  value={code}
                  required
                  maxLength={10}
                  autoFocus
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    if (error) setError("");
                  }}
                  placeholder="CONTOH: K9X2B"
                />
              </div>
              <Button type="submit" size="lg" className="w-full py-6 text-base font-semibold" disabled={loading}>
                {loading ? "Memeriksa Database..." : (
                  <>
                    <ClipboardCheck className="mr-2 h-5 w-5" />
                    Verifikasi & Check-in
                  </>
                )}
              </Button>
            </form>
            {error && <p className="text-destructive text-sm mt-3 font-medium text-center">{error}</p>}
          </div>

          {history.length > 0 && (
            <div className="panel-content mt-6 pt-5 border-t border-border/70">
              <h3 className="text-xs mb-3 font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Verifikasi Terakhir
              </h3>
              <div className="space-y-1.5">
                {history.map((h, i) => (
                  <div className="p-2 rounded-lg bg-muted/40 text-foreground/90 font-mono text-xs flex items-center justify-between" key={i}>
                    <span>✓ {h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="admin-panel">
          <div className="panel-header">
            <h2>Detail Tamu & Kehadiran</h2>
            <Badge tone={id ? "success" : "muted"}>
              {id ? "Terkonfirmasi" : "Menunggu input kode"}
            </Badge>
          </div>

          {id ? (
            <CheckInPanel id={id} onContinueScan={handleContinueScan} />
          ) : (
            <Empty
              title="Tiket siapa yang kita sambut?"
              text="Masukkan kode tiket 5 karakter di sebelah kiri untuk menampilkan detail tamu dan memverifikasi kehadiran."
            />
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
