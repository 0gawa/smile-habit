DeviseTokenAuth.setup do |config|
  config.change_headers_on_each_request = true

  config.batch_request_buffer_throttle = 0.seconds

  config.token_cost = Rails.env.test? ? 4 : 10
end
