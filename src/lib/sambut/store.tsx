import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  getInvitationsApi,
  getSettingsApi,
  getActivitiesApi,
  getMessagesApi,
  createInvitationApi,
  updateInvitationApi,
  deleteInvitationApi,
  checkInApi,
  publicRegisterApi,
  updateSettingsApi,
  addMessageApi,
  resetSimulationApi,
} from "./api";

export type Category = "SMP" | "Guru" | "VIP" | "Orang Tua/Wali" | "Umum";
export type Rsvp = "Pending" | "Hadir" | "Tidak Hadir";
export type Member = { id: string; name: string; role: string; present: boolean };
export type Invitation = {
  id: string;
  code: string;
  name: string;
  category: Category;
  institution: string;
  principal: string;
  pic: string;
  phone: string;
  quota: number;
  seat: string;
  rsvp: Rsvp;
  checked: number;
  members: Member[];
  mou: string;
  note: string;
  student: string;
  title: string;
  relationship: string;
  vipLevel: string;
  cancelled: boolean;
  mouDate: string;
  signer: string;
};
export type Settings = {
  name: string;
  school: string;
  date: string;
  location: string;
  tagline: string;
  contact: string;
  groupPhoto: string;
};
export type Activity = { text: string; time: string };
export type Message = { name: string; text: string; category: string };
export type Data = {
  invitations: Invitation[];
  settings: Settings;
  activities: Activity[];
  messages: Message[];
};
export const categories: Category[] = ["SMP", "Guru", "VIP", "Orang Tua/Wali", "Umum"];
export const mouStatuses = [
  "Belum dijadwalkan",
  "Menunggu tanda tangan",
  "Sudah ditandatangani",
  "Perlu tindak lanjut",
];

export function blankInvitation(): Invitation {
  return {
    id: "",
    code: "",
    name: "",
    category: "SMP",
    institution: "",
    principal: "",
    pic: "",
    phone: "",
    quota: 10,
    seat: "",
    rsvp: "Pending",
    checked: 0,
    members: [],
    mou: mouStatuses[0] ?? "Belum dijadwalkan",
    note: "",
    student: "",
    title: "",
    relationship: "Ayah",
    vipLevel: "VIP",
    cancelled: false,
    mouDate: "",
    signer: "",
  };
}

export function blankData(): Data {
  return {
    invitations: [],
    settings: {
      name: "Christmas Celebration 2026",
      school: "Panitia Natal 2026",
      date: "",
      location: "",
      tagline: "Merajut Kasih, Berbagi Damai & Sukacita Natal",
      contact: "",
      groupPhoto: "",
    },
    activities: [],
    messages: [],
  };
}

export function stats(rows: Invitation[]) {
  return {
    total: rows.length,
    schools: rows.filter((i) => i.category === "SMP").length,
    quota: rows.reduce((s, i) => s + i.quota, 0),
    registered: rows.reduce((s, i) => s + (i.category === "SMP" ? i.members.length : i.quota), 0),
    yes: rows.filter((i) => i.rsvp === "Hadir").length,
    no: rows.filter((i) => i.rsvp === "Tidak Hadir").length,
    pending: rows.filter((i) => i.rsvp === "Pending").length,
    checked: rows.reduce((s, i) => s + i.checked, 0),
  };
}

const StoreContext = createContext<null | {
  data: Data;
  ready: boolean;
  loggedIn: boolean;
  connectedToDb: boolean;
  login: () => void;
  logout: () => void;
  save: (item: Invitation) => Promise<void>;
  registerPublicTicket: (payload: {
    name: string;
    affiliation: string;
    category?: string;
    message: string;
    phone?: string;
  }) => Promise<Invitation>;
  remove: (id: string) => Promise<void>;
  checkIn: (
    idOrCode: string,
    memberIds?: string[],
    count?: number,
    attendees?: string[] | string,
  ) => Promise<boolean>;
  updateSettings: (s: Settings) => Promise<void>;
  addMessage: (m: Message) => Promise<void>;
  reset: () => Promise<void>;
  refresh: () => Promise<void>;
}>(null);

export function SambutProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(blankData);
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [connectedToDb, setConnectedToDb] = useState(false);

  // Clear obsolete demo cache from localStorage once
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const migrated = localStorage.getItem("sambut-db-connected");
        if (!migrated) {
          localStorage.removeItem("sambut-demo-v1");
          localStorage.setItem("sambut-db-connected", "true");
        }
      }
    } catch {}
  }, []);

  const loadData = async () => {
    try {
      const [invRes, setRes, actRes, msgRes] = await Promise.all([
        getInvitationsApi(),
        getSettingsApi(),
        getActivitiesApi(),
        getMessagesApi(),
      ]);

      if (invRes.success && setRes.success) {
        setData({
          invitations: (invRes.data || []).map((inv) => ({
            ...inv,
            members: inv.members || [],
            mouDate: inv.mouDate ?? (inv as any).mou_date ?? "",
            vipLevel: inv.vipLevel ?? (inv as any).vip_level ?? "VIP",
          })),
          settings: setRes.data || blankData().settings,
          activities: actRes.data || [],
          messages: msgRes.data || [],
        });
        setConnectedToDb(true);
      }
    } catch (err) {
      console.warn("Backend API tidak dapat dijangkau, menggunakan data lokal:", err);
      setConnectedToDb(false);
      try {
        const raw = localStorage.getItem("sambut-clean-v2");
        if (raw) setData(JSON.parse(raw));
      } catch {}
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    setLoggedIn(sessionStorage.getItem("sambut-admin") === "yes");
    loadData();
  }, []);

  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("sambut-clean-v2", JSON.stringify(data));
      } catch {}
    }
  }, [data, ready]);

  function activity(d: Data, text: string) {
    return [
      {
        text,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      },
      ...d.activities,
    ].slice(0, 30);
  }

  const save = async (item: Invitation) => {
    if (
      !Number.isInteger(item.quota) ||
      item.quota < 1 ||
      item.checked > item.quota ||
      item.members.length > item.quota ||
      (item.category === "SMP" && (item.quota > 10 || !item.principal.trim()))
    ) {
      toast.error("Nama kepala sekolah wajib dan kuota maksimal 10.");
      return;
    }

    const isExisting = data.invitations.some(
      (i) => (item.id && i.id === item.id) || (item.code && i.code === item.code),
    );

    // Optimistic local state update
    setData((d) => ({
      ...d,
      invitations: isExisting
        ? d.invitations.map((i) => (i.id === item.id ? item : i))
        : [item, ...d.invitations],
      activities: activity(d, `Undangan ${item.name} diperbarui`),
    }));

    try {
      if (isExisting) {
        const res = await updateInvitationApi(item.id, item);
        if (res.data) {
          setData((d) => ({
            ...d,
            invitations: d.invitations.map((i) => (i.id === res.data.id ? { ...res.data, members: res.data.members || [] } : i)),
          }));
        }
      } else {
        const res = await createInvitationApi(item);
        if (res.data) {
          setData((d) => ({
            ...d,
            invitations: d.invitations.map((i) => (i.id === item.id ? { ...res.data, members: res.data.members || [] } : i)),
          }));
        }
      }
      toast.success(`Undangan ${item.name} berhasil disimpan`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Gagal menyimpan ke server backend.");
    }
  };

  const registerPublicTicket = async (payload: {
    name: string;
    affiliation: string;
    category?: string;
    message: string;
    phone?: string;
  }): Promise<Invitation> => {
    try {
      const res = await publicRegisterApi(payload);
      if (res.data) {
        const item: Invitation = {
          ...res.data,
          members: res.data.members || [],
          mouDate: res.data.mouDate ?? (res.data as any).mou_date ?? "",
          vipLevel: res.data.vipLevel ?? (res.data as any).vip_level ?? "VIP",
        };
        setData((d) => ({
          ...d,
          invitations: [item, ...d.invitations.filter((i) => i.id !== item.id && i.code !== item.code)],
          messages: [
            { name: payload.name, text: payload.message, category: payload.affiliation },
            ...d.messages,
          ],
          activities: activity(d, `${item.name} (${payload.affiliation}) mendaftar tiket (${item.code})`),
        }));
        toast.success(`Tiket berhasil dibuat untuk ${item.name}!`);
        return item;
      }
      throw new Error(res.message || "Gagal membuat tiket");
    } catch (e: any) {
      console.warn("Backend registration failed, using offline fallback:", e?.message);
      // Fallback offline generator
      const code = Math.random().toString(36).substring(2, 7).toUpperCase();
      const localItem: Invitation = {
        ...blankInvitation(),
        id: crypto.randomUUID(),
        code,
        name: payload.name,
        institution: payload.affiliation,
        category: (payload.category as Category) || "Orang Tua/Wali",
        phone: payload.phone || "-",
        quota: 1,
        checked: 0,
        rsvp: "Hadir",
        note: payload.message,
      };
      setData((d) => ({
        ...d,
        invitations: [localItem, ...d.invitations],
        messages: [
          { name: payload.name, text: payload.message, category: payload.affiliation },
          ...d.messages,
        ],
        activities: activity(d, `${localItem.name} mendaftar tiket (${code})`),
      }));
      toast.success(`Tiket berhasil dibuat untuk ${localItem.name}!`);
      return localItem;
    }
  };

  const remove = async (id: string) => {
    setData((d) => ({
      ...d,
      invitations: d.invitations.filter((i) => i.id !== id),
      activities: activity(d, "Undangan dihapus"),
    }));

    try {
      await deleteInvitationApi(id);
      toast.success("Undangan berhasil dihapus");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Gagal menghapus dari server backend.");
    }
  };

  const checkIn = async (
    idOrCode: string,
    memberIds?: string[],
    count?: number,
    attendees?: string[] | string,
  ): Promise<boolean> => {
    const normalizedInput = idOrCode.trim();
    let item = data.invitations.find(
      (i) => i.id === normalizedInput || i.code.toUpperCase() === normalizedInput.toUpperCase(),
    );

    // Parse attendee names if provided
    let attendeeNames: string[] = [];
    if (attendees) {
      if (Array.isArray(attendees)) {
        attendeeNames = attendees.map((s) => s.trim()).filter(Boolean);
      } else if (typeof attendees === "string") {
        attendeeNames = attendees.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
      }
    }

    const partyCount = count ?? (attendeeNames.length > 0 ? attendeeNames.length : (item?.checked || 1));
    const effectiveCount = Math.max(partyCount, 1);

    if (!item) {
      // Fallback: try direct backend check-in API in case local invitations are not yet loaded
      try {
        const res = await checkInApi({
          code: normalizedInput.toUpperCase(),
          member_ids: memberIds,
          count: effectiveCount,
          attendees: attendeeNames.length > 0 ? attendeeNames : undefined,
        });
        if (res.data) {
          const newItem: Invitation = {
            ...res.data,
            members: res.data.members || [],
            mouDate: res.data.mouDate ?? (res.data as any).mou_date ?? "",
            vipLevel: res.data.vipLevel ?? (res.data as any).vip_level ?? "VIP",
          };
          setData((d) => ({
            ...d,
            invitations: [newItem, ...d.invitations.filter((i) => i.id !== newItem.id && i.code !== newItem.code)],
            activities: activity(d, `${newItem.name} · ${effectiveCount} tamu berhasil check-in`),
          }));
          toast.success(`Check-in berhasil: ${effectiveCount} tamu tercatat di database`);
          return true;
        }
      } catch (err: any) {
        toast.error(err?.message || "Kode tiket tidak ditemukan di database.");
        return false;
      }
      return false;
    }

    if (item.cancelled) {
      toast.error("Undangan tidak valid atau telah dibatalkan.");
      return false;
    }

    // Build local members
    let updatedMembers = [...(item.members || [])];
    if (attendeeNames.length > 0) {
      attendeeNames.forEach((attName) => {
        const exist = updatedMembers.find((m) => m.name.toLowerCase() === attName.toLowerCase());
        if (exist) {
          exist.present = true;
        } else {
          updatedMembers.push({
            id: crypto.randomUUID(),
            name: attName,
            role: "Tamu",
            present: true,
          });
        }
      });
    }

    if (memberIds && memberIds.length > 0) {
      updatedMembers = updatedMembers.map((m) =>
        memberIds.includes(m.id) ? { ...m, present: true } : m,
      );
    }

    const updatedItem: Invitation = {
      ...item,
      checked: effectiveCount,
      quota: Math.max(item.quota, effectiveCount),
      rsvp: "Hadir",
      members: updatedMembers,
    };

    setData((d) => ({
      ...d,
      invitations: d.invitations.map((i) => (i.id === item.id ? updatedItem : i)),
      activities: activity(d, `${item.name} · ${effectiveCount} tamu berhasil check-in`),
    }));

    // Sync to backend Laravel MySQL
    try {
      const res = await checkInApi({
        id: item.id,
        code: item.code,
        member_ids: memberIds,
        count: effectiveCount,
        attendees: attendeeNames.length > 0 ? attendeeNames : undefined,
      });
      if (res.data) {
        setData((d) => ({
          ...d,
          invitations: d.invitations.map((i) =>
            i.id === res.data.id ? { ...res.data, members: res.data.members || [] } : i,
          ),
        }));
      }
    } catch (err: any) {
      console.warn("CheckIn API sync error (state preserved):", err?.message);
    }

    toast.success(`Check-in berhasil: ${effectiveCount} tamu tercatat di database`);
    return true;
  };

  const updateSettings = async (settings: Settings) => {
    setData((d) => ({ ...d, settings }));
    try {
      await updateSettingsApi(settings);
      toast.success("Pengaturan berhasil disimpan ke database");
    } catch (e: any) {
      toast.error(e.message || "Gagal menyimpan pengaturan ke database");
    }
  };

  const addMessage = async (m: Message) => {
    setData((d) => ({ ...d, messages: [m, ...d.messages] }));
    try {
      await addMessageApi(m);
    } catch (e) {
      console.error("Gagal menyimpan pesan ke database", e);
    }
  };

  const reset = async () => {
    try {
      await resetSimulationApi();
      await loadData();
      toast.success("Data berhasil direset dari database");
    } catch {
      setData(blankData());
    }
  };

  return (
    <StoreContext.Provider
      value={{
        data,
        ready,
        loggedIn,
        connectedToDb,
        login: () => {
          sessionStorage.setItem("sambut-admin", "yes");
          setLoggedIn(true);
        },
        logout: () => {
          sessionStorage.removeItem("sambut-admin");
          setLoggedIn(false);
        },
        save,
        registerPublicTicket,
        remove,
        checkIn,
        updateSettings,
        addMessage,
        reset,
        refresh: loadData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useSambut() {
  const c = useContext(StoreContext);
  if (!c) throw new Error("SambutProvider is missing");
  return c;
}

export function newInvitation(input: Invitation) {
  const token = crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();
  return {
    ...input,
    id: crypto.randomUUID(),
    code: `GCP-${input.category === "SMP" ? "SMP" : input.category === "Guru" ? "GR" : input.category === "VIP" ? "VIP" : "ORT"}-${token}`,
  };
}

export function attendanceLabel(i: Invitation) {
  return i.checked === 0
    ? "Belum check-in"
    : i.checked === i.quota
      ? "Hadir lengkap"
      : "Hadir sebagian";
}
