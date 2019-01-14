class DropboxesController < ApplicationController
  skip_authorization_check
  skip_before_action :authenticate_user!
  skip_before_filter :verify_authenticity_token

  def index
  end

  def show
    #render :text=>params[:challenge] and return unless params[:challenge].nil?
    #DropboxWorker.perform_async
    #DropboxHandler.test
    
  end

  def sync
    render :text=>params[:challenge] and return unless params[:challenge].nil?
  	#DropboxWorker.perform_async
    render :text=>'true'
  end
end
