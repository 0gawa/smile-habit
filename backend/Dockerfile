FROM ruby:3.2.2

RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs yarn

WORKDIR /app

COPY Gemfile Gemfile.lock ./

# --jobs 4 で並列処理して高速化
RUN bundle install --jobs 4

COPY . .

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

EXPOSE 3000

CMD ["rails", "server", "-b", "0.0.0.0"]
