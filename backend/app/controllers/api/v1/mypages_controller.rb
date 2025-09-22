class Api::V1::MypagesController < ApplicationController
  before_action :authenticate_user!

  def show
    # 1日1回かどうかの判定
    # サーバーのタイムゾーン（厳密なタイムゾーン対応は将来的な課題とする）
    has_completed_today = user.smile_logs.where("DATE(created_at) = ?", Time.zone.now.to_date).exists?
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
        smile_rank: current_user.smile_rank&.name || 'ランクなし'
      },
      smile_logs: smile_logs_for_calendar,
      has_completed_today: has_completed_today
    }
  end
end
