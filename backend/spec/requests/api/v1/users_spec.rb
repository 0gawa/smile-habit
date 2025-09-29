require 'rails_helper'

RSpec.describe "Api::V1::Users", type: :request do
  describe "GET /api/v1/users/search" do
    let(:main_user) { create(:user, :confirmed) }
    let(:auth_headers) { main_user.create_new_auth_token }

    # テスト用のユーザーたちを作成
    let!(:friend_user) { create(:user, :confirmed, nickname: '既存フレンド') }
    let!(:searchable_user_1) { create(:user, :confirmed, nickname: '検索対象A') }
    let!(:searchable_user_2) { create(:user, :confirmed, nickname: '検索対象B') }
    let!(:unrelated_user) { create(:user, :confirmed, nickname: '無関係ユーザー') }

    before do
      # main_userがfriend_userをフォローしている状態を作る
      main_user.follow(friend_user)
    end

    context "認証済みのユーザーの場合" do
      context "有効な検索クエリを送信した場合" do
        it "クエリに一致し、かつ自分自身とフレンド以外のユーザーを返すこと" do
          get search_api_v1_users_path, params: { query: '検索対象' }, headers: auth_headers

          expect(response).to have_http_status(:ok)
          expect(json.length).to eq(2)
          expect(json.map { |u| u['nickname'] }).to include('検索対象A', '検索対象B')
          expect(json.map { |u| u['nickname'] }).not_to include('あなた', '既存フレンド', '無関係ユーザー')
        end
      end

      context "検索結果が0件のクエリを送信した場合" do
        it "空の配列を返すこと" do
          get search_api_v1_users_path, params: { query: '存在しない名前' }, headers: auth_headers
          expect(response).to have_http_status(:ok)
          expect(json).to be_empty
        end
      end

      context "短すぎる検索クエリを送信した場合（エッジケース）" do
        it "空の配列を返すこと" do
          get search_api_v1_users_path, params: { query: 'A' }, headers: auth_headers
          expect(response).to have_http_status(:ok)
          expect(json).to be_empty
        end
      end

      context "検索クエリがない場合（エッジケース）" do
        it "空の配列を返すこと" do
          get search_api_v1_users_path, headers: auth_headers
          expect(response).to have_http_status(:ok)
          expect(json).to be_empty
        end
      end
    end

    context "未認証のユーザーの場合（エッジケース）" do
      it "401 Unauthorizedエラーが返ること" do
        get search_api_v1_users_path, params: { query: '検索対象' }
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
