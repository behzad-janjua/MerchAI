Rails.application.routes.draw do
  root "dashboard#index"

  get "/listings/new", to: "dashboard#index", defaults: { new_listing: true }, as: :new_listing
  get "/listings/:id", to: "dashboard#index", as: :listing
  post "/listings", to: "dashboard#save", as: :save_listing
  post "/listings/import", to: "dashboard#import_csv", as: :import_listings
  post "/listings/:id/optimize", to: "dashboard#optimize", as: :optimize_listing
end
