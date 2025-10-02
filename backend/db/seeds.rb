puts 'Seeding database...'

ranks = [
  { name: 'ブロンズ', required_score: 0 },
  { name: 'シルバー', required_score: 1000 },
  { name: 'ゴールド', required_score: 5000 },
  { name: 'プラチナ', required_score: 15000 },
  { name: 'ダイヤモンド', required_score: 50000 }
]

puts 'ランクデータの投入を開始...'
ranks.each do |rank_data|
  SmileRank.find_or_create_by!(name: rank_data[:name]) do |r|
    r.required_score = rank_data[:required_score]
  end
end
puts 'ランクデータの投入が完了しました！'

ActiveRecord::Base.transaction do
  puts 'Creating smile ranks...'
  bronze_rank = SmileRank.find_or_create_by!(name: 'ブロンズ') { |r| r.required_score = 0 }
  bronze_rank.image.attach(io: File.open(Rails.root.join('assets/images/bronze.png')), filename: 'bronze.png') unless bronze_rank.image.attached?

  silver_rank = SmileRank.find_or_create_by!(name: 'シルバー') { |r| r.required_score = 1000 }
  gold_rank   = SmileRank.find_or_create_by!(name: 'ゴールド') { |r| r.required_score = 5000 }

  puts 'Creating test users...'
  main_user = User.find_or_create_by!(email: 'main_user@example.com') do |u|
    u.nickname   = 'あなた'
    u.password   = 'password'
    u.smile_rank = bronze_rank
    u.confirmed_at = Time.current # メール認証済み状態にする
  end

  friend_a = User.find_or_create_by!(email: 'friend_a@example.com') do |u|
    u.nickname   = 'フレンドA'
    u.password   = 'password'
    u.smile_rank = silver_rank
    u.confirmed_at = Time.current
  end

  friend_b = User.find_or_create_by!(email: 'friend_b@example.com') do |u|
    u.nickname   = 'フレンドB'
    u.password   = 'password'
    u.smile_rank = bronze_rank
    u.confirmed_at = Time.current
  end

  follower_c = User.find_or_create_by!(email: 'follower_c@example.com') do |u|
    u.nickname   = 'フォロワーC'
    u.password   = 'password'
    u.smile_rank = bronze_rank
    u.confirmed_at = Time.current
  end

  searchable_d = User.find_or_create_by!(email: 'searchable_d@example.com') do |u|
    u.nickname   = '検索可能なユーザーD'
    u.password   = 'password'
    u.smile_rank = gold_rank
    u.confirmed_at = Time.current
  end

  puts 'Building friendships...'
  # あなたがフレンドAとBをフォロー
  main_user.follow(friend_a) unless main_user.following.include?(friend_a)
  main_user.follow(friend_b) unless main_user.following.include?(friend_b)

  # フォロワーCがあなたをフォロー
  follower_c.follow(main_user) unless follower_c.following.include?(main_user)

  puts 'Creating smile logs for scores...'
  [main_user, friend_a, friend_b, follower_c, searchable_d].each do |user|
    next if user.smile_logs.exists?

    log = user.smile_logs.create!(
      overall_score: rand(60..100),
      created_at: rand(1..5).days.ago
    )
    user.update!(total_score: log.overall_score)
  end

end

puts 'Seeding finished!'
