class LlmProviderConfig < ApplicationRecord
  validates :key, presence: true, uniqueness: true
  validates :provider, presence: true
  validates :display_name, presence: true
  validates :model, presence: true

  def self.default_enabled
    where(enabled: true, is_default: true).order(created_at: :asc).first
  end
end
