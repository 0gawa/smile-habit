class Api::V1::FriendshipsController < ApplicationController
  def index
    friends = current_user.following.includes(:smile_rank) # N+1問題を避ける
    render json: friends.map do |friend|
      { 
        id: friend.id, 
        nickname: friend.nickname, 
        total_score: friend.total_score,
        smile_rank: friend.smile_rank&.name
      }
    end
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
