namespace :db do
	require 'sidekiq/api'
	task :clear_activity => :environment do
		Activity.destroy_all
	end

	task :clear_facility => :environment do
		Facility.destroy_all
	end


	task :import => :environment do
		#Sidekiq::ScheduledSet.new.clear
		DropboxWorker.perform
	end
end

