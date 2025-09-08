class CreateSmileRanks < ActiveRecord::Migration[8.0]
  def change
    create_table :smile_ranks do |t|
      t.string :name
      t.bigint :required_score

      t.timestamps
    end
  end
end
