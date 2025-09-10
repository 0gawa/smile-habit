class Api::V1::SmileLogsController < ApplicationController
  before_action :authenticate_user!

  def create
    unless params[:photo].present?
      render json: { errors: "Photo is required" }, status: :unprocessable_entity
      return
    end

    analysis_result = SmileAnalysisService.new(params[:photo]).call

    # 分析結果が空（顔検出失敗）の場合はエラーを返す
    if analysis_result.empty?
      render json: { errors: "Could not detect a face in the image" }, status: :unprocessable_entity
      return
    end

    # 分析結果とジャーナルの内容でSmileLogを作成
    smile_log = current_user.smile_logs.build(
      journal_entry: params[:journal_entry],
      photo: params[:photo],
      overall_score: analysis_result[:overall_score],
      happiness_score: analysis_result[:happiness_score],
      eye_brilliance_score: analysis_result[:eye_brilliance_score],
      confidence_score: analysis_result[:confidence_score],
      warmth_score: analysis_result[:warmth_score],
      energy_level_score: analysis_result[:energy_level_score]
    )

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
