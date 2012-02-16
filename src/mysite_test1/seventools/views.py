from django.shortcuts import render_to_response
from django.template import Context, RequestContext
from django.http import Http404, HttpResponse
import json
import os.path

def createcards(request):
    return render_to_response('createcards.html',
                              {"foo": "bar"},
                              context_instance=RequestContext(request)) # must include context instance to get STATIC_FILES to work