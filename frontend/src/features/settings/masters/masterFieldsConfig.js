/**
 * masterFieldsConfig (FASE L) — DEFINISI KOLOM & FIELD untuk layar Master Berlapis.
 *
 * KENAPA BERKAS INI DIPISAH
 * `EntityMastersView.jsx` memegang `COLUMNS` & `CREATE_FIELDS` per jenis master
 * secara hardcode. Dua akibatnya sudah terukur (RENCANA_EKSEKUSI_MD_ERP.md §3.3):
 *   1. Jenis master BARU (lini produk sekarang; tahapan proses, jenis sampling, dan
 *      alasan komplain pada fase berikutnya) akan muncul di daftar kelompok dengan
 *      **tabel tanpa kolom** — layarnya "ada" tetapi tidak memperlihatkan apa pun.
 *   2. Berkasnya sudah 543 baris (panduan repo 500); menambah 4 jenis mendorongnya
 *      ke ±700 baris.
 * Jadi definisinya pindah ke sini: menambah master baru = menambah SATU entri data,
 * bukan menyunting layar.
 *
 * Tipe field yang didukung form:
 *   text (bawaan) · number · select (options) · list (dipisah koma → array) ·
 *   checkbox (boolean)
 */

/** Kolom yang ditampilkan per jenis master (label manusia + cara render). */
export const COLUMNS = {
  "payment-terms": [
    { key: "code", label: "Kode", mono: true },
    { key: "name", label: "Nama" },
    { key: "type", label: "Jenis" },
    { key: "net_days", label: "Jatuh tempo (hari)", align: "right" },
    { key: "dp_percent", label: "DP %", align: "right" },
  ],
  "expense-categories": [
    { key: "code", label: "Kode", mono: true },
    { key: "label", label: "Nama kategori" },
    { key: "account_code", label: "Akun buku besar", mono: true },
  ],
  "document-templates": [
    { key: "document_type", label: "Jenis dokumen", mono: true },
    { key: "name", label: "Nama template" },
    { key: "header", label: "Kop surat" },
    { key: "paper_size", label: "Kertas" },
  ],
  "sales-return-policies": [
    { key: "name", label: "Nama kebijakan" },
    { key: "scope", label: "Cakupan" },
    { key: "window_days", label: "Jendela (hari)", align: "right" },
    { key: "restocking_fee_pct", label: "Biaya restocking %", align: "right" },
  ],
  "incentive-rates": [
    { key: "category", label: "Kategori produk" },
    { key: "incentive_unit", label: "Satuan" },
    { key: "per_unit_amount", label: "Per satuan", align: "right", money: true },
    { key: "margin_cap_pct", label: "Batas margin %", align: "right" },
  ],
  "approval-rules": [
    { key: "doc_type", label: "Dokumen", mono: true },
    { key: "min_amount", label: "Dari", align: "right", money: true },
    { key: "max_amount", label: "Sampai", align: "right", money: true },
    { key: "required_role", label: "Wajib disetujui" },
  ],
  // ── FASE L — LINI PRODUK (pembagian kerja MD). Kolom dipilih supaya pemilik bisa
  // menjawab tiga pertanyaan langsung dari tabel: lini ini untuk kain apa
  // (`fabric_type_required`), satuan yang biasa dipakai, dan urutan tahapannya.
  "product-lines": [
    { key: "code", label: "Kode", mono: true },
    { key: "name", label: "Nama lini" },
    { key: "fabric_type_required", label: "Khusus jenis kain", empty: "bebas" },
    { key: "measure_unit_default", label: "Satuan usulan" },
    { key: "stage_sequence", label: "Urutan tahap", list: true },
    { key: "sort", label: "Urut", align: "right" },
  ],
};

/** Field yang bisa diisi saat menambah baris baru, per jenis master. */
export const CREATE_FIELDS = {
  "payment-terms": [
    { key: "code", label: "Kode", required: true, placeholder: "mis. NET45" },
    { key: "name", label: "Nama", required: true, placeholder: "Kredit NET 45 Hari" },
    { key: "type", label: "Jenis", type: "select",
      options: [
        { value: "cash", label: "Tunai" }, { value: "credit", label: "Kredit" },
        { value: "dp", label: "DP + pelunasan" }, { value: "installment", label: "Bertahap" },
      ] },
    { key: "net_days", label: "Jatuh tempo (hari)", type: "number" },
    { key: "dp_percent", label: "DP (%)", type: "number" },
  ],
  "expense-categories": [
    { key: "code", label: "Kode", required: true, placeholder: "mis. bensin_operasional" },
    { key: "label", label: "Nama kategori", required: true, placeholder: "Bensin Operasional" },
    { key: "account_code", label: "Akun buku besar", required: true, placeholder: "6-4300" },
  ],
  "document-templates": [
    { key: "document_type", label: "Jenis dokumen", required: true, placeholder: "surat_jalan" },
    { key: "name", label: "Nama template", required: true, placeholder: "Template SJ Kanda" },
    { key: "header", label: "Kop surat", placeholder: "CV KANDA SUKA — Tekstil" },
    { key: "footer", label: "Catatan kaki" },
  ],
  // FASE L — menambah lini keempat (mis. "Denim") cukup lewat form ini; chipnya
  // langsung muncul di 12 layar karena nilainya dibaca dari master, bukan kode.
  "product-lines": [
    { key: "code", label: "Kode lini", required: true, placeholder: "mis. denim" },
    { key: "name", label: "Nama lini", required: true, placeholder: "Denim" },
    { key: "fabric_type_required", label: "Khusus jenis kain", type: "select",
      hint: "Kosongkan bila lini ini boleh untuk woven maupun knit (mis. printing).",
      options: [
        { value: "", label: "Bebas (woven & knit)" },
        { value: "woven", label: "Hanya woven (tenun)" },
        { value: "knit", label: "Hanya knit (rajut)" },
      ] },
    { key: "measure_unit_default", label: "Satuan usulan", type: "select",
      hint: "USULAN saat membuat produk/PO. Satuan kendali tetap dari jenis kain.",
      options: [
        { value: "yard", label: "Yard" }, { value: "meter", label: "Meter" },
        { value: "kg", label: "Kilogram" }, { value: "panel", label: "Panel" },
      ] },
    { key: "stage_sequence", label: "Urutan tahap", type: "list",
      placeholder: "yarn, tenun, celup, inspect" },
    { key: "sample_types_default", label: "Jenis sampling usulan", type: "list",
      placeholder: "labdip, proofing" },
    { key: "sort", label: "Urutan tampil", type: "number" },
    { key: "notes", label: "Catatan" },
  ],
};

/** Nilai sel → teks. Dipakai tabel (list dirender "a · b · c"). */
export function cellText(col, row, formatCurrency) {
  const v = row[col.key];
  if (Array.isArray(v)) return v.length ? v.join(" · ") : (col.empty || "—");
  if (v === null || v === undefined || v === "") return col.empty || "—";
  if (col.money && typeof formatCurrency === "function") return formatCurrency(v);
  if (typeof v === "boolean") return v ? "Ya" : "Tidak";
  return String(v);
}

/** Nilai form → bentuk yang dikirim API (list: "a, b" → ["a","b"]). */
export function parseFieldValue(field, raw) {
  if (!field) return raw;
  if (field.type === "number") return raw === "" || raw === null ? "" : Number(raw);
  if (field.type === "list") {
    return String(raw || "").split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (field.type === "checkbox") return Boolean(raw);
  return raw;
}

/** Bentuk API → nilai yang bisa diketik di form (array → "a, b"). */
export function toInputValue(field, value) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined) return "";
  return value;
}

/** Definisi field (untuk sel yang bisa disunting inline). */
export function fieldOf(kind, key) {
  return (CREATE_FIELDS[kind] || []).find((f) => f.key === key) || null;
}
