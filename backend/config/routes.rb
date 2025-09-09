Rails.application.routes.draw do
  mount_devise_token_auth_for 'User', at: 'auth'

  namespace :api do
    namespace :v1 do
      authenticate :user do
        resources :smile_logs, only: [:create, :index]
      end
    end
  end
end
