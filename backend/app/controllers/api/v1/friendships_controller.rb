class Api::V1::FriendshipsController < ApplicationController
  before_action :authenticate_user!
  
  def index
    friends = current_user.following.select(:id, :nickname, :total_score, :smile_rank_id).includes(:smile_rank)
    render json: friends.as_json(include: { smile_rank: { only: :name } })
  end

  def create
    followed_user = User.find(params[:followed_id])
    current_user.follow(followed_user)
    render json: { status: 'success', message: "#{followed_user.nickname}さんをフォローしました。" }, status: :created
  end

  def destroy
    user_to_unfollow = User.find(params[:id])
    current_user.unfollow(user_to_unfollow)
    head :no_content
  end
end
