class User < ApplicationRecord
  include DeviseTokenAuth::Concerns::User

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  belongs_to :smile_rank
  has_many :smile_logs, dependent: :destroy
  has_many :user_badges, dependent: :destroy
  has_many :badges, through: :user_badges

  has_many :active_friendships, class_name: "Friendship", foreign_key: "follower_id", dependent: :destroy
  has_many :following, through: :active_friendships, source: :followed

  has_many :passive_friendships, class_name: "Friendship", foreign_key: "followed_id", dependent: :destroy
  has_many :followers, through: :passive_friendships, source: :follower

  before_validation :set_default_rank, on: :create
  before_validation :set_default_nickname, on: :create

  def follow(other_user)
    following << other_user unless self == other_user
  end

  def unfollow(other_user)
    following.delete(other_user)
  end

  def following?(other_user)
    following.include?(other_user)
  end

  private

  def set_default_rank
    # 最低ランクを割り当てる
    self.smile_rank ||= SmileRank.find_by(required_score: 0)
  end

  def set_default_nickname
    if self.nickname.blank? && self.email.present?
      self.nickname = self.email.split('@').first
    end
    # 例： anya@test.com -> nickname is "anya"
  end
end
