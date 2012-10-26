/*
 * jQuery Twitter 2.0.1
 *
 * Copyright (c) 2012 Leonardo Santos
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Includes jQuery Store - Copyright (c) 2010 Marcus Westin (github.com/whitmer/store.js)
 *
 */
;(function($){
	$.store=function(){var c={},a=window,e=a.document,d;c.disabled=!1;c.set=function(){};c.get=function(){};c.remove=function(){};c.clear=function(){};c.transact=function(b,d){var a=c.get(b);"undefined"==typeof a&&(a={});d(a);c.set(b,a)};c.serialize=function(b){return JSON.stringify(b)};c.deserialize=function(b){return"string"!=typeof b?void 0:JSON.parse(b)};var f;try{f="localStorage"in a&&a.localStorage}catch(h){f=!1}if(f)d=a.localStorage,c.set=function(b,a){d.setItem(b,c.serialize(a))},c.get=function(b){return c.deserialize(d.getItem(b))},c.remove=function(b){d.removeItem(b)},c.clear=function(){d.clear()};else{var g;try{g="globalStorage"in a&&a.globalStorage&&a.globalStorage[a.location.hostname]}catch(i){g=!1}g?(d=a.globalStorage[a.location.hostname],c.set=function(b,a){d[b]=c.serialize(a)},c.get=function(b){return c.deserialize(d[b]&&d[b].value)},c.remove=function(b){delete d[b]},c.clear=function(){for(var b in d)delete d[b]}):e.documentElement.addBehavior?(d=e.createElement("div"),a=function(b){return function(){var a=Array.prototype.slice.call(arguments,0);a.unshift(d);e.body.appendChild(d);d.addBehavior("#default#userData");d.load("localStorage");a=b.apply(c,a);e.body.removeChild(d);return a}},c.set=a(function(b,a,d){b.setAttribute(a,c.serialize(d));b.save("localStorage")}),c.get=a(function(b,a){return c.deserialize(b.getAttribute(a))}),c.remove=a(function(b,a){b.removeAttribute(a);b.save("localStorage")}),c.clear=a(function(b){var a=b.XMLDocument.documentElement.attributes;b.load("localStorage");for(var c=0,d;d=a[c];c++)b.removeAttribute(d.name);b.save("localStorage")})):c.disabled=!0}return c}();

	$.twitter = function(usr, count, fn, options) {
		if (!usr || !count){
			return;
		} else if ($.isFunction(count)) {
			fn = count;
			count = 1;
		}
		
		var configs = $.extend({
				timeSpan: true,
				exclude_replies: true,
				time_format: function(day, month, year, hours, minutes){
					var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
					return months[month] + ' ' + day + ', ' + year + ' at ' + hours + 'h' + ('0' + minutes).slice(-2);
				},
				timespan_format: function(time, unity){
					var time_units = ['minute', 'hour', 'day'];
					return time + ' ' + time_units[unity] + (time > 1 ? 's' : '') + ' ago';
				},
				less_than_a_min: 'less than a minute ago',
				cache_timeout: 5
			}, options),
			twitterDomain = 'twitter.com/',
			parseTweetText = function(tweetData) {
				var tweet = tweetData.text;
				
				$.each(tweetData.entities.urls, function(i, url) {
					tweet = tweet.replace(url.url, linkfy(url.display_url, url.expanded_url));
				});
				
				return tweet.replace(/\B[@#]\w+/g,function(b){return linkfy(b, '//'+twitterDomain+(b[a='search']('#')?'':a+'?q=%23')+b.substring(1))});
			},
			tweet = {},
			cachedTweets = $.store.get('tweets_' + usr),
			dateNow = new Date;
		
		function linkfy(txt, url) {
			return '<a href="' + url + '" target="_blank">' + txt + '</a>';
		}
		
		if (cachedTweets && (+dateNow - cachedTweets[0]) / (6e4) < configs.cache_timeout){
			parseTweets(cachedTweets[1]);
		} else {
			$.getJSON('//api.'+twitterDomain+'1/statuses/user_timeline.json?count='+count+'&include_entities=1&exclude_replies='+configs.exclude_replies+'&include_rts=1&callback=?&screen_name='+usr, function(data){
				$.store.set('tweets_' + usr, [+dateNow, data]);
				parseTweets(data);
			});
		}
		
		function parseTweets(data){
			$.each(data, function(i, tweetData) {				
				var dateTweet = new Date(tweetData.created_at.replace(/\+0+/, 'UTC')),
					dateDiff = +dateNow - (+dateTweet),
					m = Math.round(dateDiff / (6e4)),
					time,
					minute = dateTweet.getMinutes(),
					usr = data[0].user,
					usrName = usr.screen_name;
				
				tweet.profile = {
					screen_name: usrName,
					followers: usr.followers_count,
					avatar: usr.profile_image_url
				}
				
				tweet.length = i+1;
								
				if (configs.timeSpan) {
					if (m < 60){
						// Minutes
						time = m == 0 ? configs.less_than_a_min : configs.timespan_format(m, 0);
					} else if (m < 60*24) {
						// Hours
						time = configs.timespan_format(Math.floor(m / 60), 1);		
					} else {
						// Days
						time = configs.timespan_format(Math.floor(m / (60*24)), 2);
					}
				} else {
					time = configs.time_format(dateTweet.getDate(), dateTweet.getMonth(), dateTweet.getFullYear(), dateTweet.getHours(), minute);
				};
				
				tweet[i] = {
					text: parseTweetText(tweetData),
					time: time,
					link: '//' + twitterDomain + usrName + '/statuses/' + tweetData.id_str
				}
			});
			
			$.isFunction(fn) && fn.call(this, tweet);
		}
	}
}(jQuery));