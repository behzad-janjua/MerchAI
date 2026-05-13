import { motion, AnimatePresence } from "framer-motion";
import type { ListingFormData, ProductListing } from "../types";

const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "DKK", name: "Danish Krone" },
  { code: "INR", name: "Indian Rupee" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "ZAR", name: "South African Rand" },
  { code: "PLN", name: "Polish Złoty" },
  { code: "TRY", name: "Turkish Lira" },
];

type Props = {
  listing: ProductListing | null;
  isNew: boolean;
  form: ListingFormData;
  saving: boolean;
  confirmDelete: boolean;
  onChange: (field: keyof ListingFormData, value: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onCancelDelete: () => void;
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
        {hint && <span style={{ fontWeight: 400, color: "var(--text-3)", marginLeft: 4 }}>{hint}</span>}
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

export function ListingEditor({ listing, isNew, form, saving, confirmDelete, onChange, onSave, onDelete, onCancelDelete }: Props) {
  const title = isNew
    ? "New listing"
    : (form.title.trim() || "Untitled listing");

  const subtitle = isNew
    ? "Fill in the details below, then save to create a listing"
    : [form.vendor, form.productType].filter(Boolean).join(" · ") || "Edit product details below";

  return (
    <div className="col-center">
      <div className="editor-wrap">
        <div className="editor-header">
          <div>
            <h1 className="editor-title">{title}</h1>
            <p className="editor-subtitle">{subtitle}</p>
          </div>
          <span className={`editor-badge${isNew ? " badge-new" : ""}`}>{isNew ? "New" : "Editing"}</span>
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
            <label htmlFor="field-currency">
              <span className="field-label">Currency</span>
              <select
                id="field-currency"
                value={form.currency}
                onChange={(e) => onChange("currency", e.target.value)}
              >
                {CURRENCIES.map(({ code, name }) => (
                  <option key={code} value={code}>{code} — {name}</option>
                ))}
              </select>
            </label>
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
          <AnimatePresence mode="wait">
            {!isNew && listing && !confirmDelete && (
              <motion.button
                key="delete"
                className="btn btn-ghost"
                style={{ color: "var(--error-text)", marginRight: "auto" }}
                onClick={onDelete}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
                whileTap={{ scale: 0.97 }}
              >
                Delete listing
              </motion.button>
            )}
            {!isNew && listing && confirmDelete && (
              <motion.div
                key="confirm"
                style={{ display: "flex", gap: 6, marginRight: "auto", alignItems: "center" }}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
              >
                <span style={{ fontSize: 13, color: "var(--gray-600)" }}>Are you sure?</span>
                <motion.button
                  className="btn btn-danger"
                  style={{ height: 28, padding: "0 10px", fontSize: 12.5 }}
                  onClick={onDelete}
                  whileTap={{ scale: 0.97 }}
                >
                  Yes, delete
                </motion.button>
                <motion.button
                  className="btn btn-ghost"
                  style={{ height: 28, padding: "0 10px", fontSize: 12.5 }}
                  onClick={onCancelDelete}
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            className="btn btn-primary"
            onClick={onSave}
            disabled={saving || !form.title.trim()}
            whileTap={{ scale: saving ? 1 : 0.97 }}
          >
            {saving ? "Saving…" : isNew ? "Create listing" : "Save changes"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
