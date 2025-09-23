class SmileLog < ApplicationRecord
  belongs_to :user

  # 投稿に画像は1枚まで
  has_one_attached :photo
  has_one :score_detail, dependent: :destroy
end
