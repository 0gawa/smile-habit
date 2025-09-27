class Api::V1::SmileLogsController < ApplicationController
  before_action :authenticate_user!
  before_action :check_if_already_completed, only: [:create]
  before_action :set_smile_log, only: [:show, :update]

  def show
    photo_url = @smile_log.photo.attached? ? url_for(@smile_log.photo) : nil

    render json: {
      id: @smile_log.id,
      date: @smile_log.created_at.to_date.to_s,
      overall_score: @smile_log.overall_score,
      journal_entry: @smile_log.journal_entry,
      photo_url: photo_url,
      # score_detailはPremiumプランで実装
      # feedbackはサービスオブジェクトが生成するため、ここでは返さない
    }
  end

  def create
    unless params[:photo].present?
      render json: { errors: "Photo is required" }, status: :unprocessable_content
      return
    end

    analysis_result = SmileAnalysisService.new(params[:photo]).call

    # 分析結果が空（顔検出失敗）の場合はエラーを返す
    if analysis_result.empty?
      render json: { errors: "Could not detect a face in the image" }, status: :unprocessable_content
      return
    end

    ActiveRecord::Base.transaction do
      @smile_log = current_user.smile_logs.create!(
        journal_entry: params[:journal_entry],
        photo: params[:photo],
        overall_score: analysis_result[:overall_score]
      )

      @smile_log.create_score_detail!(
        happiness_score:      analysis_result[:happiness_score],
        eye_brilliance_score: analysis_result[:eye_brilliance_score],
        confidence_score:     analysis_result[:confidence_score],
        warmth_score:         analysis_result[:warmth_score],
        energy_level_score:   analysis_result[:energy_level_score]
      )

      update_user_stats(current_user, @smile_log.overall_score)
    end

    render json: {
      id: @smile_log.id,
      overall_score: @smile_log.overall_score,
      feedback: analysis_result[:feedback]
    }, status: :created
  end

  def index
    smile_logs = current_user.smile_logs.order(created_at: :desc)
    render json: smile_logs
  end

  def update
    if @smile_log.update(smile_log_params)
      render json: @smile_log, status: :ok
    else
      render json: { errors: @smile_log.errors.full_messages }, status: :unprocessable_entity
    end
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

  def check_if_already_completed
    if current_user.smile_logs.where("DATE(created_at) = ?", Time.zone.now.to_date).exists?
      render json: { errors: ["本日のチャレンジは既に完了しています。"] }, status: :forbidden
    end
  end

  def set_smile_log
    @smile_log = current_user.smile_logs.find(params[:id])
  end
  
  def smile_log_params
    params.require(:smile_log).permit(:journal_entry)
  end
end
