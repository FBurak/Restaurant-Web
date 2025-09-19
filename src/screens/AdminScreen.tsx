/* ---------------- Admin Screen ---------------- */

import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { signOut, type User } from "firebase/auth";
import {
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  addDoc,
  query,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Save,
  X,
  Link2,
  LogOut,
  Trash2,
  Plus,
  ArrowLeft,
  Play,
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Video,
} from "lucide-react";
import {
  type SocialKey,
  type Socials,
  type Restaurant,
  type GalleryItem,
  type PasswordItem,
  REST_ID,
} from "../types";
import {
  fileNameFromUrl,
  ensureRestaurantDoc,
  uploadAndGetUrl,
} from "../utils/helpers";
import {
  Section,
  Uploader,
  NavItem,
  Tab,
  RestaurantDropdown,
} from "../components/UI";
import { ConfirmModal, DiscardModal, ResultPopup } from "../components/Modals";

export default function AdminScreen({ user }: { user: User }) {
  const [res, setRes] = useState<Restaurant>({});
  const [about, setAbout] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [socials, setSocials] = useState<Socials>({});
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [pwds, setPwds] = useState<PasswordItem[]>([]);
  const [dirty, setDirty] = useState(false);
  const [discardModal, setDiscardModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [resultModal, setResultModal] = useState<null | "deleted" | "saved">(
    null
  );

  useEffect(() => {
    void ensureRestaurantDoc();
  }, []);

  useEffect(() => {
    const u1 = onSnapshot(doc(db, "restaurants", REST_ID), (d) => {
      const v = (d.data() as Restaurant) || {};
      setRes(v);
      setAbout(v.aboutHtml || "");
      setVideoUrl(v.videoUrl || "");
      setGoogleUrl(v.googleBusinessUrl || "");
      setSocials(v.socials || {});
      setDirty(false);
    });

    const u2 = onSnapshot(
      query(
        collection(db, "restaurants", REST_ID, "gallery"),
        orderBy("sortOrder", "asc")
      ),
      (s) =>
        setGallery(
          s.docs.map((d) => {
            const data = d.data() as { url?: string; sortOrder?: number };
            return {
              id: d.id,
              url: data.url ?? "",
              sortOrder: data.sortOrder ?? 0,
            };
          })
        )
    );

    const u3 = onSnapshot(
      query(
        collection(db, "restaurants", REST_ID, "passwords"),
        orderBy("sortOrder", "asc")
      ),
      (s) =>
        setPwds(
          s.docs.map((d) => {
            const data = d.data() as {
              title?: string;
              value?: string;
              hidden?: boolean;
              sortOrder?: number;
            };
            return {
              id: d.id,
              title: data.title ?? "",
              value: data.value ?? "",
              hidden: Boolean(data.hidden),
              sortOrder: data.sortOrder ?? 0,
            };
          })
        )
    );

    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  useEffect(() => {
    setDirty(true);
  }, [about, videoUrl, googleUrl, socials]);

  const saveAll = async () => {
    await setDoc(
      doc(db, "restaurants", REST_ID),
      {
        name: res?.name ?? "Kaffeewerk",
        aboutHtml: about,
        googleBusinessUrl: googleUrl || null,
        videoUrl: videoUrl || null,
        socials,
        isVisible: res?.isVisible ?? true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    setDirty(false);
    setResultModal("saved");
  };

  const discard = () => {
    setAbout(res?.aboutHtml || "");
    setVideoUrl(res?.videoUrl || "");
    setGoogleUrl(res?.googleBusinessUrl || "");
    setSocials(res?.socials || {});
    setDirty(false);
  };

  const uploadHeader = async (file: File) => {
    try {
      toast.loading("Uploading header…");
      const path = `uploads/${REST_ID}/header_${Date.now()}_${file.name}`;      // 1) nereye yüklenecek
      const url = await uploadAndGetUrl(path, file);              // 2) Storage'a yükle + download URL al
      await setDoc(                                                 // 3) URL'i Firestore'a yaz
        doc(db, "restaurants", REST_ID),
        { headerImageUrl: url, updatedAt: serverTimestamp() },
        { merge: true }
      );
      toast.success("Header uploaded");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Header upload failed";
      toast.error(msg);
    }
  };

  const clearHeader = async () => {
    try {
      await setDoc(
        doc(db, "restaurants", REST_ID),
        { headerImageUrl: null, updatedAt: serverTimestamp() },
        { merge: true }
      );
      toast.success("Header removed");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Header remove failed";
      toast.error(msg);
    }
  };

  const uploadGallery = async (file: File) => {
    try {
      toast.loading("Uploading image…");
      const path = `uploads/${REST_ID}/gallery_${Date.now()}_${file.name}`;
      const url = await uploadAndGetUrl(path, file);
      await addDoc(collection(db, "restaurants", REST_ID, "gallery"), {
        url,
        sortOrder: gallery.length,
        createdAt: serverTimestamp(),
      });
      toast.success("Image added");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Image upload failed";
      toast.error(msg);
    }
  };

  const removeGallery = (id: string) => {
    setDeleteModal(id);
  };

  const confirmDelete = async () => {
    if (deleteModal) {
      await deleteDoc(doc(db, "restaurants", REST_ID, "gallery", deleteModal));
      toast.success("Image deleted");
      setDeleteModal(null);
    }
  };

  const addPwd = () =>
    addDoc(collection(db, "restaurants", REST_ID, "passwords"), {
      title: "Wi-Fi Password",
      value: "00000000",
      hidden: false,
      sortOrder: pwds.length,
    }).then(() => toast("Password row added"));

  const toggleVisible = () =>
    updateDoc(doc(db, "restaurants", REST_ID), {
      isVisible: !(res?.isVisible ?? true),
    });

  const doLogout = async () => {
    await signOut(auth);
    toast("Signed out");
  };

  return (
    <div className="h-screen overflow-hidden bg-[#F5F7FA]">
      {/* TOP NAVBAR */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <RestaurantDropdown currentName="Kaffeewerk" />
        <button
          className="flex items-center gap-2 px-4 h-9 rounded-lg"
          style={{ background: "#EDF3F7", color: "#673CCB" }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="grid h-[calc(100vh-73px)] min-h-0 grid-cols-[280px_1fr]">
        {/* LEFT SIDEBAR */}
        <aside className="bg-white border-r border-gray-200 p-6 flex flex-col">
          <div className="space-y-2 mb-8">
            <NavItem active text="Profile" color="#673CCB" />
            <NavItem text="Settings" />
          </div>

          <div className="mt-auto flex flex-col items-center">
            {/* Log Out: gri pill */}
            <button
              onClick={doLogout}
              className="mx-auto w-fit flex items-center justify-center gap-2 px-5 h-10 rounded-lg mb-6"
              style={{ background: "#EDF3F7", color: "#1F2937" }}
            >
              <LogOut size={18} />
              <span className="font-semibold">Log Out</span>
            </button>

            <button
              onClick={() => {}}
              className="mt-2 flex items-center gap-2 text-[#DE4444] self-center"
            >
              <Trash2 size={18} />
              <span>Delete</span>
            </button>

            <p className="text-xs text-gray-400 px-1 mt-2 truncate">
              {user.email}
            </p>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT */}
        <main className="flex flex-col min-h-0">
          {/* TAB BAR */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex gap-2">
              <Tab color="#B18FFF">Restaurant</Tab>
              <Tab active color="#B18FFF">
                Web Site
              </Tab>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={saveAll}
                disabled={!dirty}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium ${
                  dirty
                    ? "bg-[#976BFE] text-white hover:bg-[#8a61e8]"
                    : "bg-gray-100 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Save size={16} />
                Save
              </button>
              <button
                onClick={() => setDiscardModal(true)}
                disabled={!dirty}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  dirty
                    ? "text-white hover:opacity-90"
                    : "text-white/70 cursor-not-allowed"
                }`}
                style={{ background: "#B6C0C6" }}
              >
                Discard
              </button>
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-8">
              <Section title="Header">
                {!res?.headerImageUrl ? (
                  <Uploader onFile={uploadHeader} />
                ) : (
                  <div className="h-16 flex items-center gap-3 px-3 rounded-lg border border-gray-200 bg-white">
                    <img
                      src={res.headerImageUrl}
                      alt="Header"
                      className="h-10 w-14 rounded-md object-cover"
                    />
                    <span className="text-sm text-gray-700 truncate flex-1">
                      {fileNameFromUrl(res.headerImageUrl)}
                    </span>
                    <button
                      onClick={clearHeader}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                      aria-label="Remove header image"
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </Section>

              <Section title="About Restaurant">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={about}
                    onChange={setAbout}
                    style={{ minHeight: "120px" }}
                  />
                </div>
              </Section>

              <Section title="Allow visibility">
                <div className="space-y-3">
                  <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    Fast service is our priority – powered by SERVICE-DING.de
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!(res?.isVisible ?? true)}
                      onChange={toggleVisible}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      Hide from website
                    </span>
                  </label>
                </div>
              </Section>

              {/* Google Reviews */}
              <Section title="Google Reviews">
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-[#F7FAFD]"
                  style={{ borderColor: "#E6EEF5" }}
                >
                  {/* Sol ikon: Google Business */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "#EAF2FF" }}
                  >
                    <span className="text-[#4285F4] text-lg">🏬</span>
                  </div>

                  {/* Input */}
                  <input
                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                    placeholder="Google My bussiness link"
                    value={googleUrl}
                    onChange={(e) => setGoogleUrl(e.target.value)}
                  />

                  {/* Sağ link ikonu (pasif gri) */}
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400">
                    <Link2 size={18} />
                  </div>
                </div>
              </Section>

              <Section title="Gallery">
                <Uploader onFile={uploadGallery} />
                <div className="mt-4 space-y-3">
                  {gallery.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white"
                    >
                      <img
                        src={g.url}
                        alt="Gallery"
                        className="w-16 h-12 object-cover rounded-md"
                      />
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {fileNameFromUrl(g.url)}
                      </span>
                      <button
                        onClick={() => removeGallery(g.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Passwords */}
              <Section title="Passwords">
                <div className="space-y-3">
                  {/* Başlık satırı */}
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-3 text-sm font-medium text-gray-600">
                    <div>Password Name</div>
                    <div>Password</div>
                    <div></div>
                  </div>

                  {/* Satırlar */}
                  {pwds.map((p) => {
                    const disabled = !!p.hidden;
                    const baseInput =
                      "px-4 h-11 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500";
                    const enabledCls = "border-gray-200 bg-white text-gray-900";
                    const disabledCls =
                      "border-gray-200 bg-[#EDF3F7] text-gray-400 cursor-not-allowed";

                    return (
                      <div
                        key={p.id}
                        className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center"
                      >
                        {/* Name */}
                        <input
                          disabled={disabled}
                          className={`${baseInput} ${
                            disabled ? disabledCls : enabledCls
                          }`}
                          defaultValue={p.title}
                          placeholder="Wi-Fi Password"
                          onBlur={(e) =>
                            updateDoc(
                              doc(
                                db,
                                "restaurants",
                                REST_ID,
                                "passwords",
                                p.id
                              ),
                              {
                                title: e.target.value,
                              }
                            )
                          }
                        />

                        {/* Password */}
                        <input
                          disabled={disabled}
                          className={`${baseInput} ${
                            disabled ? disabledCls : enabledCls
                          }`}
                          defaultValue={p.value}
                          placeholder="0000000"
                          onBlur={(e) =>
                            updateDoc(
                              doc(
                                db,
                                "restaurants",
                                REST_ID,
                                "passwords",
                                p.id
                              ),
                              {
                                value: e.target.value,
                              }
                            )
                          }
                        />

                        {/* Eye / EyeOff */}
                        <button
                          type="button"
                          onClick={() =>
                            updateDoc(
                              doc(
                                db,
                                "restaurants",
                                REST_ID,
                                "passwords",
                                p.id
                              ),
                              {
                                hidden: !p.hidden,
                              }
                            )
                          }
                          className={`w-11 h-11 rounded-lg flex items-center justify-center border ${
                            disabled
                              ? "bg-[#EDF3F7] border-gray-200"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                          title={disabled ? "Show" : "Hide"}
                        >
                          {disabled ? (
                            <EyeOff size={18} className="text-gray-500" />
                          ) : (
                            <Eye size={18} className="text-gray-700" />
                          )}
                        </button>
                      </div>
                    );
                  })}

                  {/* Add row */}
                  <button
                    onClick={addPwd}
                    type="button"
                    className="flex items-center gap-2 text-[#673CCB] hover:underline"
                  >
                    <Plus size={18} /> Add Another Password
                  </button>
                </div>
              </Section>

              <Section
                title="Video Link"
                icon={<Video size={16} className="text-red-500" />}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-8 bg-red-100 rounded-md flex items-center justify-center">
                    <Play size={14} className="text-red-600" />
                  </div>
                  <input
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://www.youtube.com/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <button
                    onClick={() => setVideoUrl("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </Section>

              <Section title="Social Media Account">
                <div className="space-y-3">
                  {[
                    {
                      key: "instagram" as SocialKey,
                      icon: Instagram,
                      color: "#E4405F",
                      label: "Instagram",
                    },
                    {
                      key: "youtube" as SocialKey,
                      icon: Youtube,
                      color: "#FF0000",
                      label: "Youtube",
                    },
                    {
                      key: "tiktok" as SocialKey,
                      icon: Video,
                      color: "#000000",
                      label: "Tiktok",
                    },
                    {
                      key: "facebook" as SocialKey,
                      icon: Facebook,
                      color: "#1877F2",
                      label: "Facebook",
                    },
                    {
                      key: "linkedin" as SocialKey,
                      icon: Linkedin,
                      color: "#0A66C2",
                      label: "Linkedin",
                    },
                  ].map(({ key, icon: Icon, color, label }) => (
                    <div key={key} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon size={16} style={{ color }} />
                      </div>
                      <input
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder={`${label} link insert`}
                        value={socials[key] || ""}
                        onChange={(e) =>
                          setSocials((s) => ({ ...s, [key]: e.target.value }))
                        }
                      />
                      <button
                        onClick={() => setSocials((s) => ({ ...s, [key]: "" }))}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          </div>
        </main>
      </div>

      {/* MODALS */}
      <DiscardModal
        open={discardModal}
        onClose={() => setDiscardModal(false)}
        onDelete={() => {
          discard();
          setDiscardModal(false);
          setResultModal("deleted");
        }}
        onKeep={async () => {
          await saveAll();
          setDiscardModal(false);
          setResultModal("saved");
        }}
      />
      <ConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={confirmDelete}
        title="Changes deleted"
        message=""
        type="danger"
      />

      <ResultPopup kind={resultModal} onClose={() => setResultModal(null)} />
    </div>
  );
}
