/*
 * Twitter 1.0
 *
 * Copyright (c) 2012 Leonardo Santos
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 */
;(function($, undefined){
	var twitterDomain = 'twitter.com/',
		parseTweet = function(tweetData) {
			var tweet = tweetData.text;
			
			$.each(tweetData.entities.urls, function(i, url) {
				tweet = tweet.replace(url.url, url.display_url.linkfy(url.expanded_url));
			});
			
			return tweet.replace(/\B[@#]\w+/g,function(b){return b.linkfy('//'+twitterDomain+(b[a='search']('#')?'':a+'?q=%23')+b.substring(1))});
		}

	String.prototype.linkfy = function(url) {
		return '<a href="%0" target="_blank">%1</a>'.format(url, this);
	};
	
	String.prototype.format = function() {
		var formatted = this,
			l = arguments.length;
			
		while (l--) {
			var re = new RegExp('%'+l, 'g');
			formatted = formatted.replace(re, arguments[l]);
		}
		
		return formatted;
	};
	
	$.extend({
		twitter: function(usr, numPosts, fn, options) {
			var configs = $.extend({
				timeSpan: true,
				exclude_replies: true,
				time_format: '%1 %0, %2 at %3',
				less_than_a_min: 'less than a minute ago',
				timespan_format: '%0 %1 ago',
				i18n_time: ['minute', 'hour', 'day'],
				i18n_months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
			}, options);
			
			if (usr === undefined || numPosts === undefined) {
				return;
			} else if ($.isFunction(numPosts)) {
				fn = numPosts;
				numPosts = 1;
			}
			
			$.getJSON('//api.%01/statuses/user_timeline.json?count=%1&include_entities=1&exclude_replies=%2&screen_name=%3&callback=?'.format(twitterDomain, numPosts, configs.exclude_replies, usr), function(data){
				var tweet = profile = {};
				
				$.each(data, function(i, tweetData) {
					var dateTweet = new Date(data[i].created_at.replace(/\+0+/, 'UTC')), //new Date(data[i].created_at.replace(' +0000', '')),
						dateNow = new Date(),
						utc = dateNow.getTimezoneOffset() * (1000*60),
						dateDiff = (+dateNow) - (+dateTweet),
						m = Math.round( (dateDiff + utc) / (1000*60) ),
						time,
						minuto = dateTweet.getMinutes();
					
					if (configs.timeSpan) {
						if (m < 60){
							// Minutes
							time = (m === 0 && configs.less_than_a_min) ?
								configs.less_than_a_min :
								configs.timespan_format.format(m, configs.i18n_time[0]+(m!=1?'s':''));
						} else {
							if (m < 60*24) {
								// Hours
								h = Math.floor(m / 60);
								time = configs.timespan_format.format(h, configs.i18n_time[1]+(h>1?'s':''));
							} else {
								// Days
								d = Math.floor(m / (60*24));
								time = configs.timespan_format.format(d, configs.i18n_time[2]+(d>1?'s':''));
							}
						}
					} else {
						time = configs.time_format.format(dateTweet.getDate(), configs.i18n_months[dateTweet.getMonth()], dateTweet.getFullYear(), dateTweet.getHours() + 'h' + (minuto ? (minuto<10?'0':'') + minuto : ''));
					};
							
					tweet[i] = {
						text: parseTweet(tweetData),
						time: time
					};
					
					tweet.length = i;
				});
				
				var usr = data[0].user;
				
				tweet.profile = {
					screen_name: usr.screen_name,
					followers: usr.followers_count,
					avatar: usr.profile_image_url
				}
				
				if ($.isFunction(fn)) fn.call(this, tweet);
			});
		}
	});
})(jQuery);