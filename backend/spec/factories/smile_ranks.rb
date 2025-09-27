FactoryBot.define do
  factory :smile_rank do
    sequence(:name) { |n| "#{Faker::Color.color_name.capitalize} #{n}" }
    sequence(:required_score) { |n| (n - 1) * 1000 }
  end
end
