from django.shortcuts import render_to_response
from django.http import Http404, HttpResponse


def index(request):
    return render_to_response('decision_support_choices.html',locals())

def select_variables(request):
    errors = []
    if request.method == 'POST':
        choices = request.POST.items()
        return render_to_response('decision_support_variables.html',locals())
    raise Http404()

def mappings(request):
    errors = []
    if request.method == 'POST':
        choices = request.POST.items()
        return render_to_response('decision_support_variables.html',locals())
    raise Http404()

