# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/


$ ->
	$('.btn-search').click ->
		data = "a=b&b=c"
		$.ajax
			type: 'POST'
			url: search_url
			data: data
			success: (response) ->
				console.log response
				$('.temp-result').val JSON.stringify(response)
			dataType: 'json'
