import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "./api";
import { Header } from "./components/Header";
import { ListingEditor } from "./components/ListingEditor";
import { ListingNav } from "./components/ListingNav";
import { SuggestionPanel } from "./components/SuggestionPanel";
import type { AgentRun, CostSummary, ListingFormData, ProductListing } from "./types";

const DEFAULT_FORM: ListingFormData = {
  title: "", shopifyProductId: "", handle: "", vendor: "",
  productType: "", currency: "USD", price: "", inventoryQuantity: "",
  tags: "", audience: "", description: "",
};

function listingToForm(listing: ProductListing): ListingFormData {
  return {
    title: listing.title ?? "",
    shopifyProductId: listing.shopifyProductId ?? "",
    handle: listing.handle ?? "",
    vendor: listing.vendor ?? "",
    productType: listing.productType ?? "",
    currency: listing.currency ?? "USD",
    price: listing.price != null ? String(listing.price) : "",
    inventoryQuantity: listing.inventoryQuantity != null ? String(listing.inventoryQuantity) : "",
    tags: (listing.tags ?? []).join(", "),
    audience: (listing.rawData?.audience as string) ?? "",
    description: listing.description ?? "",
  };
}

type Notice = { message: string; kind: "success" | "error" };

export default function App() {
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<ListingFormData>(DEFAULT_FORM);
  const [agentRun, setAgentRun] = useState<AgentRun | null>(null);
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedListing = listings.find((l) => l.id === selectedId) ?? null;

  function showNotice(message: string, kind: "success" | "error" = "success") {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice({ message, kind });
    noticeTimer.current = setTimeout(() => setNotice(null), 4000);
  }

  const isNewRef = useRef(isNew);
  const selectedIdRef = useRef(selectedId);
  useEffect(() => { isNewRef.current = isNew; }, [isNew]);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ls, cs] = await Promise.all([api.listings.list(), api.agentRuns.costSummary()]);
      setListings(ls);
      setCostSummary(cs);

      const currentIsNew = isNewRef.current;
      const currentSelectedId = selectedIdRef.current;

      if (!currentIsNew && currentSelectedId) {
        const still = ls.find((l) => l.id === currentSelectedId);
        if (still) setForm(listingToForm(still));
        else { setSelectedId(null); setForm(DEFAULT_FORM); }
      } else if (!currentIsNew && !currentSelectedId && ls.length > 0) {
        const first = ls[0];
        setSelectedId(first.id);
        setForm(listingToForm(first));
      }
    } catch (e) {
      showNotice((e as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadAgentRun(runId: string) {
    try {
      const run = await api.agentRuns.get(runId);
      setAgentRun(run);
    } catch {
      setAgentRun(null);
    }
  }

  function selectListing(id: string) {
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;
    setIsNew(false);
    setSelectedId(id);
    setForm(listingToForm(listing));

    const runId = listing.latestSuggestion?.agentRunId;
    if (runId) loadAgentRun(runId);
    else setAgentRun(null);
  }

  function startNew() {
    setIsNew(true);
    setSelectedId(null);
    setForm(DEFAULT_FORM);
    setAgentRun(null);
  }

  function handleChange(field: keyof ListingFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (isNew) {
        const created = await api.listings.create(form);
        setListings((prev) => [created, ...prev]);
        setIsNew(false);
        setSelectedId(created.id);
        setForm(listingToForm(created));
        showNotice("Listing created.");
      } else if (selectedId) {
        const updated = await api.listings.update(selectedId, form);
        setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        setForm(listingToForm(updated));
        showNotice("Listing saved.");
      }
      const cs = await api.agentRuns.costSummary();
      setCostSummary(cs);
    } catch (e) {
      showNotice((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setConfirmDelete(false);
    try {
      await api.listings.delete(selectedId);
      setListings((prev) => prev.filter((l) => l.id !== selectedId));
      setSelectedId(null);
      setIsNew(false);
      setForm(DEFAULT_FORM);
      setAgentRun(null);
      showNotice("Listing deleted.");
    } catch (e) {
      showNotice((e as Error).message, "error");
    }
  }

  async function handleOptimize() {
    if (!selectedId) return;
    setOptimizing(true);
    try {
      const run = await api.listings.optimize(selectedId);
      setAgentRun(run);
      const updated = await api.listings.get(selectedId);
      setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      const cs = await api.agentRuns.costSummary();
      setCostSummary(cs);
      showNotice("Optimization complete.");
    } catch (e) {
      showNotice((e as Error).message, "error");
    } finally {
      setOptimizing(false);
    }
  }

  async function handleImportCsv(csv: string) {
    try {
      const result = await api.listings.importCsv(csv);
      let msg = `Imported ${result.createdCount} new and ${result.updatedCount} updated ${result.format} listings.`;
      if (result.errorCount > 0) msg += ` ${result.errorCount} row errors.`;
      showNotice(msg);
      await loadAll();
    } catch (e) {
      showNotice((e as Error).message, "error");
    }
  }

  return (
    <div className="app">
      <Header
        selectedListing={selectedListing}
        isNew={isNew}
        optimizing={optimizing}
        onNew={startNew}
        onSave={handleSave}
        onOptimize={handleOptimize}
        onRefresh={loadAll}
      />

      <div className="notice-wrap">
        <AnimatePresence>
          {notice && (
            <motion.div
              key={notice.message}
              className={`notice${notice.kind === "error" ? " alert" : ""}`}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
            >
              {notice.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="spinner-wrap" style={{ flex: 1 }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className="app-body">
          <ListingNav
            listings={listings}
            selectedId={selectedId}
            costSummary={costSummary}
            onSelect={selectListing}
            onImportCsv={handleImportCsv}
          />
          <ListingEditor
            listing={selectedListing}
            isNew={isNew}
            form={form}
            saving={saving}
            confirmDelete={confirmDelete}
            onChange={handleChange}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancelDelete={() => setConfirmDelete(false)}
          />
          <SuggestionPanel
            suggestion={selectedListing?.latestSuggestion ?? null}
            agentRun={agentRun}
          />
        </div>
      )}
    </div>
  );
}
