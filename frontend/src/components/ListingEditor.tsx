import { ProductListingFormState } from "../services/ProductListingFormMapper";

type ListingEditorProps = {
  form: ProductListingFormState;
  onChange(form: ProductListingFormState): void;
};

export function ListingEditor({ form, onChange }: ListingEditorProps) {
  function update<K extends keyof ProductListingFormState>(key: K, value: ProductListingFormState[K]) {
    onChange({ ...form, [key]: value });
  }

  return (
    <section className="panel editorPane">
      <div className="panelHeader">
        <h2>Product Data</h2>
      </div>
      <div className="formGrid">
        <label>
          <span>Title</span>
          <input value={form.title} onChange={(event) => update("title", event.target.value)} />
        </label>
        <label>
          <span>Shopify ID</span>
          <input value={form.shopifyProductId} onChange={(event) => update("shopifyProductId", event.target.value)} />
        </label>
        <label>
          <span>Handle</span>
          <input value={form.handle} onChange={(event) => update("handle", event.target.value)} />
        </label>
        <label>
          <span>Vendor</span>
          <input value={form.vendor} onChange={(event) => update("vendor", event.target.value)} />
        </label>
        <label>
          <span>Product Type</span>
          <input value={form.productType} onChange={(event) => update("productType", event.target.value)} />
        </label>
        <label>
          <span>Currency</span>
          <input maxLength={3} value={form.currency} onChange={(event) => update("currency", event.target.value)} />
        </label>
        <label>
          <span>Price</span>
          <input inputMode="decimal" value={form.price} onChange={(event) => update("price", event.target.value)} />
        </label>
        <label>
          <span>Inventory</span>
          <input inputMode="numeric" value={form.inventoryQuantity} onChange={(event) => update("inventoryQuantity", event.target.value)} />
        </label>
        <label className="wide">
          <span>Tags</span>
          <input value={form.tags} onChange={(event) => update("tags", event.target.value)} />
        </label>
        <label className="wide">
          <span>Audience</span>
          <input value={form.audience} onChange={(event) => update("audience", event.target.value)} />
        </label>
        <label className="wide">
          <span>Description</span>
          <textarea value={form.description} onChange={(event) => update("description", event.target.value)} />
        </label>
      </div>
    </section>
  );
}
