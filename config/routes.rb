Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :product_listings do
        post :optimize,    on: :member
        post :import_csv,  on: :collection
      end
      resources :agent_runs, only: [:show] do
        get :cost_summary, on: :collection
      end
    end
  end

  get "/health", to: proc { [200, { "Content-Type" => "application/json" }, ['{"ok":true}']] }
end
