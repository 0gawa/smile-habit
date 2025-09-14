class Api::V1::MypageController < ApplicationController
  before_action :authenticate_user!

  def show
    # ユーザーの全ての笑顔ログを、日付とスコアのみに絞って取得
    smile_logs_for_calendar = current_user.smile_logs.order(created_at: :asc).map do |log|
      {
        date: log.created_at.to_date.to_s, # "YYYY-MM-DD"形式
        score: log.overall_score
      }
    end

    render json: {
      user: {
        nickname: current_user.nickname,
        total_score: current_user.total_score,
        smile_rank: current_user.smile_rank&.name || 'ランクなし' # ランクが未設定の場合も考慮
      },
      smile_logs: smile_logs_for_calendar
    }
  end
end
