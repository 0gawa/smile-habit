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

    first_response = response.responses.first

    # 応答が空、またはエラーがある場合は、早期にリターンします。
    return {} if first_response.nil? || first_response.error.present?

    # 最初の顔の分析結果を取得（顔が検出されなかった場合はnil）
    face = first_response.face_annotations.first
    return {} unless face # 顔が検出されなければ空のハッシュを返す

    # 2. 要件定義書に基づき、APIのレスポンスから各種スコアを算出
    scores = {
      happiness_score:      calculate_happiness_score(face.joy_likelihood),
      eye_brilliance_score: calculate_eye_brilliance_score(face.joy_likelihood, face.landmarks),
      confidence_score:     calculate_confidence_score(face.roll_angle, face.landmarks),
      warmth_score:         calculate_warmth_score(face.joy_likelihood, face.anger_likelihood),
      energy_level_score:   calculate_energy_level_score(face.landmarks)
    }

    # 3. 総合スコアを重み付け計算で算出
    overall_score = (
      scores[:happiness_score]      * 0.4 +
      scores[:eye_brilliance_score] * 0.3 +
      scores[:confidence_score]     * 0.15 +
      scores[:warmth_score]         * 0.1 +
      scores[:energy_level_score]   * 0.05
    )

    # 信頼度で総合スコアを調整
    adjustment_factor = ((face.detection_confidence || 0.5) + (face.landmarking_confidence || 0.5)) / 2.0
    scores[:overall_score] = (overall_score * adjustment_factor).round
    
    # 4. スコアに基づいてフィードバックを生成
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

  # 以下、要件定義書のアルゴリズムに基づく各スコアの計算メソッド

  def calculate_happiness_score(joy_likelihood)
    likeliness_to_score(joy_likelihood)
  end

  def calculate_eye_brilliance_score(joy_likelihood, landmarks)
    joy_score = likeliness_to_score(joy_likelihood)
    squint_score = calculate_eye_squint_score(landmarks)

    score = joy_score > 60 ? joy_score : joy_score / 2.0

    if squint_score && squint_score > 50
      # Add a bonus for genuine eye smile, up to 20 points
      score += (squint_score - 50) * 0.4
    end

    [100, score].min.round
  end

  def calculate_confidence_score(roll_angle, landmarks)
    angle_score = 100 - (roll_angle.abs * 5)

    mouth_left = landmarks.find { |l| l.type == :MOUTH_LEFT }
    mouth_right = landmarks.find { |l| l.type == :MOUTH_RIGHT }

    base_scores = [angle_score]
    if mouth_left && mouth_right
      base_scores << (100 - ((mouth_left.position.y - mouth_right.position.y).abs * 10))
    end

    base_confidence = (base_scores.sum / base_scores.size.to_f) * 0.8

    eye_squint_score = calculate_eye_squint_score(landmarks)
    eye_confidence = (eye_squint_score || 0) * 0.2

    final_score = base_confidence + eye_confidence
    [0, final_score.round].max
  end

  def calculate_eye_squint_score(landmarks)
    left_eye_top = landmarks.find { |l| l.type == :LEFT_EYE_TOP_BOUNDARY }
    left_eye_bottom = landmarks.find { |l| l.type == :LEFT_EYE_BOTTOM_BOUNDARY }

    if left_eye_top && left_eye_bottom
      left_eye_aperture = (left_eye_top.position.y - left_eye_bottom.position.y).abs
      score = 100 - (left_eye_aperture * 10)
      return [0, [score, 100].min].max.round
    end

    nil
  end

  def calculate_warmth_score(joy_likelihood, anger_likelihood)
    joy_score = likeliness_to_score(joy_likelihood)
    anger_penalty = likeliness_to_score(anger_likelihood)

    final_score = joy_score - (anger_penalty / 2)
    [0, final_score].max
  end

  def calculate_energy_level_score(landmarks)
    upper_lip = landmarks.find { |l| l.type == :UPPER_LIP }
    lower_lip = landmarks.find { |l| l.type == :LOWER_LIP }
    return 50 unless upper_lip && lower_lip # ランドマークがなければデフォルト値を返す

    distance = (upper_lip.position.y - lower_lip.position.y).abs
    final_score = (distance * 5).round
    [final_score, 100].min
  end
  
  def generate_feedback(scores)
    best_point = scores.except(:overall_score).max_by { |_, score| score }
    
    case best_point.first
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
