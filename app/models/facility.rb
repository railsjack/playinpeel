class Facility
  include Mongoid::Document

  field :Name
  field :Aliases
  field :Address
  field :City
  field :Phone
  field :Lat
  field :Lon
  field :Organization

  validates :Name, uniqueness: true

  #validates_uniqueness_of :Lat, :scope => :Lon

  # 177
end
