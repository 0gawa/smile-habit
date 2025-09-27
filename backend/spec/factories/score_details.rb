FactoryBot.define do
  factory :score_detail do
    association :smile_log

    happiness_score { Faker::Number.between(from: 0, to: 100) }
    eye_brilliance_score { Faker::Number.between(from: 0, to: 100) }
    confidence_score { Faker::Number.between(from: 0, to: 100) }
    warmth_score { Faker::Number.between(from: 0, to: 100) }
    energy_level_score { Faker::Number.between(from: 0, to: 100) }
  end
end
