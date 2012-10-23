#jQuery Twitter v2
====================

jQuery Twitter is a lightweight (4KB minified and 1.5KB gzipped) and easy to use jQuery plugin that uses Twitter API to get tweets from a user timeline.

Automatically format links and dates. You can show dates in absolute time (eg.: 04/20/2012 at 10h45) or relative time (eg.: 2 hours ago), taking care of timezone differences.

Dates are easily formatted for a better localization.

Also, tweets are cached with localstorage, so twitter won't bother you with too many requests warnings.

##How to use:

Make sure to include jQuery in your page:

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
```

Include **jQuery Twitter:**

```html
<script src="js/jquery.twitter.min.js"></script>
```

HTML markup (just an example, do it your way)

```html
<div class="tweet">
	<p></p>
	<p></p>
	<p></p>
</div>
```
Initialize **jQuery Twitter:**

```html
<script>
	$(function(){
		$.twitter('username', 2, function(data){
			$('.tweet').find('p').each(function(i){
				data[i] && $(this).html(data[i].text).append('<span>' + data[i].time + '</span>');
			});
		});
	});
</script>
```
	
##Callback:

Callback function passes a object as first parameter

```js
function(data){
	// data[index].text = Tweet
	// data[index].time = Time of tweet formated
	// data.length = Number of tweets returned
	// data.profile.avatar = User avatar
	// data.profile.followers = User followers count
	// data.profile.screen_name = User screen name
}
```
	
##Usage:

	$.twitter(string username[, integer number_of_tweets], function callback[, object { options }]);
	
##Options:

<table>
	<tr>
		<td><strong>Option</strong></td>
		<td><strong>Default</strong></td>
		<td><strong>Type</strong></td>
		<td><strong>Description</strong></td>
	</tr>
	<tr>
		<td>timeSpan</td>
		<td>true</td>
		<td>Boolean</td>
		<td>Toggle time format between relative and absolute</td>
	</tr>
	<tr>
		<td>exclude_replies</td>
		<td>true</td>
		<td>Boolean</td>
		<td>Exclude direct replies from response</td>
	</tr>
	<tr>
		<td>time_format</td>
		<td>function(day, month, year, hours, minutes){
			var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			return months[month] + ' ' + day + ', ' + year + ' at ' + hours + 'h' + ('0' + minutes).replace(/0(\d\d)|00/, '$1');
		}</td>
		<td>Function</td>
		<td>Date/time format (timeSpan option must be <em>false</em>)</td>
	</tr>
	<tr>
		<td>less_than_a_min</td>
		<td>'less than a minute ago'</td>
		<td>String</td>
		<td>Less than a minute ago string for localization (only show if timeSpan is <em>true</em>)</td>
	</tr>
	<tr>
		<td>timespan_format</td>
		<td>function(time, unity){
			var time_units = ['minute', 'hour', 'day'];
			return time + ' ' + time_units[unity] + (time > 1 ? 's' : '') + ' ago';
		}</td>
		<td>Function</td>
		<td>Date/time format (timeSpan option must be <em>true</em>)</td>
	</tr>
	<tr>
		<td>cache_timeout</td>
		<td>5</td>
		<td>Integer</td>
		<td>Time in minutes to keep tweets cached</td>
	</tr>
</table>

##Example:

```js
$(function(){
	$.twitter('twitterapi', 3, function(data){
		$('.tweet').find('p').each(function(i){
			data[i] && $(this).html(data[i].text).prepend('<img src="' + data.profile.avatar + '">').append('<span><a href="' + data[i].link + '" target="_blank">' + data[i].time + '</a></span>');
		});
	}, {
		timeSpan: true,
		exclude_replies: true,
		time_format: function(day, month, year, hours, minutes){
			var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			return months[month] + ' ' + day + ', ' + year + ' at ' + hours + 'h' + ('0' + minutes).replace(/0(\d\d)|00/, '$1');
		},
		timespan_format: function(time, unity){
			var time_units = ['minute', 'hour', 'day'];
			return time + ' ' + time_units[unity] + (time > 1 ? 's' : '') + ' ago';
		},
		less_than_a_min: 'less than a minute ago',
		cache_timeout: 5
	});
});
```