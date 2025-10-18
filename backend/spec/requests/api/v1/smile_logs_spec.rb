require 'rails_helper'

RSpec.describe "Api::V1::SmileLogs", type: :request do
  let(:user) { create(:user, :confirmed) }
  let(:auth_headers) { user.create_new_auth_token }

  describe "GET /api/v1/smile_logs/:id" do
    let(:smile_log) { create(:smile_log, user: user, journal_entry: "Had a great day!") }

    it "笑顔ログの詳細を取得できること" do
      get api_v1_smile_log_path(smile_log), headers: auth_headers
      expect(response).to have_http_status(:ok)
      expect(json['id']).to eq(smile_log.id)
      expect(json['journal_entry']).to eq("Had a great day!")
    end
  end

  describe "PUT /api/v1/smile_logs/:id" do
    let(:smile_log) { create(:smile_log, user: user) }

    it "笑顔ログのメモを更新できること" do
      put api_v1_smile_log_path(smile_log), params: { smile_log: { journal_entry: "Updated memo" } }, headers: auth_headers
      expect(response).to have_http_status(:ok)
      expect(smile_log.reload.journal_entry).to eq("Updated memo")
    end
  end

  describe "POST /api/v1/smile_logs" do
    let(:valid_photo) { fixture_file_upload(Rails.root.join('spec', 'fixtures', 'high_score_smile_exp1.jpeg'), 'image/jpeg') }

    context "認証済みのユーザーの場合" do
      context "今日まだチャレンジを完了していない場合" do
        it "新しい笑顔ログを作成できること" do
          analysis_result = { overall_score: 85, happiness_score: 90, eye_brilliance_score: 80, confidence_score: 75, warmth_score: 88, energy_level_score: 70, feedback: "Great smile!" }
          allow_any_instance_of(SmileAnalysisService).to receive(:call).and_return(analysis_result)

          post api_v1_smile_logs_path, params: { photo: valid_photo, journal_entry: "First entry" }, headers: auth_headers
          expect(response).to have_http_status(:created)
          expect(json['overall_score'].to_i).to be_a(Numeric)
          expect(user.smile_logs.first.journal_entry).to eq("First entry")
        end
      end

      context "今日既にチャレンジを完了している場合（エッジケース）" do
        before do
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
