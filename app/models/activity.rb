class Activity
  include Mongoid::Document
  include Mongoid::Timestamps

  before_save :before_save

  field :FacilityName
  field :Name
  field :Description
  field :AgeFrom
  field :AgeTo
  field :Code
  field :DropIn
  field :Times
  field :Fee
  field :FeeDescription

  field :location, type: Array
  index({location: '2d'})

  def self.search(params)
    params_default = { #params_default
      'lat'=> '47.982200622558594',
      'lon'=> '-66.40912628173828',
      'rd'=> '100',
      'ageFrom'=> '0',
      'ageTo'=> '660',
      'dateFrom'=> '6-12-1999',
      'dateTo'=> '6-12-2020',
      'k'=> '',
      'days'=> 'true,true,true,true,true,true,true',
      'timesOfDay'=> 'true,true',
      'activityTypes'=> 'true,false',
      'sortby'=> '1',
      'skip'=> '0',
      'take'=>'20'
    }

    puts 'params'
    puts params

    days = params['days'].split(',')
    days_array = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    days_condition = []
    days.each_with_index do |day, index|
      days_condition << {"Times.#{days_array[index]}" => true} if day == 'true'
    end

    r = params['timesOfDay'].split(',')
    timesOfDay = [to_b(r[0]) ? 'AM':nil, to_b(r[1]) ? 'PM':nil]

    r = params['activityTypes'].split(',')
    activityTypes = [!to_b(r[0]), to_b(r[1])]


    primary_conditions = [
      {
        "$or"=>[
          "Times.StartDate"=>{"$gte"=>Date.strptime(params['dateFrom'],'%m-%d-%Y')},
          "Times.EndDate"=>{"$lte"=>Date.strptime(params['dateTo'],'%m-%d-%Y')}
        ]
      },
      {
        "$or"=>[
          "AgeFrom" => {"$gte"=>params['ageFrom'].to_i},
          "AgeTo" => {"$lte"=>params['ageTo'].to_i}
        ]
      },
      {"Times.TimeOfDay" => { "$in" => timesOfDay } },
      {"DropIn" => { "$in" => activityTypes } },
      {
        "$or" => days_condition,
      },
    ]
    #binding.pry
    k = params['k'].gsub(',', '|')

    primary_conditions << { "Description" => /(#{k})/ } unless k.blank?


    activities = Activity
      .where(
        {
          "$and" => primary_conditions
        }
      )
      .page(params['skip'].to_i).per(params['take'].to_i)
      .geo_near([params['lon'].to_f, params['lat'].to_f]).max_distance(params['rd'].to_i*16093)
    search_result = []
    activities.each do |activity|
      search_result << tweak_activity(activity)
    end
    search_result
  end


  def self.search_by_facility_name(facilityName)
    activities = Activity.where(FacilityName: facilityName).limit(10)
    search_result = []
    activities.each do |activity|
      search_result << tweak_activity(activity)
    end
    search_result
  end

  def self.tweak_activity(activity)

    activity['FacilityName'] = encode(activity['FacilityName'])
    activity['Name'] = encode(activity['Name'])
    activity['Description'] = encode(activity['Description'])
    activity['FeeDescription'] = encode(activity['FeeDescription'])

    activity['Id'] = activity.id.to_s
    activity['Resource'] = activity.id.to_s
    activity['Exceptions'] = []
    activity['Fees'] = [{
      Cost: activity['Fee'],
      Description: activity['FeeDescription'],
      Id: 0,
      Name: ''
      }]
    activity["Organization"] = {
      "Id" => 1, 
      "Name" => activity['Organization'],
      "GeneralActivityDescription" => activity['Description'],
      "ServiceLink" => "",
      "Activities" => []
    }

    activity['Facility']['Id'] = activity['Facility']['_id'].to_s
    
    activity["Resource"] = {
      "Id" => 0, 
      "Activities" => [],
      "Name" => activity['Name'],
      "GeneralActivityDescription" => activity['Description'],
      "Facility" => activity['Facility'],
      "Location" => [activity['location'][0], activity['location'][1]],
      "Lat" => activity['location'][1],
      "Lon" => activity['location'][0],
    }

    activity["Times"] = [activity["Times"]]

    activity["SearchTags"] = ''
    activity
  end

  private

    def before_save
      facility_query = Facility.where(Name: self.FacilityName)
      return if facility_query.count == 0

      facility = facility_query.first
      self['Facility'] = facility.attributes
      self['Organization'] = facility.attributes['Organization']
      self.location = [ facility.attributes['Lon'].to_f, facility.attributes['Lat'].to_f ]
    end


    def self.to_b(value)
      value == 'true'
    end

    def self.encode(s)
      return "" if s==nil
      return s.force_encoding("ISO-8859-1").encode("UTF-8")
    end


end
