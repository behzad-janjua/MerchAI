import type { ListingFormData, ProductListing } from "../types";

type Props = {
  listing: ProductListing | null;
  isNew: boolean;
  form: ListingFormData;
  saving: boolean;
  onChange: (field: keyof ListingFormData, value: string) => void;
  onSave: () => void;
  onDelete: () => void;
};

type FieldProps = {
  label: string;
  name: keyof ListingFormData;
  form: ListingFormData;
  onChange: (field: keyof ListingFormData, value: string) => void;
  placeholder?: string;
  hint?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  textarea?: boolean;
};

function Field({ label, name, form, onChange, placeholder, hint, inputMode, textarea }: FieldProps) {
  const id = `field-${name}`;
  return (
    <label htmlFor={id}>
      <span className="field-label">
        {label}
        {hint && <span style={{ fontWeight: 400, color: "var(--gray-400)", marginLeft: 4 }}>{hint}</span>}
      </span>
      {textarea ? (
        <textarea
          id={id}
          value={form[name]}
          placeholder={placeholder}
          onChange={(e) => onChange(name, e.target.value)}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={form[name]}
          placeholder={placeholder}
          inputMode={inputMode}
          onChange={(e) => onChange(name, e.target.value)}
        />
      )}
    </label>
  );
}

export function ListingEditor({ listing, isNew, form, saving, onChange, onSave, onDelete }: Props) {
  const title = isNew
    ? "New listing"
    : (form.title.trim() || "Untitled listing");

  const subtitle = isNew
    ? "Fill in the details below and save to create a listing"
    : [form.vendor, form.productType].filter(Boolean).join(" · ") || "Edit product details below";

  return (
    <div className="col-center">
      <div className="editor-wrap">
        <div className="editor-header">
          <div>
            <h1 className="editor-title">{title}</h1>
            <p className="editor-subtitle">{subtitle}</p>
          </div>
          <span className="editor-badge">{isNew ? "New" : "Editing"}</span>
        </div>

        <div className="form-section">
          <p className="form-section-title">Identity</p>
          <div className="form-grid">
            <label className="span-2" htmlFor="field-title">
              <span className="field-label">Title</span>
              <input
                id="field-title"
                type="text"
                value={form.title}
                placeholder="e.g. Organic Cotton Tote Bag"
                onChange={(e) => onChange("title", e.target.value)}
              />
            </label>
            <Field label="Shopify product ID" name="shopifyProductId" form={form} onChange={onChange} placeholder="gid://shopify/…" />
            <Field label="Handle" name="handle" form={form} onChange={onChange} placeholder="url-slug" />
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">Categorization</p>
          <div className="form-grid">
            <Field label="Vendor" name="vendor" form={form} onChange={onChange} placeholder="Brand or supplier" />
            <Field label="Product type" name="productType" form={form} onChange={onChange} placeholder="Apparel, Accessories…" />
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">Pricing &amp; inventory</p>
          <div className="form-grid">
            <Field label="Price" name="price" form={form} onChange={onChange} placeholder="0.00" inputMode="decimal" />
            <Field label="Currency" name="currency" form={form} onChange={onChange} placeholder="USD" />
            <label className="span-2" htmlFor="field-inventoryQuantity">
              <span className="field-label">Inventory quantity</span>
              <input
                id="field-inventoryQuantity"
                type="text"
                inputMode="numeric"
                value={form.inventoryQuantity}
                placeholder="0"
                onChange={(e) => onChange("inventoryQuantity", e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="form-section">
          <p className="form-section-title">Content &amp; SEO</p>
          <div className="form-grid single">
            <Field label="Tags" name="tags" form={form} onChange={onChange} placeholder="summer, organic, tote" hint="(comma-separated)" />
            <Field label="Target audience" name="audience" form={form} onChange={onChange} placeholder="Who is this product for?" />
            <Field label="Description" name="description" form={form} onChange={onChange} placeholder="Product description — the optimizer will improve this." textarea />
          </div>
        </div>

        <div className="form-actions">
          {!isNew && listing && (
            <button className="btn btn-ghost" style={{ color: "var(--error-text)", marginRight: "auto" }} onClick={onDelete}>
              Delete listing
            </button>
          )}
          <button className="btn btn-primary" onClick={onSave} disabled={saving || !form.title.trim()}>
            {saving ? "Saving…" : isNew ? "Create listing" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
