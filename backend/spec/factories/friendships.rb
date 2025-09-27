FactoryBot.define do
  factory :friendship do
    association :follower, factory: :user
    association :followed, factory: :user
  end
end
