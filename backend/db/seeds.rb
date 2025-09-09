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
