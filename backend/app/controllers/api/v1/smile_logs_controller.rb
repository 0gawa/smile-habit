class Api::V1::SmileLogsController < ApplicationController
  before_action :authenticate_user!

  def create
    smile_log = current_user.smile_logs.build(smile_log_params)
    
    # AI分析はまだなので、一旦ダミーのスコアを入れる
    smile_log.overall_score = rand(60..100)

    if smile_log.save
      render json: smile_log, status: :created
    else
      render json: smile_log.errors, status: :unprocessable_entity
    end
  end

  def index
  end

  private

  def smile_log_params
    params.permit(:photo, :journal_entry)
  end
end
