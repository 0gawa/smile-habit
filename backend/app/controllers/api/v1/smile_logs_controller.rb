class Api::V1::SmileLogsController < ApplicationController
  before_action :authenticate_user!

  def create
    # (AI分析はまだなので、一旦ダミーのスコアを入れる)
    smile_log = current_user.smile_logs.build(
      journal_entry: params[:journal_entry],
      overall_score: rand(60..100) # 60点から100点のランダムなスコア
    )

    if smile_log.save
      render json: smile_log, status: :created
    else
      render json: smile_log.errors, status: :unprocessable_entity
    end
  end

  def index
  end
end
