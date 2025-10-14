require 'rails_helper'

RSpec.describe "Api::V1::SmileLogs", type: :request do
  describe "POST /api/v1/smile_logs" do
    let(:user) { create(:user) }
    let(:auth_headers) { user.create_new_auth_token } # 認証ヘッダーを生成
    let(:valid_photo) { fixture_file_upload(Rails.root.join('spec', 'fixtures', 'high_score_smile_exp1.jpeg'), 'image/jpeg') }

    context "認証済みのユーザーの場合" do
      context "今日まだチャレンジを完了していない場合" do
        it "新しい笑顔ログを作成できること" do
          analysis_result = { overall_score: 85, happiness_score: 90, eye_brilliance_score: 80, confidence_score: 75, warmth_score: 88, energy_level_score: 70, feedback: "Great smile!" }
          allow_any_instance_of(SmileAnalysisService).to receive(:call).and_return(analysis_result)

          post api_v1_smile_logs_path, params: { photo: valid_photo }, headers: auth_headers
          expect(response).to have_http_status(:created)
          expect(JSON.parse(response.body)['overall_score'].to_i).to be_a(Numeric)
        end
      end

      context "今日既にチャレンジを完了している場合（エッジケース）" do
        before do
          # 今日の日付で、既にログを1件作成しておく
          create(:smile_log, user: user, created_at: Time.zone.now)
        end

        it "新しい笑顔ログを作成できず、403エラーが返ること" do
          post api_v1_smile_logs_path, params: { photo: valid_photo }, headers: auth_headers
          expect(response).to have_http_status(:forbidden)
        end
      end
    end

    context "未認証のユーザーの場合（エッジケース）" do
      it "401 Unauthorizedエラーが返ること" do
        post api_v1_smile_logs_path, params: { photo: valid_photo }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
