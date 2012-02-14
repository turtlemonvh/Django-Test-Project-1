from django.shortcuts import render_to_response
#===============================================================================
# from django.template import Context
# from django.template.loader import get_template
#===============================================================================
from django.http import Http404, HttpResponse
import datetime
import montecarlo

def home(request):
    return HttpResponse("HOME")

def hello(request):
    return HttpResponse("Hello World!")

def current_datetime(request):
    #===========================================================================
    # now = datetime.datetime.now()
    # t = get_template('current_datetime.html')
    # html = t.render(Context({'current_date':now}))
    # return HttpResponse(html)
    #===========================================================================
    current_date = datetime.datetime.now()
    return render_to_response('current_datetime.html',locals())

def hours_ahead(request, offset):
    try:
        hour_offset = int(offset)
    except ValueError:
        raise Http404()
    next_time = datetime.datetime.now() + datetime.timedelta(hours=hour_offset)
    return render_to_response('hours_ahead.html',locals())

def get_pi(request):
    n_trials = 10
    n_moves = 1000
    pi_list = []
    for i in range(1,n_trials+1):
        pi_list.append(montecarlo.getpi(n_moves))
    return render_to_response('getpi.html',locals())

def display_meta(request):
    values = request.META.items()
    values.sort()
    html = []
    for k, v in values:
        html.append([k, v])
    return render_to_response('meta_display.html',locals())

