Rails.application.routes.draw do
  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/letter_opener"
  end
  
  mount_devise_token_auth_for 'User', at: 'auth'

  namespace :api do
    namespace :v1 do
      resources :smile_logs, only: [:create, :index, :show, :update]
      resource :mypage, only: [:show]

      resources :users, only: [] do
        collection do
          get :search
        end
      end
      resources :friendships, only: [:index, :create, :destroy]
    end
  end
end
