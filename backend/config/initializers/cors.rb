Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*' # In production, you should change this to your frontend's domain

    resource '*',
      headers: :any,
      expose: ['access-token', 'expiry', 'token-type', 'uid', 'client'], # This line is crucial
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
