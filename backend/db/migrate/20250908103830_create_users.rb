class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :nickname, null: false

      t.time :notification_time, default: '08:00:00'
      t.boolean :is_saved, default: false, null: false

      t.string :provider
      t.string :uid
      t.string :email, null: false

      t.integer :duration, default: 0, null: false

      t.decimal :rank_judge_yearly_score, default: 0, precision: 16, null: false, scale: 2
      t.decimal :total_score, default: 0, null: false, precision: 16, scale: 2

      t.references :smile_rank, null: false, foreign_key: true

      t.timestamps
    end
    add_index :users, [:uid, :provider], unique: true
    add_index :users, :email, unique: true
  end
end
