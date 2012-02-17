from django.db import models

# Create your models here.
class CardSession(models.Model):
    name = models.CharField(max_length=200)
    
    def __unicode__(self):
        return self.name        

class Card(models.Model):
    name = models.CharField(max_length=200)
    x_coord = models.FloatField()
    y_coord = models.FloatField()
    global_id = models.CharField(max_length=50, unique=True) # rdf id, format is "0000-[session_id]-[card_id]"
    session = models.ForeignKey(CardSession)
    
    def __unicode__(self):
        return u'%s %s' % (self.name, self.global_id)
    
    class Meta:
        ordering = ['global_id']