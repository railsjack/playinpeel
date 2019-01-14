class DropboxWorker
  include Mongoid::Document
  #include Sidekiq::Worker

	require 'dropbox_sdk'


	@@client = DropboxClient.new(DropboxToken.last[:token])
	@@root_path = '/PlayInPeelAutoImport'
	@@imported_prefix = '-(imported)'


	class << self
		def perform
			get_facility
			get_activity
		end
		def get_activity
		get_activity_files.each do |path|
			next unless path.index(@@imported_prefix)==nil
			file = get_file(path)
			next if file == nil?
			get_csv(file).each do |row|
				next if row['Days']==nil
				age_start = valid_s(row['Age.Start']).to_i
				age_end = valid_s(row['Age.End']).to_i

				activity_data = ({
					FacilityName: encode(row['Facility']),
					Name: encode(row['Activity.Name']),
					Description: encode(row['Description']),
					AgeFrom: age_start,
					AgeTo: age_end,
					Code: row['Activity.Code'],
					DropIn: (row['Drop.In']=='Yes')?true:false,
					Fee: row['Fee'].to_f,
					FeeDescription: encode(row['Fee.Description']),
					Times: get_times({
						days: row['Days'],
						start: {
							date: row['Start.Date'],
							time: row['Start.Time']
						},
						:'end' => {
							date: row['End.Date'],
							time: row['End.Time']
						}
					})
				})
				#puts activity_data
				Activity.create activity_data
			end
			imported_file = "#{path}#{@@imported_prefix}"
			begin 
				@@client.file_delete imported_file 
			rescue
			end
			@@client.file_move path, imported_file
		end
		return true
		end

		def get_facility
		get_facility_files.each do |path|
			next unless path.index(@@imported_prefix)==nil
			file = get_file(path)
			next if file == nil?
			get_csv(file).each do |row|
				Facility.create({
					Name: encode(row['Facility Name']),
					Aliases: encode(row['Aliases (optional)']),
					Address: encode(row['Full Address']),
					City: encode(row['City']),
					Phone: encode(row['Phone']),
					Lat: row['Latitude'].to_f,
					Lon: row['Longitude'].to_f,
					Organization: encode(row['Organization'])
				})
			end
			imported_file = "#{path}#{@@imported_prefix}"
			begin 
				@@client.file_delete imported_file 
			rescue
			end
			@@client.file_move path, imported_file
		end
		return true
		end

		private

		def rm_dropbox_file(path)
			@@client.file_delete(path)
		end

		def get_csv(contents)
			return CSV.parse(contents, :headers => true)
		end

		def get_activity_files
			search_files(@@root_path, 'activities .csv')
		end

		def get_facility_files
			search_files(@@root_path, 'facilities .csv')
		end

		def search_files(path, pattern)
			paths = []
			@@client.search(path, pattern).each do |f|
				paths << f['path']
			end
			paths
		end

		def get_file(from_file)
			begin
				contents = @@client.get_file(from_file)
				return contents
			rescue
				return nil
			end
		end

		def get_times(params, row={})
			days = params[:days]
			times = {}

			days = ['M','Tu','W','Th','F','Sa','Su']
			days1 = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

			#row = {Days: 'M, Tu-F, Su'}
			input = params[:days]

			ret_false = {
				_id: 0,
				"Monday" => false,
				"Tuesday" => false,
				"Wednesday" => false,
				"Thursday" => false,
				"Friday" => false,
				"Saturday" => false,
				"Sunday" => false,
			}

			times = ret_false
			if input == nil
				#binding.pry
			end
	    if input.upcase == 'DAILY'
	        days1.each do |day|
	            times[day] = true
	        end
	    else
				input.split(', ').each do |r|
			        unless days.index(r) == nil
			            times["#{days1[days.index(r)]}"] = true
			        else
			            unless r.index('-') == nil
			                rr = r.split('-')
			                if rr.count==2 and days.index(rr[0])!=nil and days.index(rr[1])!=nil
			                    days1[days.index(rr[0])..days.index(rr[1])].each do |day|
			                        times["#{day}"] = true
			                    end
			                end
			            end
			        end
			    end
			end

			ampm = params[:start][:time].last(2).upcase
			dt = "#{strpdate(params[:start][:date])}T#{params[:start][:time]}"

			if ampm == "AM" || ampm == "PM"
				times[:StartDate] = DateTime::strptime(dt,  '%Y-%m-%dT%H:%M %p')
			else
				times[:StartDate] = DateTime::strptime(dt,  '%Y-%m-%dT%H:%M')
			end

			times[:TimeOfDay] = times[:StartDate].strftime('%p')

			ampm = params[:end][:time].last(2).upcase
			dt = "#{strpdate(params[:end][:date])}T#{params[:end][:time]}"

			if ampm == "AM" || ampm == "PM"
				times[:EndDate] = DateTime::strptime(dt,  '%Y-%m-%dT%H:%M %p')
			else
				times[:EndDate] = DateTime::strptime(dt,  '%Y-%m-%dT%H:%M')
			end

			

			times
		end

		def strpdate(date_s)
			return date_s if date_s.size == 10
			"20#{date_s}"
		end

		def valid_s(val)
			return "" if val == nil
			val.to_s
		end

		def encode(s)
			return "" if s==nil
			return s.force_encoding('UTF-8')
		end

	end
end
