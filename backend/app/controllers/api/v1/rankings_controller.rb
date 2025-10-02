class Api::V1::RankingsController < ApplicationController
  before_action :authenticate_user!

  def index
    type = params[:type] || 'friends'

    case type
    when 'friends'
      users_for_ranking = [current_user] + current_user.following
      ranked_users = users_for_ranking.sort_by(&:total_score).reverse
    when 'monthly'
      # 今月のスコアが高い順に上位100名を取得
      ranked_users = User.joins(:smile_logs)
                          .where(smile_logs: { created_at: Time.zone.now.all_month })
                          .group('users.id')
                          .order('SUM(smile_logs.overall_score) DESC')
                          .limit(100)
    when 'all_time'
      # 総合スコアが高い順に上位100名を取得
      ranked_users = User.order(total_score: :desc).limit(100)
    else
      render json: { error: 'Invalid ranking type' }, status: :bad_request
      return
    end

    ranking_data = ranked_users.map.with_index(1) do |user, index|
      {
        rank: index,
        id: user.id,
        nickname: user.nickname,
        total_score: user.total_score,
        is_current_user: user.id == current_user.id,
        smile_rank: {
          name: user.smile_rank&.name,
          image_url: user.smile_rank&.image&.attached? ? url_for(user.smile_rank.image) : nil
        }
      }
    end

    render json: ranking_data
  end
end
