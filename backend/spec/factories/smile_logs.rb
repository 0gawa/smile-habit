FactoryBot.define do
  factory :smile_log do
    association :user

    journal_entry { Faker::Lorem.sentence(word_count: 10) }
    overall_score { Faker::Number.between(from: 50, to: 100) }

    # smile_logが作成された後に、関連するscore_detailも作成する
    after(:create) do |smile_log|
      create(:score_detail, smile_log: smile_log)
    end
  end
end
