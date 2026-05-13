require_relative "boot"

require "rails"
require "active_record/railtie"
require "action_controller/railtie"
require "action_view/railtie"
require "sprockets/railtie"

Bundler.require(*Rails.groups)

module MerchAI
  class Application < Rails::Application
    config.load_defaults 7.2
    config.eager_load_paths << Rails.root.join("app/services")
    config.generators.system_tests = nil
  end
end
