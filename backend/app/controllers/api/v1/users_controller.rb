class Api::V1::UsersController < ApplicationController
  def search
    query = params[:query]
    if query.present? && query.length >= 2
      # 自分自身と既にフレンドのユーザーは検索結果から除外する
      current_friends_ids = current_user.following.ids
      users_to_exclude = [current_user.id] + current_friends_ids
      
      users = User.where('nickname LIKE ?', "%#{query}%").where.not(id: users_to_exclude).limit(10)
      render json: users.map { |user| { id: user.id, nickname: user.nickname } }
    else
      render json: []
    end
  end
end
