from django.core.mail import send_mail
from django.http import HttpResponseRedirect, HttpResponse
from django.template import Context, RequestContext
from django.shortcuts import render_to_response
from mysite_test1.contact.forms import ContactForm

def contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            send_mail(
                cd['subject'],
                cd['message'],
                cd.get('email', 'noreply@example.com'),
                ['siteowner@example.com'],
            )
            return HttpResponseRedirect('/contact/thanks/')
    else:
        form = ContactForm(
           initial={'subject': 'I love your site!'}
       )
    return render_to_response('contact_form.html', {'form': form})

def thanks(request):
    return render_to_response('contact_thanks_form.html')

def xhr_test(request):
    if request.is_ajax():
        if request.method == 'GET':
            message = "This is an XHR GET request"
        elif request.method == 'POST':
            message = "This is an XHR POST request"
            # Here we can access the POST data
            print request.POST
    else:
        message = "No XHR"
    return HttpResponse(message)

def ajax_test(request):
    return render_to_response('ajax_test.html',
                              {"foo": "bar"},
                              context_instance=RequestContext(request)) # must include context instance to get STATIC_FILES to work
