class CreateSmileLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :smile_logs do |t|
      t.references :user, null: false, foreign_key: true
      t.text :journal_entry, null: true

      t.decimal :overall_score, precision: 16, scale: 2, default: 0, null: false

      # プレミアムプラン導入時使用
      t.integer :score_details_id

      t.timestamps
    end
  end
end
