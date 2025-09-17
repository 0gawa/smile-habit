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
      update_user_stats(current_user, smile_log.overall_score)
      render json: smile_log, status: :created
    else
      render json: smile_log.errors, status: :unprocessable_entity
    end
  end

  def index
    smile_logs = current_user.smile_logs.order(created_at: :desc)
    render json: smile_logs
  end

  private

  def update_user_stats(user, new_score)
    # ユーザーの累計スコアを更新
    user.increment!(:total_score, new_score)

    # 新しい累計スコアで到達可能な最高ランクを取得
    new_rank = SmileRank.where('required_score <= ?', user.total_score).order(required_score: :desc).first

    # ユーザーの現在のランクと新しいランクが異なれば更新
    if new_rank.present? && user.smile_rank_id != new_rank.id
      user.update!(smile_rank: new_rank)
    end
  end
end
