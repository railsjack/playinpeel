require 'rails_helper'

RSpec.describe DropboxesController, :type => :controller do

  describe "GET index" do
    it "returns http success" do
      get :index
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET sync" do
    it "returns http success" do
      get :sync
      expect(response).to have_http_status(:success)
    end
  end

end
