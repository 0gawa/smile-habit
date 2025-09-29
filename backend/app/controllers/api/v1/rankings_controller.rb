class Api::V1::RankingsController < ApplicationController
  before_action :authenticate_user!

  def index
    users_for_ranking = [current_user] + current_user.following
    
    ranked_users = users_for_ranking.sort_by { |user| user.total_score }.reverse

    ranking_data = ranked_users.map.with_index(1) do |user, index|
      {
        rank: index,
        id: user.id,
        nickname: user.nickname,
        total_score: user.total_score,
        is_current_user: user.id == current_user.id
      }
    end
    
    render json: ranking_data
  end
end
