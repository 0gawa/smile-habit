FactoryBot.define do
  factory :badge do
    sequence(:name) { |n| "すごいバッジ #{n}" }
    description { Faker::Lorem.sentence }
  end
end
