Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :product_listings do
        post :optimize, on: :member
      end

      resources :agent_runs, only: [:show, :create]
    end
  end
end
