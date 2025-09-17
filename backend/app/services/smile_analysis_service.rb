# Google Cloud Visionライブラリを読み込む
require "google/cloud/vision/v1"

class SmileAnalysisService
  def initialize(image_file)
    @image_file = image_file
  end

  # 分析とスコアリングを実行するメインのメソッド
  def call
    # 1. Google Cloud Vision APIに画像を送信し、顔検出をリクエスト
    image_annotator = Google::Cloud::Vision::V1::ImageAnnotator::Client.new
    response = image_annotator.face_detection(image: @image_file.path)

    # 最初の顔の分析結果を取得（顔が検出されなかった場合はnil）
    face = response.face_annotations.first
    return {} unless face # 顔が検出されなければ空のハッシュを返す

    # 2. 要件定義書に基づき、APIのレスポンスから各種スコアを算出
    scores = {
      happiness_score:      calculate_happiness_score(face.joy_likelihood),
      eye_brilliance_score: calculate_eye_brilliance_score(face.joy_likelihood),
      confidence_score:     calculate_confidence_score(face.roll_angle, face.landmarks),
      warmth_score:         calculate_warmth_score(face.joy_likelihood, face.anger_likelihood),
      energy_level_score:   calculate_energy_level_score(face.landmarks)
    }

    # 3. 総合スコアを重み付け計算で算出
    scores[:overall_score] = (
      scores[:happiness_score]      * 0.4 +
      scores[:eye_brilliance_score] * 0.3 +
      scores[:confidence_score]     * 0.15 +
      scores[:warmth_score]         * 0.1 +
      scores[:energy_level_score]   * 0.05
    ).round

    # 4. フィードバックを生成(ただし，簡易的である)
    scores[:feedback] = generate_feedback(scores)

    scores
  end

  private

  # likeliness（感情の確信度）を0-100の点数に変換するヘルパーメソッド
  def likeliness_to_score(likeliness)
    case likeliness
    when :VERY_LIKELY then 100
    when :LIKELY      then 80
    when :POSSIBLE    then 60
    when :UNLIKELY    then 40
    when :VERY_UNLIKELY then 10
    else 0
    end
  end

  # 仕様書通りのアルゴリズム（要改善）
  def calculate_happiness_score(joy_likelihood)
    likeliness_to_score(joy_likelihood)
  end

  def calculate_eye_brilliance_score(joy_likelihood)
    # joyLikelihoodが高いほど、デュシェンヌ・スマイル（心からの笑顔）と見なす
    score = likeliness_to_score(joy_likelihood)
    score > 60 ? score : score / 2 # 喜びの度合いが低い場合はスコアを半減させる
  end

  def calculate_confidence_score(roll_angle, landmarks)
    # 顔の傾きが小さいほど高スコア
    angle_score = 100 - (roll_angle.abs * 5)

    # 左右の口角のY座標が近いほど高スコア（対称性）
    mouth_left = landmarks.find { |l| l.type == :MOUTH_LEFT }
    mouth_right = landmarks.find { |l| l.type == :MOUTH_RIGHT }
    symmetry_score = 100 - ((mouth_left.position.y - mouth_right.position.y).abs * 10)

    # 傾きと対称性の平均点を自信度とする
    final_score = ([angle_score, symmetry_score].sum / 2).round
    [0, final_score].max # マイナス点にならないように0点以上を保証
  end

  def calculate_warmth_score(joy_likelihood, anger_likelihood)
    # 穏やかな喜びであり、かつ怒りの表情がない場合に高スコア
    joy_score = likeliness_to_score(joy_likelihood)
    anger_penalty = likeliness_to_score(anger_likelihood)

    # 喜びスコアから怒りスコアの半分を引くことで、穏やかさを表現
    final_score = joy_score - (anger_penalty / 2)
    [0, final_score].max
  end

  def calculate_energy_level_score(landmarks)
    # 上唇と下唇の距離（口の開き具合）でエナジーを判定
    upper_lip = landmarks.find { |l| l.type == :UPPER_LIP }
    lower_lip = landmarks.find { |l| l.type == :LOWER_LIP }

    # 距離が大きいほど高スコア
    distance = (upper_lip.position.y - lower_lip.position.y).abs
    final_score = (distance * 5).round
    [final_score, 100].min # 100点を超えないようにする
  end

  # 簡易フィードバック生成メソッド
  def generate_feedback(scores)
    # 最も点数が高かった項目を見つける
    best_point = scores.except(:overall_score).max_by { |_, score| score }
    
    case best_point.first # best_point.first は :happiness_score などのキー
    when :happiness_score
      "心からのハッピーな気持ちが表情全体から伝わってきます！"
    when :eye_brilliance_score
      "特に目元の輝きが素晴らしいですね！心からの笑顔です！"
    when :confidence_score
      "自信に満ち溢れた、堂々とした素敵な笑顔です！"
    when :warmth_score
      "見る人を安心させるような、温かい優しさが感じられます。"
    when :energy_level_score
      "エネルギッシュで、周りを元気にする力強い笑顔です！"
    else
      "今日も素敵な笑顔ですね！"
    end
  end
end
