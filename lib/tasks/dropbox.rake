desc 'Authenticate dropbox account'
namespace :dropbox do
	task :authenticate => :environment do
	  require 'dropbox_sdk'
	  require 'dropbox-api'
	  require "#{Rails.root}/config/initializers/dropbox"
	  
	  APP_KEY = Dropbox::API::Config.app_key
		APP_SECRET = Dropbox::API::Config.app_secret

		flow = DropboxOAuth2FlowNoRedirect.new(APP_KEY, APP_SECRET)
	  authorize_url = flow.start()

		# Have the user sign in and authorize this app
		puts '1. Go to: ', authorize_url
		puts '2. Click "Allow" (you might have to log in first)'
		puts '3. Copy the authorization code'
		print 'Enter the authorization code here: '
		code = STDIN.gets.strip

		access_token, user_id = flow.finish(code)
		client = DropboxClient.new(access_token)
		ENV['DROPBOX_ACCESS_TOKEN'] = access_token
		DropboxToken.create token: ENV['DROPBOX_ACCESS_TOKEN']
		puts 'success'
	end
end