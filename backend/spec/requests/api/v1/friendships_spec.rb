require 'rails_helper'

RSpec.describe "Api::V1::Friendships", type: :request do
  let(:user) { create(:user, :confirmed) }
  let(:other_user) { create(:user, :confirmed) }
  let(:auth_headers) { user.create_new_auth_token }

  describe "GET /api/v1/friendships" do
    context "認証済みのユーザーの場合" do
      it "自分がフォローしているユーザー（フレンド）の一覧を返すこと" do
        user.follow(other_user)
        get api_v1_friendships_path, headers: auth_headers
        
        expect(response).to have_http_status(:ok)
        expect(json.length).to eq(1)
        expect(json[0]['id']).to eq(other_user.id)
      end
    end

    context "未認証のユーザーの場合（エッジケース）" do
      it "401 Unauthorizedエラーが返ること" do
        get api_v1_friendships_path
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/v1/friendships" do
    context "認証済みのユーザーの場合" do
      it "指定したユーザーをフォロー（フレンド追加）できること" do
        expect {
          post api_v1_friendships_path, params: { followed_id: other_user.id }, headers: auth_headers
        }.to change(user.following, :count).by(1)
        
        expect(response).to have_http_status(:created)
      end

      it "既にフォローしているユーザーを再度フォローしようとしても、フレンド数は変わらないこと（エッジケース）" do
        user.follow(other_user)
        expect {
          post api_v1_friendships_path, params: { followed_id: other_user.id }, headers: auth_headers
        }.not_to change(user.following, :count)
        
        expect(response).to have_http_status(:created) # 멱등性を保つため、エラーにはしない
      end

      it "自分自身をフォローしようとしてもできないこと（エッジケース）" do
        expect {
          post api_v1_friendships_path, params: { followed_id: user.id }, headers: auth_headers
        }.not_to change(user.following, :count)
        
        expect(response).to have_http_status(:created)
      end
    end
  end

  describe "DELETE /api/v1/friendships/:id" do
    before do
      user.follow(other_user)
    end
    
    context "認証済みのユーザーの場合" do
      it "指定したユーザーのフォローを解除（フレンド削除）できること" do
        expect {
          delete api_v1_friendship_path(other_user.id), headers: auth_headers
        }.to change(user.following, :count).by(-1)
        
        expect(response).to have_http_status(:no_content)
      end
    end

    context "フォローしていないユーザーを解除しようとした場合（エッジケース）" do
      let(:unfollowed_user) { create(:user, :confirmed) }
      
      it "フレンド数は変わらず、正常なレスポンスが返ること" do
        expect {
          delete api_v1_friendship_path(unfollowed_user.id), headers: auth_headers
        }.not_to change(user.following, :count)
        
        expect(response).to have_http_status(:no_content)
      end
    end
  end
end
