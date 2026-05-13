class CreateAgentStepRuns < ActiveRecord::Migration[7.2]
  def change
    create_table :agent_step_runs, id: :uuid, default: "gen_random_uuid()" do |t|
      t.references :agent_run, null: false, foreign_key: { on_delete: :cascade }, type: :uuid
      t.string  :step_name, null: false
      t.integer :step_order, null: false
      t.text    :prompt, null: false
      t.text    :response
      t.string  :provider
      t.string  :model
      t.integer :input_tokens
      t.integer :output_tokens
      t.decimal :estimated_cost, precision: 10, scale: 6
      t.string  :status, null: false, default: "queued"
      t.text    :error_message
      t.jsonb   :metadata, null: false, default: {}
      t.timestamps null: false
    end

    add_index :agent_step_runs, [:agent_run_id, :step_order]
    add_index :agent_step_runs, [:provider, :model]
  end
end
