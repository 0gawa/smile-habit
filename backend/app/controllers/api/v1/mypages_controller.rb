class Api::V1::MypagesController < ApplicationController
  before_action :authenticate_user!

  def show
    # 1日1回かどうかの判定
    # サーバーのタイムゾーン（厳密なタイムゾーン対応は将来的な課題とする）
    has_completed_today = current_user.smile_logs.where("DATE(created_at) = ?", Time.zone.now.to_date).exists?
    smile_logs_for_calendar = current_user.smile_logs.order(created_at: :asc).map do |log|
      {
        id: log.id, 
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

  def update
    if current_user.update(user_params)
      render json: {
        user: {
          nickname: current_user.nickname,
          total_score: current_user.total_score,
          smile_rank: current_user.smile_rank&.name || 'ランクなし',
          image_url: current_user.image.attached? ? url_for(current_user.image) : nil
        }
      }, status: :ok
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:name, :nickname, :image)
  end
end
