class FacilitiesController < ApplicationController
  skip_authorization_check
  skip_before_action :authenticate_user!
  skip_before_filter :verify_authenticity_token
  layout nil
  def show
  	search_result = []
  	callback = params[:callback]

  	facility = Facility.find(params[:id])
  	facilityName = facility.Name

  	callback = params[:callback]
    search_result = {
      Resources: [{
        Activities: Activity.search_by_facility_name(facilityName)
      }]
    }
  	render :text=> "#{callback}(#{search_result.to_json})" and return

  end
end
