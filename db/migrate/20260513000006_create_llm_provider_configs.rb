class CreateLlmProviderConfigs < ActiveRecord::Migration[7.2]
  def change
    create_table :llm_provider_configs, id: :uuid, default: "gen_random_uuid()" do |t|
      t.string  :key, null: false
      t.string  :provider, null: false
      t.string  :display_name, null: false
      t.string  :base_url
      t.string  :api_key_env_var
      t.string  :model, null: false
      t.decimal :input_cost_per1k, precision: 10, scale: 6, null: false, default: 0
      t.decimal :output_cost_per1k, precision: 10, scale: 6, null: false, default: 0
      t.boolean :enabled, null: false, default: true
      t.boolean :is_default, null: false, default: false
      t.text    :notes
      t.timestamps null: false
    end

    add_index :llm_provider_configs, :key, unique: true
    add_index :llm_provider_configs, [:enabled, :is_default]
    add_index :llm_provider_configs, [:provider, :model]
  end
end
