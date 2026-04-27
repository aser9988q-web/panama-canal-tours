
jQuery(() => {

	timePicker();
	datePicker();
	validateCheckPricesForm();
	showCouponForm();
	forceAvailability();
});

const forceAvailability = () => {

	if(jQuery('.dy_force_availability_link').length === 0)
	{
		return true;
	}

    jQuery('.dy_force_availability_link').on('click', function () {
        // Use the URL constructor to modify the URL
        let url = new URL(window.location.href);
        url.searchParams.set('force_availability', 'true');
		window.location = url.href;
    });

}

const datePicker = async () => {

	const formContainer = jQuery('.dy_package_booking_form_container');
	const {permalink, post_id} = dyCoreArgs;
	const {site_timestamp} = await getNonce() || undefined;
	
	if(formContainer.length === 0 && !site_timestamp)
	{
		return false;
	}
	


	jQuery('body').append(jQuery('<div>').attr({'id': 'availability_calendar'}));

	const buildPicker = () => {


		const windowLocationUrl = new URL(window.location);
		const d = new Date();	
		const endpoint = new URL(permalink);
		endpoint.searchParams.set('json', 'disabled_dates');
		endpoint.searchParams.set('dy_id', post_id);
		endpoint.searchParams.set('stamp', d.getTime());
	

		jQuery(formContainer).each(function () {
			const thisForm = jQuery(this).find('.dy_package_booking_form');
			const fields = jQuery(thisForm).find('input.dy_date_picker');

			let args = {
				container: '#availability_calendar',
				format: 'yyyy-mm-dd',
				firstDay: 1
			};
			
			jQuery(fields).each(function(){
				
				const field = jQuery(this);
				const name = jQuery(field).attr('name');

				if(name === 'end_date')
				{
					endpoint.searchParams.set('return', 'true');
				}
				
				jQuery(thisForm).find('select.booking_select').each(function(){
					endpoint.searchParams.set(jQuery(this).attr('name'), jQuery(this).val())
				});

				fetch(endpoint.href)
				.then(response => (response.ok ? response : Promise.reject(new Error(`Error ${response.status}: ${response.statusText}`))))
				.then(response => response.json())
				.then(data => {
					
					args = {...args, ...data}

					const today = new Date(site_timestamp)

					

					const hour = today.getHours()
					const weekDay = today.getDay()
					let officeClose = 17

					console.log({weekDay, hour, today})

					//by default 0 0 today is converted into a true boolean
					if((typeof args.min !== 'boolean') && args.min === 1)
					{
						if(weekDay === 0 || weekDay === 6)
						{
							officeClose = 16
						}
						
						if(hour >= officeClose)
						{
							args.min++
						}
					}

					if(windowLocationUrl.searchParams.has('force_availability'))
					{
						args = {...args, min: true, max: 365, disable: []}
					}

					
					if(name === 'end_date')
					{
						args.onOpen = () => {

							const bookingDatePicker = jQuery(thisForm)
								.find('input.dy_date_picker[name="booking_date"]')
								.pickadate('picker');

							const bookingDateVal = bookingDatePicker.get('select');
							const endDate = jQuery(thisForm)
								.find('input.dy_date_picker[name="end_date"]');

							if(bookingDateVal && endDate.length !== 0)
							{
								const endDatePicker = endDate.pickadate('picker');

								endDatePicker.set({min: bookingDateVal}, { muted: true });
								endDatePicker.set('clear');
								endDatePicker.render();
							}

						}; 
					}



					if(jQuery(field).attr('type') == 'text')
					{
						jQuery(field).pickadate(args);
					}
					else if(jQuery(field).attr('type') == 'date')
					{
						jQuery(field).attr({
							'type': 'text'
						});
						jQuery(field).pickadate(args);
					}
					
					jQuery(field).removeAttr('disabled').attr({
						'placeholder': null
					});
				
				})
				.catch(error => {
					throw error;
				});	

			});		

		});
	};

	buildPicker();

	jQuery(formContainer).each(function(){
		const thisForm = jQuery(this).find('.dy_package_booking_form');
		
		jQuery(thisForm).find('select.booking_select').change(function(){

			jQuery(thisForm).find('input.dy_date_picker').val('');
			jQuery(thisForm).find('input.dy_time_picker').val('');
		});
	});
};


const timePicker = () => {

	if(jQuery('input.dy_time_picker').length === 0)
	{
		return;
	}

	let args = {};
	
	if(dyPackageEnabledTimes.length > 1)
	{
		args.min = dyPackageEnabledTimes[0];
		args.max = dyPackageEnabledTimes[1];
	}
	
	jQuery('.dy_package_booking_form').find('input.dy_time_picker').each(function()
	{
		jQuery(this).pickatime(args);
	});	
}

const showCouponForm = () => {

	const formContainer = jQuery('.dy_package_booking_form_container');

	if(formContainer.length === 0)
	{
		return false;
	}

	jQuery(formContainer).each(function(){
		const thisForm = jQuery(this).find('.dy_package_booking_form');
		const container = jQuery(thisForm).find('.coupon_code_container');
		const  link = jQuery(container).find('a');
		const field = jQuery(container).find('input[name="coupon_code"]');

		if(field.val())
		{
			if(field.val().length >= 2)
			{
				jQuery(field).removeClass('hidden');
			}
		}
	
		
		jQuery(link).click(e => {
			e.preventDefault();
			jQuery(field).toggleClass('hidden').focus();
		});

	})

	
}


const validateCheckPricesForm = () => {

	const {post_id} = dyCoreArgs;

	const formContainer = jQuery('.dy_package_booking_form_container');

	if(formContainer.length === 0)
	{
		return false;
	}

	jQuery(formContainer).each(function () {

		const thisForm = jQuery(this).find('.dy_package_booking_form');
		const submitButton = jQuery(thisForm).find('button.dy_check_prices');
		const startingAt = parseInt(jQuery(thisForm).attr('data-starting-at'));
		const title = jQuery(thisForm).attr('data-title');
		const transportTypeField = jQuery(thisForm).find('[name="transport_type"]');
		const departureContainer = jQuery(thisForm).find('.departure_route_container');
		const returnContainer = jQuery(thisForm).find('.return_route_container');
		const routeField = jQuery(thisForm).find('[name="route"]')
		const scheduleField = jQuery(thisForm).find('input.schedule')

		formToArray(thisForm).forEach(v => {
			const {name, value} = v;
			const cookieName = `${name}_${post_id}`;
			const cookieValue = getCookie(cookieName);
			const field = jQuery(thisForm).find('[name="'+name+'"]');

			if(value === '' && cookieValue && !name.startsWith('coupon_code'))
			{
				jQuery(field).val(cookieValue);
			}
		});


		const showHideTransportContainers = (transportTypeField, routeField) => {

			if(transportTypeField.length === 0 || routeField.length === 0) return;

			const transportTypeVal = jQuery(transportTypeField).find('option:selected').val();
			const routeSelect = jQuery(routeField).find('option:selected')
			const routeSelectVal = jQuery(routeSelect).val();
			const routeSelectText = jQuery(routeSelect).text();
			const [routeOrigin = '', routeDestination = ''] = routeSelectText.split(' - ');
			const scheduleArr = (scheduleField.length !== 0) ? scheduleField.val().split(' - ') : [];
			let departureSchedule = ''
			let returnSchedule = ''

			if(scheduleArr.length === 2) {
				if(routeSelectVal === '0')
				{
					departureSchedule = ` (${scheduleArr[0]})`
					returnSchedule = ` (${scheduleArr[1]})`
				}
				else if(routeSelectVal === '1')
				{
					departureSchedule = ` (${scheduleArr[1]})`
					returnSchedule = ` (${scheduleArr[0]})`
				}
			}

			if(transportTypeVal === '0')
			{
				departureContainer.removeClass('hidden')
				returnContainer.addClass('hidden')
				jQuery(thisForm).find('.departure_route_label').html(`${routeOrigin} &raquo; ${routeDestination}${departureSchedule}`)
				jQuery(thisForm).find('.return_route_label').text('')
			}
			else if(transportTypeVal === '1')
			{
				departureContainer.removeClass('hidden')
				returnContainer.removeClass('hidden')
				jQuery(thisForm).find('.departure_route_label').html(`${routeOrigin} &raquo; ${routeDestination}${departureSchedule}`)
				jQuery(thisForm).find('.return_route_label').html(`${routeDestination} &raquo; ${routeOrigin}${returnSchedule}`)
			}
			else{
				jQuery(departureContainer).addClass('hidden')
				jQuery(returnContainer).addClass('hidden')
				jQuery(thisForm).find('.departure_route_label').text('')
				jQuery(thisForm).find('.return_route_label').text('')		
			}


		}

		if(transportTypeField.length !== 0)
		{
			showHideTransportContainers(transportTypeField, routeField)

			transportTypeField.change(function() {

				showHideTransportContainers(this, routeField)
			})

			routeField.change(function() {
				showHideTransportContainers(transportTypeField, this)
			})
		}


		jQuery(submitButton).click(() => {
			let invalids = [];
			let required = ['booking_date', 'booking_hour', 'route', 'transport_type'];
			const data = formToArray(thisForm);
			const bookingDate = data.find(v => v.name === 'booking_date');
			const endDate = data.find(v => v.name === 'end_date');
			let paxNum = 0;

			if(transportTypeField.length !== 0)
			{
				const transportVal = transportTypeField.val()

				if(transportVal === '')
				{
					transportTypeField.addClass('invalid_field')
					invalids.push('transport_type')
				}
				else
				{
					transportTypeField.removeClass('invalid_field')
				}
			}

			data.forEach(v => {
				const {name, value} = v;

				if(name === 'end_date' && value !== '')
				{
					required = [...required, 'end_date', 'return_hour'];
				}
			});

			data.forEach(v => {
				const {name, value} = v;

				if(required.includes(name) && value === '')
				{
					invalids.push(name);
					jQuery(thisForm).find('[name="'+name+'"]').addClass('invalid_field');
				}
			});

			if(typeof bookingDate !== 'undefined' && typeof endDate !== 'undefined')
			{
				const dateNames = ['booking_date', 'end_date'];

				if(new Date(bookingDate.value) > new Date(endDate.value))
				{
					invalids.push(...dateNames);

					dateNames.forEach(n => {
						jQuery(thisForm).find('[name="'+n+'"]').addClass('invalid_field');
					});
				}
			}

			if(invalids.length === 0)
			{
				data.forEach(v => {
					const {name, value} = v;

					if(['pax_regular', 'pax_discount', 'pax_free'].includes(name))
					{
						paxNum += parseInt(value);
					}
				});

				jQuery(thisForm).append(jQuery('<input />').attr({
					name: 'hash',
					type: 'hidden',
					value: sha512(paxNum + bookingDate.value)
				}));

				formToArray(thisForm).forEach(v => {
					const {name, value} = v;
					
					if(name)
					{
						if(name !== 'hash' || !name.startsWith('coupon_code_'))
						{
							setCookie(`${name}_${post_id}`, value, 1);
						}
					}
				});

				if(typeof gtag !== 'undefined' && startingAt)
				{

					//send to all
					gtag('event', 'add_to_cart', {
						currency: 'USD',
						value: startingAt,
						items : [title]
					});

					//send to analytics only
					gtag('event', 'package_pax_num', {
						value: paxNum
					});
				}

				if(typeof fbq !== 'undefined')
				{
					fbq('track', 'AddToCart');
				}

				createFormSubmit(thisForm);
			}

		});
	});

};