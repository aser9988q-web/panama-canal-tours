jQuery(() => {
	'use strict';
	more_details_event();
	booking_filter();
});

const more_details_event = () => {
	
	jQuery('.dy_archive').find('a').click(function(e) {

		const title = jQuery(this).attr('title');
		const startingAt = parseInt(jQuery(this).attr('data-starting-at'));

		if(typeof gtag !== 'undefined' && startingAt)
		{
			//send to analytics only
			gtag('event', 'view_item', {
				currency: 'USD',
				value: startingAt,
				items : [title]
			});
		}
		
		if(typeof fbq !== 'undefined')
		{
			fbq('track', 'ViewContent');
		}
	});
}

const booking_filter = () => {

	jQuery('#dy_package_filter_form').each(function(){
		const thisForm = jQuery(this);

		const nullParams = {
			location: 'any',
			category: 'any',
			sort: 'any',
			keywords: ''
		};

		jQuery(thisForm).find('select').each(function(){
			const thisField = jQuery(this);
			const countOptions = jQuery(thisField).find('option').length;
			
			if(countOptions <= 1)
			{
				jQuery(thisField).prop('disabled', true);
			}
		});

		jQuery(thisForm).find('select').change(function () {
			
			const formData = jQuery(thisForm).serializeArray();
			let countAllChanges = 0;
			let taxChanges = [];
			const thisValue = jQuery(this).val();
			const thisName = jQuery(this).attr('name');

			if(['package_location', 'package_category', 'package_sort'].includes(`package_${thisName}`))
			{
				if(typeof gtag !== 'undefined')
				{
					gtag('event', 'search', {search_term: `${thisName}-${thisValue}`});
				}

				if(typeof fbq !== 'undefined')
				{
					fbq('track', 'Search');
				}
			}

			formData.forEach(arr => {
				const {name, value} = arr;

				if(value !== nullParams[name])
				{
					
					if(['location', 'category'].includes(name))
					{
						taxChanges.push({name, value});
					}

					countAllChanges++;
				}
			});
			
			const countTaxChanges = taxChanges.length;
			const isAny = arr => arr.value === 'any';

			const submitForm = (countAllChanges === countTaxChanges) 
				? (countTaxChanges === 1 && !taxChanges.every(isAny)) 
				? false : true : true;

			if(submitForm)
			{
				createFormSubmit(thisForm);
			}
			else
			{
				const {value, name} = taxChanges[0];
				const homeUrl = new URL(jQuery(thisForm).attr('data-home-url'));
				let {pathname, hostname, protocol} = homeUrl;
				pathnameArr = (pathname) ? pathname.split('/') : [];
				pathnameArr = pathnameArr.filter(i => i);
				pathnameArr.push(`package_${name}`, value);
				const newPathname = pathnameArr.join('/');
				window.location.href = `${protocol}//${hostname}/${newPathname}`;
			}
		});
	});
	

}