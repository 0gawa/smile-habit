FactoryBot.define do
  factory :user do
    nickname { Faker::Name.unique.name }
    email { Faker::Internet.unique.email }
    password { 'password123' }
    
    association :smile_rank

    # devise_token_authのメール認証を通過した状態を模倣
    trait :confirmed do
      confirmed_at { Time.current }
    end
  end
end
