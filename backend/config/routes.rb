Rails.application.routes.draw do
  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/letter_opener"
  end
  
  mount_devise_token_auth_for 'User', at: 'auth'

  namespace :api do
    namespace :v1 do
      authenticated :user do
        resources :smile_logs, only: [:create, :index]
        resource :mypage, only: [:show]
      end
    end
  end
end
