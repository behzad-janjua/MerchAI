class CreateAgentRuns < ActiveRecord::Migration[7.2]
  def change
    create_table :agent_runs, id: :uuid, default: "gen_random_uuid()" do |t|
      t.references :product_listing, null: false, foreign_key: { on_delete: :cascade }, type: :uuid
      t.string  :status, null: false, default: "queued"
      t.datetime :started_at
      t.datetime :completed_at
      t.text    :error_message
      t.jsonb   :analysis, null: false, default: {}
      t.jsonb   :metadata, null: false, default: {}
      t.timestamps null: false
    end

    add_index :agent_runs, [:product_listing_id, :created_at]
  end
end
