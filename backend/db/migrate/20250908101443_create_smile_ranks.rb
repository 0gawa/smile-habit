class CreateSmileRanks < ActiveRecord::Migration[8.0]
  def change
    create_table :smile_ranks do |t|
      t.string :name, null: false
      t.bigint :required_score, null: false

      t.timestamps
    end
  end
end
