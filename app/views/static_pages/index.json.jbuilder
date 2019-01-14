json.array!(@activities) do |activity|
  json.extract! activity, :attributes
end
