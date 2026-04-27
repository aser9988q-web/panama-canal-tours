
const storeFieldNames = ['first_name', 'lastname', 'country_calling_code', 'phone', 'email', 'repeat_email', 'country', 'city', 'address'];

const normalizeUrl = (url) => url.replace(/([^:]\/)\/+/g, '$1');

//refresh page to removed disabled button
window.addEventListener('pageshow', event =>  {
    const historyTraversal = event.persisted;


    if(typeof Storage !== 'undefined')
    {
        if ( historyTraversal && sessionStorage.getItem('last_form_submit_url') === window.location.href ) 
        {
            sessionStorage.removeItem('last_form_submit_url');
            window.location.reload();
        }
    }

});

jQuery(() => {

    storePopulate();
	whatsappButton();
});


const whatsappButton = async () => {

    const modal = jQuery('#dy-whatsapp-modal')
    const qrcode = jQuery('#dy-whatsapp-qrcode')
    const link = jQuery('#dy-whatsapp-link > a')
    let whatsappNumber = ''
    let href = ''


    //closes the modal
    jQuery('#dy-whatsapp-modal-close').click(function(){

        jQuery(modal).toggleClass('hidden');

    });

    jQuery('.button-whatsapp').each(async function(){

        const el = jQuery(this);

        jQuery(el).click(async function(e){

            e.preventDefault();

            if(!whatsappNumber)
            {
                const nonce = await getNonce()
                const dataText = jQuery('title').text().trim()

                if(nonce && nonce.whatsapp_number)
                {
                    whatsappNumber = nonce.whatsapp_number.toString()
                }

                const url = new URL(whatsappNumber, 'https://wa.me')

                if(dataText)
                {
                    url.searchParams.append('text', dataText)
                }
                
                href = url.href
            }

            if(!whatsappNumber) return


            if(/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
            {
                window.location = href;
                return true;;
            }

            jQuery(qrcode).text('');

            new QRCode("dy-whatsapp-qrcode", {
                text: href,
                width: 200,
                height: 200,
                colorDark : "#075e54",
                colorLight : "#dcf8c6",
                correctLevel : QRCode.CorrectLevel.H
            });

            jQuery(link).attr({href});

            jQuery(modal).toggleClass('hidden');

        });
    });

};

const formToArray = form => {
   
    let data = jQuery(form)
        .serializeArray()
        .map(o => {

        let {value} = o;

        if(typeof value === 'string')
        {
            o.value = o.value.trim();
        }

        return o;

     });
    
     jQuery(form).find('input:checkbox').each(function () { 
        const {name, checked: value} = this;

         data.push({ name, value });
     });
 
     jQuery(form).find(':disabled').each(function () { 
        const {name, value} = this;

         data.push({ name, value });
     });
     
     return data;
 };



 const getNonce = async () => {
    const { homeUrl } = dyCoreArgs
    const now = Date.now()
    const url = normalizeUrl(`${homeUrl}/wp-json/dy-core/args?timestamp=${now}`)

    const headers = new Headers({
        'pragma': 'no-cache',
        'cache-control': 'no-cache'
    })

    const init = {
        method: 'GET',
        headers,
    }

    try {
        const response = await fetch(url, init)

        if (!response.ok) {
            let errorBody = ''

            try {
            errorBody = await response.text()
            } catch {
            errorBody = '[unable to read response body]'
            }

            throw new Error(
            `Unable to get nonce from ${url}: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}\n${url}`
            )
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Nonce request failed:', error)
        throw error
    }
}

const handleSubmitButton = form => {
    jQuery(form).find('button').prop('disabled', true);

    if(typeof Storage !== 'undefined')
    {
        sessionStorage.setItem('last_form_submit_url', window.location.href);
    }
    
};

const createFormSubmit = async (form) => {

    //disable button to prevent double-click
    handleSubmitButton(form);

    const {lang} = dyCoreArgs;
	let formFields = formToArray(form);
	const method = String(jQuery(form).attr('data-method')).toLowerCase();
	let action = atob(jQuery(form).attr('data-action'));  
	const nonce = jQuery(form).attr('data-nonce') || '';  
    const hasEmail = (typeof formFields.find(i => i.name === 'email') !== 'undefined') ? true : false;
    let hashParams = jQuery(form).attr('data-hash-params') || '';
    const gclid = (jQuery(form).attr('data-gclid')) ? true : false;

    if(nonce)
    {
        const {dy_nonce} = await getNonce();
        
        if(dy_nonce)
        {
            if(nonce === 'slug')
            {
                action += `/${dy_nonce}`;
            }
            else if(nonce === 'param')
            {
                formFields.push({name: 'dy_nonce', value: dy_nonce});
            }
        }
    }

    if(method === 'post' && hasEmail)
    {

        //lang param
        formFields.push({name: 'lang', value: lang});

        //store contact fields in sesstionStorage
        formFields.forEach(o => {
            const {name, value} = o;
    
            if(storeFieldNames.includes(name) && typeof Storage !== 'undefined')
            {
                sessionStorage.setItem(name, value);
            }
        });

        //tracking cookie params
        [...visitCookies, ...googleAdsCookies].forEach(x => {

            const value = getCookie(x);

            if(value)
            {
                formFields.push({name: x, value: getCookie(x)});
            }
        });
    }

    if(hashParams)
    {
        let hash = '';
        hashParams = hashParams.split(',');

        if(Array.isArray(hashParams))
        {
            hashParams.forEach(v => {
                hash += jQuery(form).find(`[name="${v}"]`).val();
            });
        }

        if(hash)
        {
            formFields.push({name: 'hash', value: sha512(hash)});
        }
    }

    if(gclid)
    {
        const gclidValue = getCookie('gclid');

        if(gclidValue)
        {
            if(method === 'post')
            {
                const actionUrl = new URL(action);
                const {searchParams} = actionUrl;
                searchParams.set('gclid', gclidValue);
                action = actionUrl.toString();
            }
            else if(method === 'get')
            {
                formFields.push({name: 'gclid', value: gclidValue});
            }
        }
    }

    formSubmit({method, action, formFields});
	
};

const formSubmit = ({method, action, formFields}) => {

	const newForm =  document.createElement('form');
	newForm.method = method;
	newForm.action = action;    


    formFields.forEach(i => {
        let input = document.createElement('input');
        input.name = i.name;
        input.value = i.value;
        newForm.appendChild(input);
    });

    //console.log({formFields});

    document.body.appendChild(newForm);

    newForm.submit();
};

const storePopulate = () => {
	
    if(typeof Storage !== 'undefined')
    {
        jQuery('form').each(function(){
            const thisForm = jQuery(this);

            if(jQuery(thisForm).attr('data-action') &&  jQuery(thisForm).attr('data-method'))
            {
                const formFields = formToArray(thisForm);
                
                formFields.forEach(i => {
                    const name = i.name;
                    const value = sessionStorage.getItem(name);
                    const field = jQuery(thisForm).find('[name="'+name+'"]');
                    const tag = jQuery(field).prop('tagName');
                    const type = jQuery(field).attr('type');
                    
                    if(value && storeFieldNames.includes(name))
                    {
                        if(tag == 'INPUT')
                        {
                            if(type == 'checkbox' || type == 'radio')
                            {
                                jQuery(field).prop('checked', true);
                            }
                            else
                            {
                                jQuery(field).val(value);
                            }
                        }
                        else if(tag == 'TEXTAREA' || tag == 'SELECT')
                        {
                            jQuery(field).val(value);
                        }			
                    }
                });
            }
        });
    }
}