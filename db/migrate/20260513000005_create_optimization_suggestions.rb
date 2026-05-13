class CreateOptimizationSuggestions < ActiveRecord::Migration[7.2]
  def change
    create_table :optimization_suggestions, id: :uuid, default: "gen_random_uuid()" do |t|
      t.references :product_listing, null: false, foreign_key: { on_delete: :cascade }, type: :uuid
      t.references :agent_run,       null: false, foreign_key: { on_delete: :cascade }, type: :uuid
      t.string  :improved_title
      t.text    :improved_description, null: false
      t.string  :tags, array: true, default: []
      t.text    :positioning_recommendations
      t.text    :seo_notes
      t.decimal :score, precision: 5, scale: 2
      t.text    :rationale
      t.boolean :accepted, null: false, default: false
      t.timestamps null: false
    end

    add_index :optimization_suggestions, :agent_run_id, unique: true
    add_index :optimization_suggestions, [:product_listing_id, :created_at]
  end
end
