import { Plus, RefreshCw, Save, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProductListingApi } from "./api/ProductListingApi";
import { CostSummaryPanel } from "./components/CostSummaryPanel";
import { ListingEditor } from "./components/ListingEditor";
import { ListingsPane } from "./components/ListingsPane";
import { SuggestionPanel } from "./components/SuggestionPanel";
import { ProductListingFormMapper, ProductListingFormState } from "./services/ProductListingFormMapper";
import { AgentRun, AgentRunCostSummary, ProductListing } from "./types";

const api = new ProductListingApi(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api");
const mapper = new ProductListingFormMapper();

export function App() {
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductListingFormState>(mapper.empty());
  const [agentRun, setAgentRun] = useState<AgentRun | null>(null);
  const [costSummary, setCostSummary] = useState<AgentRunCostSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedListing = useMemo(
    () => listings.find((listing) => listing.id === selectedId) ?? null,
    [listings, selectedId]
  );

  useEffect(() => {
    void loadListings();
    void loadCostSummary();
  }, []);

  useEffect(() => {
    setForm(selectedListing ? mapper.fromListing(selectedListing) : mapper.empty());
  }, [selectedListing]);

  useEffect(() => {
    const runId = selectedListing?.latestSuggestion?.agentRunId;

    if (runId) {
      void loadAgentRun(runId);
    } else {
      setAgentRun(null);
    }
  }, [selectedListing?.latestSuggestion?.agentRunId]);

  async function loadListings() {
    setBusy(true);
    try {
      const nextListings = await api.list();
      setListings(nextListings);
      setSelectedId((current) => current ?? nextListings[0]?.id ?? null);
      setNotice(null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to load listings.");
    } finally {
      setBusy(false);
    }
  }

  async function loadAgentRun(id: string) {
    try {
      setAgentRun(await api.getAgentRun(id));
    } catch {
      setAgentRun(null);
    }
  }

  async function loadCostSummary() {
    try {
      setCostSummary(await api.costSummary());
    } catch {
      setCostSummary(null);
    }
  }

  async function saveListing() {
    setBusy(true);
    try {
      const input = mapper.toInput(form);
      const saved = selectedListing
        ? await api.update(selectedListing.id, input)
        : await api.create(input);
      await loadListings();
      setSelectedId(saved.id);
      setNotice("Listing saved.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to save listing.");
    } finally {
      setBusy(false);
    }
  }

  async function optimizeListing() {
    if (!selectedListing) {
      return;
    }

    setBusy(true);
    try {
      const run = await api.optimize(selectedListing.id);
      await loadListings();
      await loadCostSummary();
      setSelectedId(selectedListing.id);
      setAgentRun(run);
      setNotice("Optimization run completed.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to optimize listing.");
    } finally {
      setBusy(false);
    }
  }

  async function importCsv(file: File) {
    setBusy(true);
    try {
      const result = await api.importCsv(file);
      await loadListings();
      setNotice(`Imported ${result.createdCount} new and ${result.updatedCount} updated ${result.format} listings. ${result.errorCount} row errors.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to import CSV.");
    } finally {
      setBusy(false);
    }
  }

  function startNewListing() {
    setSelectedId(null);
    setForm(mapper.empty());
    setNotice(null);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Shopify listing agent</p>
          <h1>MerchAI</h1>
        </div>
        <div className="topbarActions">
          <button className="iconButton" type="button" onClick={loadListings} disabled={busy} title="Refresh listings">
            <RefreshCw size={18} />
          </button>
          <button className="secondaryButton" type="button" onClick={startNewListing}>
            <Plus size={18} />
            New
          </button>
          <button className="primaryButton" type="button" onClick={saveListing} disabled={busy || !form.title.trim()}>
            <Save size={18} />
            Save
          </button>
          <button className="primaryButton accent" type="button" onClick={optimizeListing} disabled={busy || !selectedListing}>
            <Sparkles size={18} />
            Optimize
          </button>
        </div>
      </header>

      {notice && <div className="notice">{notice}</div>}

      <section className="workspace">
        <div className="leftRail">
          <ListingsPane
            listings={listings}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onImport={importCsv}
            disabled={busy}
          />
          <CostSummaryPanel summary={costSummary} />
        </div>
        <ListingEditor form={form} onChange={setForm} />
        <SuggestionPanel listing={selectedListing} agentRun={agentRun} />
      </section>
    </main>
  );
}
