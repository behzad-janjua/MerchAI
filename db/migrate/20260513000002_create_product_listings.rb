class CreateProductListings < ActiveRecord::Migration[7.2]
  def change
    create_table :product_listings, id: :uuid, default: "gen_random_uuid()" do |t|
      t.string  :shopify_product_id
      t.string  :title, null: false
      t.string  :handle
      t.string  :vendor
      t.string  :product_type
      t.text    :description
      t.string  :tags, array: true, default: []
      t.decimal :price, precision: 10, scale: 2
      t.string  :currency, null: false, default: "USD"
      t.integer :inventory_quantity
      t.jsonb   :raw_data, null: false, default: {}
      t.timestamps null: false
    end

    add_index :product_listings, :shopify_product_id, unique: true
    add_index :product_listings, :handle
    add_index :product_listings, :updated_at
  end
end
