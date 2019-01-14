namespace :sidekiq do
	require 'sidekiq/api'
	task :clear do
		Sidekiq::ScheduledSet.new.clear
		puts 'cleared all jobs from sidekiq...'
	end
end