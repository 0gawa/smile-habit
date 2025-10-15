require 'rails_helper'

RSpec.describe "Api::V1::Mypages", type: :request do
  let(:user) { create(:user) }
  let(:headers) { user.create_new_auth_token }

  describe "PATCH /api/v1/mypage" do
    context "with valid parameters" do
      let(:valid_params) do
        {
          user: {
            nickname: "New Nickname"
          }
        }
      end

      it "updates the user's nickname" do
        patch "/api/v1/mypage", headers: headers, params: valid_params
        expect(response).to have_http_status(:ok)
        expect(user.reload.nickname).to eq("New Nickname")
      end

      it "attaches an image" do
        image = fixture_file_upload(Rails.root.join('spec', 'fixtures', 'images', 'test.png'), 'image/png')
        patch "/api/v1/mypage", headers: headers, params: { user: { image: image } }
        expect(response).to have_http_status(:ok)
        expect(user.reload.image).to be_attached
      end
    end

    context "with invalid parameters" do
      let(:invalid_params) do
        {
          user: {
            nickname: ""
          }
        }
      end

      it "does not update the user and returns an error" do
        patch "/api/v1/mypage", headers: headers, params: invalid_params
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
