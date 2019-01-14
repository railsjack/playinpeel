class ActivitiesController < ApplicationController
  skip_authorization_check
  skip_before_action :authenticate_user!
  def index
  	callback = params[:callback]
    search_result = Activity.search(params)
  	render :text=> "#{callback}(#{search_result.to_json})" and return
  end

  def show
    callback = params[:callback]
    activity = Activity.find(params[:id])
    activity = Activity.tweak_activity(activity)
    render :text=> "#{callback}(#{activity.to_json})" and return
  end

end
