const cookieExpirationInDays = 90;

jQuery(() => {
	set_cookies();
});

const set_cookies = () => {
	setChannel();
	setLandingPath();
	setLandingDomain();
	setDevice();
	setGoogleAds();
}

const setGoogleAds = () => {

	const url = new URL(window.location);
	const {searchParams} = url;

	googleAdsCookies.forEach(v => {
		if(searchParams.has(v))
		{
			const param = searchParams.get(v);

			if(param)
			{
				setCookie(v, param, cookieExpirationInDays);
			}
		}
	});

};

const setDevice = () => {
	if(getCookie('device') == '')
	{
		var device = 'Desktop';
		
		if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
		{
			device = 'Mobile';
		}
		
		setCookie('device', device, cookieExpirationInDays);
		
		if(getCookie('device') == '')
		{
			setCookie('device', 'undefined', cookieExpirationInDays);
		}				
	}
}

const setLandingDomain = () => {
	if(getCookie('landing_domain') == '')
	{
		setCookie('landing_domain', window.location.hostname, cookieExpirationInDays);
		
		if(getCookie('landing_domain') == '')
		{
			setCookie('landing_domain', 'undefined', cookieExpirationInDays);
		}		
	}	
}

const setLandingPath = () => {
	if(getCookie('landing_path') == '')
	{
		setCookie('landing_path', window.location.pathname, cookieExpirationInDays);
		
		if(getCookie('landing_path') == '')
		{
			setCookie('landing_path', 'undefined', cookieExpirationInDays);
		}	
	}	
}

const setChannel = () => {
	if(getCookie('channel') == '')
	{
		var channel = 'Organic';
		var google = /google/i;
		var bing = /bing/i;
		var yahoo = /yahoo/i;
		var yandex = /yandex/i;
		var baidu = /baidu/i;
		var instagram = /instagram/i;
		var twitter = /twitter/i;
		var facebook = /facebook/i;
			
		if(document.referrer.match(google))
		{
			if(window.location.href.indexOf('gclid') > -1)
			{
				channel = 'Google Ads';
			}
			else
			{
				channel = 'Google';
			}
		}
		else if(document.referrer.match(bing))
		{
			if(window.location.href.indexOf('msclkid') > -1)
			{
				channel = 'Bing Ads';
			}
			else
			{
				channel = 'Bing';
			}
		}
		else if(document.referrer.match(yahoo))
		{
			channel = 'Yahoo';
		}		
		else if(document.referrer.match(baidu))
		{
			channel = 'Baidu';
		}
		else if(document.referrer.match(yandex))
		{
			channel = 'Yandex';
		}				
		else if(document.referrer.match(instagram))
		{
			channel = 'Instagram';
		}
		else if(document.referrer.match(twitter))
		{
			channel = 'Twitter';
		}	
		else if(document.referrer.match(facebook))
		{
			channel = 'Facebook';
		}
		setCookie('channel', channel, cookieExpirationInDays);
	}
}

const setCookie = (cname, cvalue, exdays) => {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

const getCookie = (cname) => {
    var name = cname + '=';
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}
