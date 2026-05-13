class ProductListingCsvParser
  ParseResult = Struct.new(:rows, :errors, :format, keyword_init: true)
  RowError    = Struct.new(:row, :errors, keyword_init: true)

  def parse(csv)
    table = read_csv(csv)

    if table.empty?
      return ParseResult.new(rows: [], errors: [RowError.new(row: 1, errors: ["CSV is empty."])], format: "simple")
    end

    headers = table[0].map { |h| h.to_s.strip }
    format  = shopify_format?(headers) ? "shopify" : "simple"
    rows    = []
    errors  = []

    table[1..].each_with_index do |values, idx|
      row_number = idx + 2
      next if values.all? { |v| v.to_s.strip.empty? }

      record = headers.zip(values).to_h { |k, v| [normalize_key(k), v.to_s.strip] }
      mapped = format == "shopify" ? map_shopify(record) : map_simple(record)
      row_errors = validate(mapped, row_number)

      if row_errors.any?
        errors << RowError.new(row: row_number, errors: row_errors)
      else
        rows << mapped
      end
    end

    ParseResult.new(rows: rows, errors: errors, format: format)
  end

  private

  def read_csv(csv)
    rows    = []
    row     = []
    cell    = ""
    quoted  = false
    chars   = csv.chars

    chars.each_with_index do |char, i|
      nxt = chars[i + 1]

      if char == '"' && quoted && nxt == '"'
        cell += '"'
        next
      elsif char == '"'
        quoted = !quoted
      elsif char == ',' && !quoted
        row << cell; cell = ""
      elsif (char == "\n" || char == "\r") && !quoted
        row << cell; rows << row; row = []; cell = ""
      else
        cell += char
      end
    end

    row << cell
    rows << row if row.any?

    rows.reject { |r| r.all? { |c| c.strip.empty? } }
  end

  def shopify_format?(headers)
    normalized = headers.map { |h| normalize_key(h) }.to_set
    normalized.include?("bodyhtml") || normalized.include?("variantprice") || normalized.include?("productcategory")
  end

  def map_shopify(record)
    {
      shopify_product_id: optional(record["id"] || record["productid"] || record["shopifyproductid"]),
      title:              record["title"].to_s.strip,
      handle:             optional(record["handle"]),
      vendor:             optional(record["vendor"]),
      product_type:       optional(record["type"] || record["producttype"] || record["productcategory"]),
      description:        optional(record["bodyhtml"] || record["description"]),
      tags:               split_tags(record["tags"]),
      price:              optional_decimal(record["variantprice"] || record["price"]),
      currency:           optional(record["currency"]) || "USD",
      inventory_quantity: optional_integer(record["variantinventoryqty"] || record["inventoryquantity"]),
      raw_data:           { import_format: "shopify" }
    }
  end

  def map_simple(record)
    {
      shopify_product_id: optional(record["shopifyproductid"] || record["productid"] || record["id"]),
      title:              record["title"].to_s.strip,
      handle:             optional(record["handle"]),
      vendor:             optional(record["vendor"]),
      product_type:       optional(record["producttype"]),
      description:        optional(record["description"]),
      tags:               split_tags(record["tags"]),
      price:              optional_decimal(record["price"]),
      currency:           optional(record["currency"]) || "USD",
      inventory_quantity: optional_integer(record["inventoryquantity"] || record["inventory"]),
      raw_data:           { import_format: "simple" }
    }
  end

  def validate(input, row_number)
    errors = []
    errors << "Row #{row_number}: title is required"                       if input[:title].blank?
    errors << "Row #{row_number}: price must be a valid number"            if input[:price] == :invalid
    errors << "Row #{row_number}: inventoryQuantity must be an integer"    if input[:inventory_quantity] == :invalid
    errors << "Row #{row_number}: currency must be a 3-letter code"        unless (input[:currency] || "USD").match?(/\A[A-Za-z]{3}\z/)
    errors
  end

  def split_tags(value)
    return [] if value.blank?
    value.split(/[|,]/).map(&:strip).reject(&:blank?).uniq
  end

  def optional(value)
    value.to_s.strip.presence
  end

  def optional_decimal(value)
    return nil if value.blank?
    parsed = value.to_s.gsub(/[$,]/, "").to_f
    parsed.finite? ? parsed : :invalid
  end

  def optional_integer(value)
    return nil if value.blank?
    parsed = value.to_s.to_i
    value.to_s.strip.match?(/\A-?\d+\z/) ? parsed : :invalid
  end

  def normalize_key(value)
    value.to_s.downcase.gsub(/[^a-z0-9]/, "")
  end
end
