jQuery(() => {

    countryDropdown();
	fixInputSpecialTypes();
});


const fixInputSpecialTypes = () => {


	//fixes paste unwanted numbers in number input
	jQuery('input[type="number"]').bind('paste', function(e) {
		
		e.preventDefault()

		const pasteValue = e.originalEvent.clipboardData.getData('Text')
		const sanitizedValue = pasteValue.replace(/[^0-9]/g, '')
	
		jQuery(this).val(sanitizedValue)

	})

	//fixes typing unwanted numbers in number input
	jQuery('input[type="number"]').on('keydown', function() {
		const inputValue = jQuery(this).val();
	
		// Use a single regular expression replacement
		const sanitizedValue = inputValue.replace(/[^0-9]/g, '')
	
		// Update the input field with the sanitized value
		jQuery(this).val(sanitizedValue);
	})

	//fixes typing unwanted numbers in number input
	jQuery('input[type="email"]').on('input', function() {
		let inputValue = jQuery(this).val();
	
		// Use a regular expression pattern for valid email characters
		let pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+(?![\/\\])[a-zA-Z]+\.[a-zA-Z]{2,}$/;
	
		// Use a single regular expression test to check if the input is a valid email
		if (!pattern.test(inputValue)) {
			// If not a valid email, remove invalid characters
			let sanitizedInput = inputValue.replace(/[^a-zA-Z0-9._%+-@]/g, '').replace('/', '');
			// Update the input field with the sanitized value
			jQuery(this).val(sanitizedInput.toLowerCase());
		}
	});
	

}; 

const replaceDomainIfDifferent = (sourceUrl, compareUrl) => {

  const source = new URL(sourceUrl);
  const compare = new URL(compareUrl);

  if (source.origin !== compare.origin) {
    source.protocol = compare.protocol;
    source.host = compare.host;
  }

  return source.toString();
};

const countryDropdown = () => {
  const {lang, homeUrl } = dyCoreArgs;
  const available = ['de','en','es','fr','it','ja'];
  const MAX_RETRIES = 5;
  const pluginUrl = replaceDomainIfDifferent(dyCoreArgs.pluginUrl, homeUrl)
  const base = pluginUrl.replace(/\/+$/, '') + '/';

  const fetchCountryCodes = (thisLang, step = 0) => {
    return fetch(`${base}json/countries/${thisLang}.json`)
      .then(resp => {
        if (resp.ok) {
          return resp.json();
        }
        if (step < MAX_RETRIES) {
          // wait 2s, then retry with incremented step
          return new Promise(resolve =>
            setTimeout(
              () => resolve(fetchCountryCodes(thisLang, step + 1)),
              2000
            )
          );
        }
        throw new Error(`"${thisLang}.json" failed after ${step} retries`);
      })
      .then(data => countryOptions(data))
      .catch(err => console.error('countryDropdown error:', err));
  };

  if (jQuery('.countrylist, .countryCallingCode').length > 0) {
    const thisLang = available.includes(lang) ? lang : 'en';
    fetchCountryCodes(thisLang);
  }
}
	

const countryOptions = data => {

	data = data
		.filter(i => i[0] && i[1])
		.sort((a, b) => a[1].localeCompare(b[1]));


	if(jQuery('.countrylist').length > 0)
	{
		renderCountryCodes(({className: 'countrylist', data}));
	}

	if(jQuery('.countryCallingCode').length > 0)
	{
		renderCountryCodes(({className: 'countryCallingCode', data}));
	}
}


const renderCountryCodes = ({className, data}) => {


	if(className === 'countryCallingCode')
	{
		jQuery(`select.${className}`).on('change blur', function() {
			const allSelects = jQuery(this);
		
			allSelects.each(function() {
				const field = jQuery(this);
				const firstOption = field.find('option:eq(0)');
				const selectedOption = field.find('option:selected');
				const text = selectedOption.text();
				const value = selectedOption.val();
		
				if (text && text !== '--') {
					const arrText = text.split(" ");
					if (arrText.length >= 2) {
						const [flag, code] = arrText.slice(-2);
						const modifiedTextContent = `${flag} ${code}`;
							
						firstOption.val(value).text(modifiedTextContent);

						firstOption.prop('selected', true);
					}
				}
			});
		});		
	}


	jQuery(window).on('load', function(){
		jQuery(`.${className}`).each(function() {
			
			const field = jQuery(this);
			const name = jQuery(field).attr('name');
			const hasCountryCallingCodes = jQuery(field).hasClass('countryCallingCode');

			data.forEach(x => {

				const countryFlag = x[3];
				const countryName = x[1];
				const countryCallingCode = x[2];
				const countryCode = x[0];
				const optionText = (hasCountryCallingCodes) 
					? `${countryName} ${countryFlag} +${countryCallingCode}`
					: `${countryName} ${countryFlag}`;

				const optionValue = (hasCountryCallingCodes) ? countryCallingCode : countryCode;
				const thisOption = jQuery('<option></option>').attr({'value': optionValue.replace('-', '')}).html(optionText);
				jQuery(field).append(thisOption);

			});


			if (typeof Storage !== 'undefined')
			{

				const storedValue = sessionStorage.getItem(name);

				if(!storedValue){
					return false;
				}

				jQuery(field).find(`option[value="${storedValue}"]`).prop('selected', true).trigger('change');
			}

		});
	});





	if(className === 'countryCallingCode')
	{
		jQuery(`select.${className}`).on('mousedown', function() {

			const allSelects = jQuery(this);
		
			allSelects.each(function() {
				const field = jQuery(this);
				const firstOption = field.find('option:eq(0)');
				const value = jQuery(firstOption).val();
		
				if (firstOption.text() !== '--') {
					firstOption.val('');
					firstOption.text('--');
					firstOption.trigger('change');

					jQuery(field).find(`option[value="${value}"]`).prop('selected', true);
				}
			});
		
		});		
	}

	

}


const isValidValue = ({ name, value, thisForm }) => {
	if (!value) {
	  return false;
	}
  
	switch (name) {
	  case 'CVV2':
		return isValidCVV(value, jQuery(thisForm).find('input[name="CCNum"]').val());
	  case 'CCNum':
		return isValidCard(value);
	  case 'email':
		return isEmail(value);
	  case 'repeat_email':
		return isEmail(value) && value === jQuery(thisForm).find('input[name="email"]').val();
		case 'country_calling_code':
			return isNumber(value) && parseInt(value) >= 1;
	  case 'inquiry':
		return !isSpam(value);
	  default:
		return true;
	}
  };
  
  const isValidCVV = (value, ccValue) => {
    if (!value || !ccValue) {
        return false;
    }

    // Ensure CVV is numeric
    if (!/^\d+$/.test(value)) {
        return false;
    }

    // Determine card type based on first digit(s)
    let cardType;
    if (/^4/.test(ccValue)) {
        cardType = 'visa';
    } else if (/^5[1-5]/.test(ccValue) || /^2(2[2-9]|[3-6]\d|7[01])/.test(ccValue)) {
        cardType = 'mastercard';
    } else if (/^3[47]/.test(ccValue)) {
        cardType = 'amex';
    } else {
        return false; // Invalid card type
    }

	console.log({cardType})

    // Validate CVV length based on card type
    switch (cardType) {
        case 'visa':
        case 'mastercard':
            return value.length === 3;
        case 'amex':
            return value.length === 4;
        default:
            return false;
    }
};



const isValidCard = value => {
  
	if (/[^0-9-\s]+/.test(value))
	{
		return false;
	}

	let nCheck = 0;
	let bEven = false;
	value = value.replace(/\D/g, null);

	for (let n = value.length - 1; n >= 0; n--)
	{
		let cDigit = value.charAt(n);
		let nDigit = parseInt(cDigit, 10);

		if (bEven && (nDigit *= 2) > 9){
			nDigit -= 9;
		};

		nCheck += nDigit;
		bEven = !bEven;
	}

	return (nCheck % 10) == 0;
}

const isEmail = email => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const isSpam = str => {
	const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
	const domainRegex = /\b(?:https?:\/\/)?(?:www\.)?([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/;
	const urlRegex = /\bhttps?:\/\/[^\s]+\b/;
  
	return (
	  emailRegex.test(str) ||
	  domainRegex.test(str) ||
	  urlRegex.test(str)
	);
}

const isNumber = value => {
	// Check if the value is a number as a string
	if (typeof value === 'string' && !isNaN(Number(value))) {
	  return true;
	}
  
	// Check if the value is a finite number (integer or float)
	if (typeof value === 'number' && isFinite(value)) {
	  return true;
	}
  
	return false;
  }