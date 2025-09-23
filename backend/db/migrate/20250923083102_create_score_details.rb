class CreateScoreDetails < ActiveRecord::Migration[8.0]
  def change
    create_table :score_details do |t|
      t.references :smile_log, null: false, foreign_key: true
      t.integer :happiness_score
      t.integer :eye_brilliance_score
      t.integer :confidence_score
      t.integer :warmth_score
      t.integer :energy_level_score

      t.timestamps
    end
  end
end
