class StaticPagesController < ApplicationController
  skip_authorization_check
  skip_before_action :authenticate_user!
  skip_before_filter :verify_authenticity_token
  def index
    @search_url = state_pages_post_url
  end


  def new
  end

  def edit
  end

  def home
  end

  def search
  end
end
