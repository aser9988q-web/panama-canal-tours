

jQuery(() => {
	selectGateway();
	addOnsCalc();
	reValidateDate();
	copyPaymentLink();
});

const localRegex = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;

const reValidateDate = async () => {
    // Disables booking form if the date is also disabled by the API endpoint


	const thisForm = jQuery('#dy_package_request_form');

	const windowLocationUrl = new URL(window.location);

	if(windowLocationUrl.searchParams.has('force_availability'))
	{
		return true;
	}

    if (!jQuery('body').hasClass('single-packages')) return false;

    const disableBookingForm = (form) => {
        if (form.length) {
            form.prop('disabled', true).find('input, select, textarea, button').prop('disabled', true);
        }
    };

    const isDateBefore23h = (min, today, bookingDate) => {

		if(typeof min === 'boolean') return false

		

        const limitDate = new Date(today);
        limitDate.setHours(23, 59, 59, 999);
        if (min > 1) limitDate.setDate(today.getDate() + 1);
        return bookingDate <= limitDate;
    };

	const isDateBeforeOrEqualMin = (min, today, bookingDate) => {
		if(typeof min === 'boolean') return false
		if(typeof min !== 'number') return true

		const limitDate = new Date(today)
		limitDate.setHours(0, 0, 0, 0)
		limitDate.setDate(limitDate.getDate() + (min-1))
		return bookingDate <= limitDate
	}

	const getDayOfTheWeek = date => date.getDay()

    try {

        const { permalink, post_id } = dyCoreArgs;
        const { site_timestamp } = await getNonce() || {};
        const today = site_timestamp ? new Date(site_timestamp) : new Date();

		const endpoint = new URL(permalink)
		endpoint.searchParams.set('json', 'disabled_dates')
		endpoint.searchParams.set('dy_id', post_id)
		endpoint.searchParams.set('stamp', today.getTime())

        const url = new URL(window.location.href);
        let bookingDateStr = url.searchParams.get('booking_date') + ' 00:00:00';
        let bookingDate;

		let endDateStr = (url.searchParams.has('end_date')) ? url.searchParams.get('end_date') + ' 00:00:00' : ''
		let endDate;

        if (localRegex.test(bookingDateStr)) {
            bookingDate = new Date(bookingDateStr);
        }
		if(localRegex.test(endDateStr))
		{
			endDate = new Date(endDateStr)
		}

        const response = await fetch(endpoint.href);
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const data = await response.json();
        const { disable, min } = data;
        let officeClose = [0, 6].includes(today.getDay()) ? 16 : 17;


        if (today.getHours() >= officeClose && isDateBefore23h(min, today, bookingDate)) {
            disableBookingForm(thisForm)
        }
		if(isDateBeforeOrEqualMin(min, today, bookingDate))
		{
			disableBookingForm(thisForm)
		}

        if (Array.isArray(disable) && disable.length > 0) {
            const formattedDisabledDates = disable
                .filter(d => Array.isArray(d) && d.length === 3)
                .map(([year, month, day]) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} 00:00:00`);

            if (formattedDisabledDates.includes(bookingDateStr) || (localRegex.test(endDateStr) && formattedDisabledDates.includes(endDateStr))) {
                disableBookingForm(thisForm);
            }
        }

		const bookingDayOfTheWeek = getDayOfTheWeek(bookingDate)
		const endDayOfTheWeek = (localRegex.test(endDateStr)) ?  getDayOfTheWeek(endDate) : undefined
		const disableDaysOfTheWeek = disable.filter(d => typeof d === 'number' && !isNaN(d))
		const forcedEnabledDates = disable
			.filter(d => Array.isArray(d) && d.length === 4 && d[3] === 'inverted')
			.map(([year, month, day]) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} 00:00:00`);


		if(disableDaysOfTheWeek.includes(bookingDayOfTheWeek))
		{

			let disableByBookingDay = true

			
			if(forcedEnabledDates.includes(bookingDateStr))
			{
				disableByBookingDay = false
			}


			if(disableByBookingDay)
			{
				
				disableBookingForm(thisForm);
			}
		}

		if(localRegex.test(endDateStr) && disableDaysOfTheWeek.includes(endDayOfTheWeek))
		{
			let disableByEndDay = true

			if(forcedEnabledDates.includes(endDateStr))
			{
				disableByEndDay = false
			}

			if(disableByEndDay)
			{
				disableBookingForm(thisForm);
			}
		}

    } catch (error) {
        disableBookingForm(thisForm);
        throw error;
    }
};


const selectGateway = () => {
	
	const thisForm = jQuery('#dy_package_request_form');
	const cardRequiredFields = ['country', 'city', 'address', 'CCNum', 'ExpMonth', 'ExpYear', 'CVV2'];

	const buttons = jQuery('#dy_payment_buttons').find('button');

	jQuery(buttons).each(function(){

		jQuery(this).click(function(){

			const thisButton = jQuery(this);
			const id = jQuery(thisButton).attr('data-id');
			const type = jQuery(thisButton).attr('data-type');
			const branding = jQuery(thisButton).attr('data-branding');
			let networks = jQuery(thisButton).attr('data-networks') || '';
			const cryptoForm = jQuery('#dy_crypto_form');
			const networkSelect = jQuery(cryptoForm).find('select[name="dy_network"]');

			jQuery(networkSelect).removeClass('required').html('<option value="" selected>--</option>');
			jQuery('#dy_crypto_alert').addClass('hidden');

			if(type === 'card-on-site')
			{
				jQuery('#dy_card_payment_conditions').removeClass('hidden');
				jQuery('.dy_card_form_fields').removeClass('hidden');

				cardRequiredFields.forEach(name => {
					jQuery(thisForm).find('[name="'+name+'"]').addClass('required');
				});
			}
			else
			{
				if(type === 'card-off-site')
				{
					jQuery('#dy_card_payment_conditions').removeClass('hidden');
				}
				else 
				{
					jQuery('#dy_card_payment_conditions').addClass('hidden');
				}
				
				jQuery('.dy_card_form_fields').addClass('hidden');

				cardRequiredFields.forEach(name => {
					jQuery(thisForm).find('[name="'+name+'"]').removeClass('required').removeClass('invalid_field');
				});
			}

			if(type === 'crypto')
			{
				
				jQuery(networkSelect).addClass('required');
				jQuery(cryptoForm).removeClass('hidden');

				networks = JSON.parse(networks);

				for (let k in networks) 
				{
					const options = jQuery('<option></option>').attr({'value': k}).html(networks[k].name);
					jQuery(networkSelect).append(options);
				}

				setTimeout(()=>{
					jQuery(networkSelect).focus();
				}, 200)

				jQuery(networkSelect).change(function(){
					const thisField = jQuery(this);
					const value = jQuery(thisField).val();
					const text = jQuery(thisField).find('option:selected').text();

					jQuery('#dy_crypto_network_code').text(value.toUpperCase());
					jQuery('#dy_crypto_network_name').text(text);
					jQuery('#dy_crypto_alert').removeClass('hidden');
				});

			}
			else
			{
				jQuery(thisForm).find('input[name="first_name"]').focus();
				jQuery('#dy_crypto_form').addClass('hidden');
			}

			jQuery('#dy_checkout_branding').html(branding);
			jQuery(thisForm).removeClass('hidden');
			jQuery(thisForm).find('input[name="dy_request"]').val(id);
		});
	});


	//shows form if there is only one button
	if(buttons.length === 1)
	{
		jQuery(buttons).trigger('click');
		jQuery('#dy_payment_buttons').hide();
	}


};

const getUpdatedCheckoutArgs = () => {
		
	if(defaultCheckoutArgs)
	{
		let {amount, regular_amount, deposit, add_ons, pax_num} = defaultCheckoutArgs;
		let payment_amount = 0;
		let add_ons_id = [];
		let outstanding = 0;
		
		if(deposit)
		{
			deposit = deposit / 100;
		}

		const thisForm = jQuery('#dy_package_request_form');
		jQuery(thisForm).find('[name="add_ons"]').val();
		
		jQuery('#dynamic_table').find('select.add_ons').each(function(){
			const field = jQuery(this);
			
			if(parseInt(jQuery(field).val()) === 1)
			{
				add_ons_id.push(parseFloat(jQuery(field).attr('data-id')));
			}
		});
		
		jQuery(thisForm).find('[name="add_ons"]').val(add_ons_id.join(','));
		
		let add_ons_price = add_ons_id.map(id => {
			let output = 0;
			
			for(let x = 0; x < add_ons.length; x++)
			{
				if(id == add_ons[x].id)
				{
					output = parseFloat(add_ons[x].price) * parseFloat(pax_num);
				}
			}
			return output;
		});
		
		add_ons_price = add_ons_price.reduce((a, b) => a + b, 0);
		payment_amount = getPaymentAmount({amount, deposit, add_ons_price});
		outstanding = getOutstandingAmount({amount, deposit});
		
		if(add_ons_price > 0)
		{
			regular_amount = regular_amount + add_ons_price;
			amount = amount + add_ons_price;
		}
		
		const newArgs = {
			outstanding: parseFloat(outstanding.toFixed(2)),
			total: parseFloat(payment_amount.toFixed(2)),
			amount: parseFloat(amount.toFixed(2)),
			regular_amount: parseFloat(regular_amount.toFixed(2))
		};

		return {...defaultCheckoutArgs, ...newArgs};
	}

	
}

const getPaymentAmount = ({amount, deposit, add_ons_price}) => {
	
	let output = amount;

	if(deposit > 0)
	{
		output = (output * deposit);
	}
	
	output = output + add_ons_price;
	
	return output;
};

const getOutstandingAmount = ({amount, deposit}) => {
	
	let output = (deposit > 0) ? (amount * deposit) : amount;

	return (amount === output) ? amount : amount - output;
};

const addOnsCalc = () => {
		
	jQuery('#dynamic_table').find('select.add_ons').on('change', () => {
		
		const checkoutArgs = getUpdatedCheckoutArgs();
		const {amount, regular_amount, total, outstanding} = checkoutArgs;
				
		jQuery('.dy_calc').each(function(){
			
			jQuery(this).addClass('animate');
			jQuery(this).html('<span class="padding-10"><span class="dashicons dashicons-admin-generic animate-spin"></span></span>');

			setTimeout(()=>{
				
				if(jQuery(this).hasClass('dy_calc_amount'))
				{
					jQuery(this).text(amount);
				}
				if(jQuery(this).hasClass('dy_calc_regular'))
				{
					jQuery(this).text(regular_amount);
				}			
				if(jQuery(this).hasClass('dy_calc_total'))
				{
					jQuery(this).text(total);
				}
				if(jQuery(this).hasClass('dy_calc_outstanding'))
				{
					jQuery(this).text(outstanding);
				}

				jQuery(this).removeClass('animate');
			}, 1000);
			
		});		
	});
}



function checkoutFormSubmit(token){

	const {submit_error} = dyPackageBookingArgs;
	const thisForm = jQuery('#dy_package_request_form');
	const checkoutArgs = getUpdatedCheckoutArgs();
	const {amount} = checkoutArgs;
	let invalids = [];
	const formFields = formToArray(thisForm);
	const dyRequestVal = jQuery(thisForm).find('[name="dy_request"]').val();
	const excludedPurchase = ['contact', 'estimate_request'];

	formFields.forEach(i => {

		const {name, value} = i;
		const field = jQuery(thisForm).find('[name="'+name+'"]');
		const label = jQuery(thisForm).find('label[for="'+name+'"]');
		const isRequired = (jQuery(field).hasClass('required')) ? true : false;
		const isNull = !value;
		
		if(isRequired)
		{
			if(isNull || !isValidValue({name, value, thisForm}))
			{
				if(name.startsWith('terms_conditions_'))
				{
					invalids.push(name);
					jQuery(label).addClass('invalid_checkmark');
					console.log(jQuery(field).attr('name')+ ' invalid');
				}
				else
				{
					invalids.push(name);
					jQuery(field).addClass('invalid_field');
					console.log(jQuery(field).attr('name')+ ' invalid');
				}
			}
			else
			{
				if(name.startsWith('terms_conditions_'))
				{
					jQuery(label).removeClass('invalid_checkmark');
				}
				else
				{
					jQuery(field).removeClass('invalid_field');
				}
			}
		}
	});
	
	if(invalids.length === 0)
	{
		populateCheckoutForm(thisForm);

		//facebook pixel
		if(typeof fbq !== typeof undefined)
		{
			fbq('track', 'Lead');
		}
		
		//google analytics
		if(typeof gtag !== 'undefined')
		{	
			//send to call	
			gtag('event', 'generate_lead', {
				value: amount,
				currency: 'USD'
			});

			if(!excludedPurchase.includes(dyRequestVal))
			{
				let checkoutEventArgs = getCheckoutEventArgs({...checkoutArgs});

				//console.log(checkoutEventArgs);

				gtag('event', 'begin_checkout', checkoutEventArgs);
				gtag('event', 'add_payment_info', {...checkoutEventArgs, payment_type: dyRequestVal});
			}
		}
		
		//console.log(formToArray(thisForm));
		
		createFormSubmit(thisForm);
	}
	else
	{
		grecaptcha.reset();
		alert(`${submit_error}: ${invalids.join(', ')}`);
	}

	return false;
}

const getCheckoutEventArgs = checkoutArgs => {
	
	let {post_id, title, pax_num, amount, regular_amount, coupon_code, coupon_discount, coupon_discount_amount, categories} = checkoutArgs;

	if(!regular_amount)
	{
		regular_amount = amount;
	}

	let item1 = {
		item_name: title,
		item_id: `post_${post_id}`,
		price: (regular_amount / pax_num),
		quantity: pax_num
	};

	if(Array.isArray(categories))
	{
		if(categories.length > 0)
		{
			categories.forEach((c, i) => {
				let txt = document.createElement('textarea');
				txt.innerHTML = c;
				const category = txt.value;
				const key = (!i) ? 'item_category' : `item_category${i+2}`;
				item1[key] = category;
			});
		}
	}

	let output = {
		value : amount,
		currency: 'USD',
		transaction_id: Date.now().toString(),
		items: [item1],
	};

	if(coupon_code && coupon_discount > 0 && coupon_discount_amount > 0)
	{
		output.coupon = coupon_code;
		output.items[0].coupon = coupon_code;
		output.items[0].discount = (coupon_discount_amount / pax_num);
	}

	return output;
};

const populateCheckoutForm = form => {
	
	const checkoutArgs = getUpdatedCheckoutArgs();

	for(let key in checkoutArgs)
	{
		if(checkoutArgs.hasOwnProperty(key))
		{
			const value = checkoutArgs[key];

			if(typeof value === 'string' || typeof value === 'number' || value === null)
			{
				jQuery(form).append(jQuery('<input>').attr({'type': 'hidden', 'name': key, 'value': value}));						
			}
		}
	}		
}


const copyPaymentLink = () => {

	if(jQuery('.dy_copy_payment_link').length === 0)
	{
		return true;
	}

    jQuery('.dy_copy_payment_link').on('click', function () {
        // Use the URL constructor to modify the URL
        let currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('enable_payment', 'true');

        // Copy the updated URL to the clipboard
        navigator.clipboard.writeText(currentUrl.href).then(function () {
            console.log('Payment link copied to clipboard: ' + currentUrl.href);
        }).catch(function (err) {
            console.error('Could not copy text: ', err);
        });

        // Change the dashicon to "dashicons dashicons-media-text"
        jQuery(this).find('span').attr('class', 'dashicons dashicons-media-text');
    });

}

