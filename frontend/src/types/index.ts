// ユーザーのランク情報を表す型
export interface SmileRank {
  name: string;
  image_url: string | null;
}

// ユーザーオブジェクト全体の型
export interface User {
  name?: string; // 名前 (オプショナル)
  nickname: string;
  image_url?: string | null; // プロフィール画像のURL (オプショナル)
  total_score: number;
  smile_rank: SmileRank | null;
}
