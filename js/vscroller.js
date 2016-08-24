(function ($) {
	$.vscroller = function() {

		//MM

		var tweets = [];
		var tweetIDs = [];

		function loadDATA() {

		  $.ajax({
		    type: 'GET',
		    url: 'http://beta.trimet.org/twitter/feed/searchjson.php?q=trimet&c=20',
		    cache: false,
		    contentType: "application/json",
		    dataType: 'json',

		    success: function(json) {

		    	$('.time').text(moment().format("dddd, h:mm:ss a"))

		        $.each(json.statuses, function( index, value ) {
		        	if (!value.retweeted_status){
		        		tweets.push(structureDATA(value));
		        		tweetIDs.push(value.id_str);
		        	}
		        });

		        if (tweets.length) {
		        	viewData(tweets);
		        }

		        console.log(tweetIDs);

		        $('ul li').each(function(i)
		        {
		           var id = $(this).attr('id');
		           if ($.inArray( id, tweetIDs) == -1){
		           	$('#' + id).removeClass('animated fadeIn').fadeOut(300, function() {$(this).remove(); });
		           	console.log(id + " has been removed.");
		           }

		        });

		    },
		    error: function() {
		    }
		  });

		};

		function structureDATA(status) {
			
			function linkifyEntities(tweet)
			{
			  function escapeHTML(text)
			  {
			    return $('<div/>').text(htmlCharsCorrect(text)).html();
			  }
			  
			  function htmlCharsCorrect(text)
			  {
			    text = text.replace(/&amp;/g,'\u0026');
			    text = text.replace(/&gt;/g,'\u003E');
			    text = text.replace(/&lt;/g,'\u003C');
			    text = text.replace(/&(quot;|apos;)/g,'\u0022');
			    text = text.replace(/&#039;+/g,'\u0027');
			    return text;
			  }
			  
			  var
			    index_map = {},
			    result = "",
			    last_i = 0,
			    i = 0,
			    end,
			    func,
			    emoji;
			  
			  var ranges = [
			    '\ud83c[\udf00-\udfff]', // U+1F300 to U+1F3FF
			    '\ud83d[\udc00-\ude4f]', // U+1F400 to U+1F64F
			    '\ud83d[\ude80-\udeff]'  // U+1F680 to U+1F6FF
			  ];
			  var emojis = [];
			  tweet.text = escapeHTML(tweet.text.replace(new RegExp(ranges.join('|'), 'g'), function(match, offset, string){
			    emojis.push({
			      offset: offset,
			      char: match
			    });
			    return '\u0091';
			  }));
			  
			  if (!(tweet.entities)) {
			    return escapeHTML(tweet.text);
			  }
			  
			  if (tweet.entities.urls) {
			    $.each(tweet.entities.urls, function(i,entry) {
			      index_map[entry.indices[0]] = [entry.indices[1], function(text) {return "<span class='urls'>"+escapeHTML(entry.display_url)+"</span>";}];
			    });
			  }
			  
			  if (tweet.entities.hashtags) {
			    $.each(tweet.entities.hashtags, function(i,entry) {
			      index_map[entry.indices[0]] = [entry.indices[1], function(text) {return "<span class='urls'>"+escapeHTML(text)+"</span>";}];
			    });
			  }
			  
			  if (tweet.entities.user_mentions) {
			    $.each(tweet.entities.user_mentions, function(i,entry) {
			      index_map[entry.indices[0]] = [entry.indices[1], function(text) {return "<span class='urls'>"+escapeHTML(text)+"</span>";}];
			    });
			  }
			  
			  if(tweet.entities.hasOwnProperty('media')) {
			    $.each(tweet.entities.media, function(i,entry) {
			    	index_map[entry.indices[0]] = [entry.indices[1], function(text) {return "";}];
			      // index_map[entry.indices[0]] = [entry.indices[1], function(text) {return "<img class='mediahref' src='"+escapeHTML(entry.media_url)+"'>";}];
			    });
			  }
			  
			  for (i=0; i < tweet.text.length; ++i) {
			    var ind = index_map[i];
			    if (ind) {
			      end = ind[0];
			      func = ind[1];
			      if (i > last_i) {
			        result += escapeHTML(tweet.text.substring(last_i, i));
			      }
			      result += func(tweet.text.substring(i, end));
			      i = end - 1;
			      last_i = end;
			    }
			  }
			  
			  if (i > last_i) {
			    result += escapeHTML(tweet.text.substring(last_i, i));
			  }
			  
			  result = result.replace(/\u0091/g, function(match, offset, string){
			    emoji = emojis.shift();
			    return '<span class="emoji" data-emoji="u'+emoji.char.charCodeAt(0)+'">'+emoji.char+'</span>'
			  });
			  
			  return result;
			}

		    return {
		        id: status.id_str,
		        dateCreated: moment(status.created_at).fromNow(),
		        username: status.user.screen_name,
		        usernameFull: status.user.name,
		        userPhoto: (status.user.profile_image_url).replace(/_normal/g, ''),
		        postText: linkifyEntities(status)
		    }
		};

		function viewData(tweets){
			$.each(tweets, function( index, value ) {
				if ($('#' + value.id).length == 0) {
					var tweet = "<li class='animated fadeIn' id='" + value.id + "'><div class='container'><div class='user-photo' style='background-image: url(" + value.userPhoto + ")'></div><div class='tweet-container'><div class='user-info'><div class='username-full'>" + value.usernameFull + "</div><div class='username'>@" + value.username + "</div><div class='date-created'>" + value.dateCreated + "</div></div><div class='tweet'>" + value.postText + "</div></div></div></li>";
					$('#tweets').append(tweet);
					console.log(value.id + " has been added.")
				}
				else {
					$('#' + value.id).find('.date-created').html(value.dateCreated);
				}
			});
		}



		//VV
		//CC


		loadDATA();
		// setInterval(loadDATA, 60000);

	}
 
 })

(jQuery);